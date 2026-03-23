import { useState, useEffect, useCallback, useMemo } from 'react';
import { questionsApi } from '@/service/endpoint/questions';
import type { Question, CreateQuestionInput, BulkCreateResult, EditStatementTarget, EditAlternativeTarget, AddAlternativeTarget } from '../types';

interface Notification {
  message: string;
  type: 'success' | 'error';
}

export function useQuestions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<Notification | null>(null);

  const [editStatementTarget, setEditStatementTarget] = useState<EditStatementTarget | null>(null);
  const [editAlternativeTarget, setEditAlternativeTarget] = useState<EditAlternativeTarget | null>(null);
  const [addAlternativeTarget, setAddAlternativeTarget] = useState<AddAlternativeTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Question | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showBulkCreate, setShowBulkCreate] = useState(false);

  const notify = useCallback((message: string, type: Notification['type'] = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const load = useCallback(async () => {
    try {
      const data = await questionsApi.getAll();
      setQuestions(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredQuestions = useMemo(
    () =>
      questions.filter((q) =>
        q.statement.toLowerCase().includes(search.toLowerCase()),
      ),
    [questions, search],
  );

  const handleCreateQuestion = useCallback(async (data: CreateQuestionInput) => {
    notify('Saving...');
    try {
      const created = await questionsApi.create(data);
      setQuestions((prev) => [...prev, created]);
      setShowCreate(false);
      notify('Question created!');
    } catch (e: unknown) {
      notify((e as Error).message ?? 'Failed to create question', 'error');
    }
  }, [notify]);

  const handleUpdateStatement = useCallback(async (questionId: string, statement: string) => {
    notify('Updating...');
    try {
      const updated = await questionsApi.updateStatement(questionId, statement);
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)));
      setEditStatementTarget(null);
      notify('Statement updated!');
    } catch (e: unknown) {
      notify((e as Error).message ?? 'Failed to update', 'error');
    }
  }, [notify]);

  const handleUpdateAlternativeDescription = useCallback(
    async (questionId: string, altId: string, description: string) => {
      notify('Updating...');
      try {
        const updated = await questionsApi.updateAlternativeDescription(questionId, altId, description);
        setQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)));
        setEditAlternativeTarget(null);
        notify('Alternative updated!');
      } catch (e: unknown) {
        notify((e as Error).message ?? 'Failed to update', 'error');
      }
    },
    [notify],
  );

  const handleToggleCorrect = useCallback(async (question: Question, altId: string) => {
    const alt = question.alternatives.find((a) => a.id === altId);
    if (!alt || alt.correct) return;

    const alternatives = question.alternatives.map((a) => ({
      description: a.description,
      correct: a.id === altId,
    }));

    notify('Updating...');
    try {
      const updated = await questionsApi.updateAlternatives(question.id, alternatives);
      setQuestions((prev) => prev.map((q) => (q.id === question.id ? updated : q)));
      notify('Alternative updated!');
    } catch (e: unknown) {
      notify((e as Error).message ?? 'Failed to update', 'error');
    }
  }, [notify]);

  const handleDeleteQuestion = useCallback(async (questionId: string) => {
    notify('Deleting...');
    try {
      await questionsApi.deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      setDeleteTarget(null);
      notify('Question deleted!');
    } catch (e: unknown) {
      notify((e as Error).message ?? 'Failed to delete', 'error');
    }
  }, [notify]);

  const handleAddAlternative = useCallback(
    async (questionId: string, description: string, correct: boolean) => {
      notify('Saving...');
      try {
        const updated = await questionsApi.addAlternative(questionId, { description, correct });
        setQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)));
        setAddAlternativeTarget(null);
        notify('Alternative added!');
      } catch (e: unknown) {
        notify((e as Error).message ?? 'Failed to add alternative', 'error');
      }
    },
    [notify],
  );

  const handleBulkCreate = useCallback(async (questions: CreateQuestionInput[]): Promise<BulkCreateResult | null> => {
    notify('Importing...');
    try {
      const result = await questionsApi.bulkCreate(questions);
      if (result.created.length > 0) {
        setQuestions((prev) => [...prev, ...result.created]);
      }
      notify(`${result.created.length} question(s) imported!`);
      return result;
    } catch (e: unknown) {
      notify((e as Error).message ?? 'Failed to import questions', 'error');
      return null;
    }
  }, [notify]);

  const handleDeleteAlternative = useCallback(async (question: Question, altId: string) => {
    const alt = question.alternatives.find((a) => a.id === altId);
    if (!alt) return;

    if (alt.correct) {
      notify('Cannot remove the correct alternative', 'error');
      return;
    }
    if (question.alternatives.length <= 2) {
      notify('The question must have at least 2 alternatives', 'error');
      return;
    }

    notify('Deleting...');
    try {
      const updated = await questionsApi.deleteAlternative(question.id, altId);
      setQuestions((prev) => prev.map((q) => (q.id === question.id ? updated : q)));
      notify('Alternative deleted!');
    } catch (e: unknown) {
      notify((e as Error).message ?? 'Failed to delete', 'error');
    }
  }, [notify]);

  return {
    questions: filteredQuestions,
    totalCount: questions.length,
    loading,
    search,
    setSearch,
    notification,

    showCreate,
    setShowCreate,
    showBulkCreate,
    setShowBulkCreate,
    editStatementTarget,
    setEditStatementTarget,
    editAlternativeTarget,
    setEditAlternativeTarget,
    addAlternativeTarget,
    setAddAlternativeTarget,
    deleteTarget,
    setDeleteTarget,

    handleCreateQuestion,
    handleBulkCreate,
    handleAddAlternative,
    handleUpdateStatement,
    handleUpdateAlternativeDescription,
    handleToggleCorrect,
    handleDeleteQuestion,
    handleDeleteAlternative,
  };
}
