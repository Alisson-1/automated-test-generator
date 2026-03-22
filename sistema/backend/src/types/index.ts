// ── Alternatives & Questions ──────────────────────────────────────────────────

export interface Alternative {
  id: string;
  text: string;
  correct: boolean;
}

export interface Question {
  id: string;
  statement: string;
  alternatives: Alternative[];
  createdAt: Date;
  updatedAt: Date;
}

export type CreateQuestionDTO = Omit<Question, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateQuestionDTO = Partial<CreateQuestionDTO>;

// ── Exams ─────────────────────────────────────────────────────────────────────

export type IdentifierMode = 'letters' | 'powers-of-2';

export interface Exam {
  id: string;
  title: string;
  questionIds: string[];
  identifierMode: IdentifierMode;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateExamDTO = Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateExamDTO = Partial<CreateExamDTO>;

// ── Proofs (individual exam instances) ───────────────────────────────────────

export interface ProofAlternative {
  id: string;
  text: string;
  identifier: string; // letter (e.g. "A") or power-of-2 (e.g. "4")
}

export interface ProofQuestion {
  originalId: string;
  statement: string;
  alternatives: ProofAlternative[];
  answerKey: string; // comma-separated letters OR numeric sum
}

export interface Proof {
  proofNumber: number;
  examId: string;
  questions: ProofQuestion[];
  createdAt: Date;
}

// ── Grading ───────────────────────────────────────────────────────────────────

export type GradingMode = 'strict' | 'lenient';

export interface StudentAnswer {
  proofNumber: number;
  studentName: string;
  studentId: string; // CPF
  answers: string[]; // one per question, same format as answer key
}

export interface QuestionResult {
  questionIndex: number;
  expected: string;
  given: string;
  score: number; // 0.0 – 1.0
}

export interface StudentResult {
  proofNumber: number;
  studentName: string;
  studentId: string;
  questionResults: QuestionResult[];
  totalScore: number;
}
