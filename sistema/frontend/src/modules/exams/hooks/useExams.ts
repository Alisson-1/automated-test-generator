import { useState, useEffect, useCallback, useMemo } from 'react';
import { examsApi } from '@/service/endpoint/exams';
import { questionsApi } from '@/service/endpoint/questions';
import type { Question } from '@/service/endpoint/questions';
import type { Exam, CreateExamInput, UpdateExamInput, EditExamTarget } from '../types';

interface Notification {
  message: string;
  type: 'success' | 'error';
}

function factorial(n: bigint): bigint {
  if (n <= 1n) return 1n;
  return n * factorial(n - 1n);
}

export function computeCombinations(allQuestions: Question[], questionIds: string[]): bigint {
  const selected = questionIds
    .map((id) => allQuestions.find((q) => q.id === id))
    .filter((q): q is Question => q !== undefined);
  if (selected.length === 0) return 0n;
  let result = factorial(BigInt(selected.length));
  for (const q of selected) {
    result *= factorial(BigInt(q.alternatives.length));
  }
  return result;
}

export function formatCombinations(n: bigint): string {
  if (n === 0n) return '0';
  const s = n.toString();
  if (s.length <= 15) {
    return Number(n).toLocaleString('en-US');
  }
  const exp = s.length - 1;
  const mantissa = `${s[0]}.${s.slice(1, 4)}`;
  return `~${mantissa} × 10^${exp}`;
}

export function useExams() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);

  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<EditExamTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);
  const [generateTarget, setGenerateTarget] = useState<Exam | null>(null);

  const notify = useCallback((message: string, type: Notification['type'] = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const load = useCallback(async () => {
    try {
      const [examsData, questionsData] = await Promise.all([
        examsApi.getAll(),
        questionsApi.getAll(),
      ]);
      setExams(examsData);
      setAllQuestions(questionsData);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredExams = useMemo(
    () => exams.filter((e) => e.title.toLowerCase().includes(search.toLowerCase())),
    [exams, search],
  );

  const handleCreateExam = useCallback(
    async (data: CreateExamInput) => {
      notify('Saving...');
      try {
        const created = await examsApi.create(data);
        setExams((prev) => [...prev, created]);
        setShowCreate(false);
        notify('Exam created!');
      } catch (e: unknown) {
        notify((e as Error).message ?? 'Failed to create exam', 'error');
      }
    },
    [notify],
  );

  const handleUpdateExam = useCallback(
    async (examId: string, data: UpdateExamInput) => {
      notify('Updating...');
      try {
        const updated = await examsApi.update(examId, data);
        setExams((prev) => prev.map((e) => (e.id === examId ? updated : e)));
        setEditTarget(null);
        notify('Exam updated!');
      } catch (e: unknown) {
        notify((e as Error).message ?? 'Failed to update exam', 'error');
      }
    },
    [notify],
  );

  const handleDeleteExam = useCallback(
    async (examId: string) => {
      notify('Deleting...');
      try {
        await examsApi.delete(examId);
        setExams((prev) => prev.filter((e) => e.id !== examId));
        setDeleteTarget(null);
        notify('Exam deleted!');
      } catch (e: unknown) {
        notify((e as Error).message ?? 'Failed to delete exam', 'error');
      }
    },
    [notify],
  );

  return {
    exams: filteredExams,
    totalCount: exams.length,
    allQuestions,
    loading,
    search,
    setSearch,
    notification,
    notify,
    showCreate,
    setShowCreate,
    editTarget,
    setEditTarget,
    deleteTarget,
    setDeleteTarget,
    generateTarget,
    setGenerateTarget,
    handleCreateExam,
    handleUpdateExam,
    handleDeleteExam,
  };
}
