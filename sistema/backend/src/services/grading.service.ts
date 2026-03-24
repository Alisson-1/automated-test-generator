import { GradeExamDTO, GradeExamResult } from '../types/grading.types';
import { ValidationError } from '../utils/errors';

interface AnswerKeyRow {
  proofNumber: number;
  answers: string[];
}

interface StudentResponseRow {
  studentId: string;
  proofNumber: number;
  answers: string[];
}

interface StudentResult {
  studentId: string;
  proofNumber: number;
  questionScores: number[];
  totalScore: number;
}

function parseAnswerKeyCsv(csv: string): AnswerKeyRow[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const [proofNumStr, ...answers] = line.split(',');
    return {
      proofNumber: parseInt(proofNumStr.trim(), 10),
      answers: answers.map((a) => a.trim()),
    };
  });
}

function parseStudentResponsesCsv(csv: string): StudentResponseRow[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];
  return lines.slice(1).map((line) => {
    const parts = line.split(',');
    return {
      studentId: parts[0]?.trim() ?? '',
      proofNumber: parseInt(parts[1]?.trim() ?? '0', 10),
      answers: parts.slice(2).map((a) => a.trim()),
    };
  });
}

function isLettersMode(allAnswerKeys: string[]): boolean {
  return allAnswerKeys.some((key) => {
    const trimmed = key.trim();
    return trimmed !== '' && isNaN(Number(trimmed));
  });
}

function extractLetters(answer: string): Set<string> {
  const matches = answer.toUpperCase().match(/[A-Z]/g);
  return new Set(matches ?? []);
}

function inferTotalAlternativesLetters(allAnswerKeys: string[]): number {
  let maxIndex = 0;
  for (const key of allAnswerKeys) {
    for (const letter of extractLetters(key)) {
      const idx = letter.charCodeAt(0) - 65;
      if (idx > maxIndex) maxIndex = idx;
    }
  }
  return maxIndex + 1;
}

function inferTotalAlternativesPow2(allAnswerKeys: string[]): number {
  let maxVal = 1;
  for (const key of allAnswerKeys) {
    const val = parseInt(key.trim(), 10);
    if (!isNaN(val) && val > maxVal) maxVal = val;
  }
  return Math.floor(Math.log2(maxVal)) + 1;
}

function scoreLettersStrict(keyAnswer: string, studentAnswer: string): number {
  const keySet = extractLetters(keyAnswer);
  const studentSet = extractLetters(studentAnswer);
  if (keySet.size !== studentSet.size) return 0;
  for (const letter of keySet) {
    if (!studentSet.has(letter)) return 0;
  }
  return 1;
}

function scoreLettersLenient(keyAnswer: string, studentAnswer: string, totalAlts: number): number {
  const keySet = extractLetters(keyAnswer);
  const studentSet = extractLetters(studentAnswer);

  let wrongSelected = 0;
  for (const letter of studentSet) {
    if (!keySet.has(letter)) wrongSelected++;
  }

  let missed = 0;
  for (const letter of keySet) {
    if (!studentSet.has(letter)) missed++;
  }

  const errors = wrongSelected + missed;
  return Math.max(0, (totalAlts - errors) / totalAlts);
}

function scorePow2Strict(keyAnswer: string, studentAnswer: string): number {
  const keyVal = parseInt(keyAnswer.trim(), 10);
  const studentVal = parseInt(studentAnswer.trim(), 10);
  if (isNaN(keyVal) || isNaN(studentVal)) {
    return keyAnswer.trim() === studentAnswer.trim() ? 1 : 0;
  }
  return keyVal === studentVal ? 1 : 0;
}

function scorePow2Lenient(keyAnswer: string, studentAnswer: string, totalAlts: number): number {
  const keyVal = parseInt(keyAnswer.trim(), 10) || 0;
  const studentVal = parseInt(studentAnswer.trim(), 10) || 0;
  const xor = keyVal ^ studentVal;
  let errors = 0;
  let tmp = xor;
  while (tmp > 0) {
    errors += tmp & 1;
    tmp >>>= 1;
  }
  return Math.max(0, (totalAlts - errors) / totalAlts);
}

function buildReportCsv(results: StudentResult[], numQuestions: number, examValue: number): string {
  const scorePerQuestion = examValue / numQuestions;
  const headers = [
    'student_identifier',
    'proof_number',
    ...Array.from({ length: numQuestions }, (_, i) => `q${i + 1}_score`),
    'total_score',
  ];
  const rows = results.map((r) =>
    [
      r.studentId,
      r.proofNumber.toString(),
      ...r.questionScores.map((s) => (s * scorePerQuestion).toFixed(2)),
      r.totalScore.toFixed(2),
    ].join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export class GradingService {
  gradeExam(dto: GradeExamDTO): GradeExamResult {
    const answerKeys = parseAnswerKeyCsv(dto.answerKeyCsv);
    const studentResponses = parseStudentResponsesCsv(dto.studentResponsesCsv);

    if (answerKeys.length === 0) {
      throw new ValidationError('Answer key CSV has no data rows');
    }
    if (studentResponses.length === 0) {
      throw new ValidationError('Student responses CSV has no data rows');
    }

    const numQuestions = answerKeys[0].answers.length;
    if (numQuestions === 0) {
      throw new ValidationError('Answer key CSV has no question columns');
    }

    const examValue = dto.examValue ?? 10;
    const { gradingMode } = dto;

    const allKeyAnswers = answerKeys.flatMap((row) => row.answers);
    const lettersMode = isLettersMode(allKeyAnswers);

    const totalAlts = lettersMode
      ? inferTotalAlternativesLetters(allKeyAnswers)
      : inferTotalAlternativesPow2(allKeyAnswers);

    const keyMap = new Map<number, string[]>();
    for (const entry of answerKeys) {
      keyMap.set(entry.proofNumber, entry.answers);
    }

    const scorePerQuestion = examValue / numQuestions;

    const results: StudentResult[] = studentResponses.map((student) => {
      const proofAnswers = keyMap.get(student.proofNumber);

      if (!proofAnswers) {
        return {
          studentId: student.studentId,
          proofNumber: student.proofNumber,
          questionScores: Array(numQuestions).fill(0) as number[],
          totalScore: 0,
        };
      }

      const questionScores = proofAnswers.map((keyAnswer, i) => {
        const studentAnswer = student.answers[i] ?? '';
        if (lettersMode) {
          return gradingMode === 'strict'
            ? scoreLettersStrict(keyAnswer, studentAnswer)
            : scoreLettersLenient(keyAnswer, studentAnswer, totalAlts);
        }
        return gradingMode === 'strict'
          ? scorePow2Strict(keyAnswer, studentAnswer)
          : scorePow2Lenient(keyAnswer, studentAnswer, totalAlts);
      });

      const totalScore = questionScores.reduce((sum, s) => sum + s * scorePerQuestion, 0);

      return {
        studentId: student.studentId,
        proofNumber: student.proofNumber,
        questionScores,
        totalScore,
      };
    });

    return { reportCsv: buildReportCsv(results, numQuestions, examValue) };
  }
}
