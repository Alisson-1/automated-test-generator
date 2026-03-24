import { useState, useCallback, useMemo } from 'react';
import { gradingApi } from '@/service/endpoint/grading';
import type { GradingMode, ReportRow } from '../types';

interface Notification {
  message: string;
  type: 'success' | 'error';
}

function parseCsv(csv: string): string[][] {
  return csv
    .trim()
    .split('\n')
    .map((line) => line.split(','));
}

function buildReportRows(csv: string): { headers: string[]; rows: ReportRow[] } {
  const lines = parseCsv(csv);
  if (lines.length < 2) return { headers: [], rows: [] };

  const [headerLine, ...dataLines] = lines;
  const questionCols = headerLine.slice(2, -1);
  const headers = ['Student', 'Proof #', ...questionCols, 'Total'];

  const rows: ReportRow[] = dataLines.map((cols) => ({
    studentIdentifier: cols[0] ?? '',
    proofNumber: cols[1] ?? '',
    questionScores: cols.slice(2, -1),
    totalScore: cols[cols.length - 1] ?? '',
  }));

  return { headers, rows };
}

export function useGrading() {
  const [answerKeyCsv, setAnswerKeyCsv] = useState('');
  const [studentResponsesCsv, setStudentResponsesCsv] = useState('');
  const [gradingMode, setGradingMode] = useState<GradingMode>('strict');
  const [examValueStr, setExamValueStr] = useState('');

  const [reportCsv, setReportCsv] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);

  const notify = useCallback((message: string, type: Notification['type'] = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const handleAnswerKeyFile = useCallback((file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setAnswerKeyCsv((e.target?.result as string) ?? '');
    reader.readAsText(file);
  }, []);

  const handleStudentResponsesFile = useCallback((file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setStudentResponsesCsv((e.target?.result as string) ?? '');
    reader.readAsText(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!answerKeyCsv.trim()) {
      notify('Please provide the answer key CSV.', 'error');
      return;
    }
    if (!studentResponsesCsv.trim()) {
      notify('Please provide the student responses CSV.', 'error');
      return;
    }

    const examValue = examValueStr.trim() ? Number(examValueStr) : undefined;
    if (examValue !== undefined && (isNaN(examValue) || examValue <= 0)) {
      notify('Exam value must be a positive number.', 'error');
      return;
    }

    setLoading(true);
    setReportCsv(null);

    try {
      const result = await gradingApi.grade({
        answerKeyCsv,
        studentResponsesCsv,
        gradingMode,
        examValue,
      });
      setReportCsv(result.reportCsv);
      notify('Grading complete!');
    } catch (e: unknown) {
      notify((e as Error).message ?? 'Failed to grade exam.', 'error');
    } finally {
      setLoading(false);
    }
  }, [answerKeyCsv, studentResponsesCsv, gradingMode, examValueStr, notify]);

  const handleDownload = useCallback(() => {
    if (!reportCsv) return;
    const blob = new Blob([reportCsv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grade_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [reportCsv]);

  const report = useMemo(
    () => (reportCsv ? buildReportRows(reportCsv) : null),
    [reportCsv],
  );

  return {
    answerKeyCsv,
    setAnswerKeyCsv,
    studentResponsesCsv,
    setStudentResponsesCsv,
    gradingMode,
    setGradingMode,
    examValueStr,
    setExamValueStr,
    handleAnswerKeyFile,
    handleStudentResponsesFile,
    handleSubmit,
    handleDownload,
    loading,
    notification,
    report,
  };
}
