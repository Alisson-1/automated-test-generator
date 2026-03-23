import { useState, useCallback, useMemo } from 'react';
import type { Question } from '@/service/endpoint/questions';
import type { CreateExamInput, IdentifierMode } from '../types';
import { computeCombinations, formatCombinations } from './useExams';

interface UseCreateExamModalProps {
  allQuestions: Question[];
  onSave: (data: CreateExamInput) => void;
}

export function useCreateExamModal({ allQuestions, onSave }: UseCreateExamModalProps) {
  const [title, setTitle] = useState('');
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [identifierMode, setIdentifierMode] = useState<IdentifierMode>('letters');
  const [error, setError] = useState<string | null>(null);

  const combinations = useMemo(
    () => computeCombinations(allQuestions, questionIds),
    [allQuestions, questionIds],
  );

  const combinationsLabel = useMemo(() => formatCombinations(combinations), [combinations]);

  const toggleQuestion = useCallback((id: string) => {
    setQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id],
    );
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      if (!title.trim()) {
        setError('Title is required.');
        return;
      }
      if (questionIds.length === 0) {
        setError('Select at least one question.');
        return;
      }
      onSave({ title: title.trim(), questionIds, identifierMode });
    },
    [title, questionIds, identifierMode, onSave],
  );

  return {
    title,
    setTitle,
    questionIds,
    identifierMode,
    setIdentifierMode,
    error,
    combinations,
    combinationsLabel,
    toggleQuestion,
    handleSubmit,
  };
}
