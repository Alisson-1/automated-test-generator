import { useState, useCallback } from 'react';
import type { CreateExamInput, IdentifierMode } from '../types';

interface UseCreateExamModalProps {
  onSave: (data: CreateExamInput) => void;
}

export function useCreateExamModal({ onSave }: UseCreateExamModalProps) {
  const [title, setTitle] = useState('');
  const [questionIds, setQuestionIds] = useState<string[]>([]);
  const [identifierMode, setIdentifierMode] = useState<IdentifierMode>('letters');
  const [error, setError] = useState<string | null>(null);

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
    toggleQuestion,
    handleSubmit,
  };
}
