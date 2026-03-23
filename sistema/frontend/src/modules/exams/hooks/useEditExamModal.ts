import { useState, useCallback } from 'react';
import type { UpdateExamInput, IdentifierMode, EditExamTarget } from '../types';

interface UseEditExamModalProps {
  target: EditExamTarget;
  onSave: (examId: string, data: UpdateExamInput) => void;
}

export function useEditExamModal({ target, onSave }: UseEditExamModalProps) {
  const [title, setTitle] = useState(target.title);
  const [questionIds, setQuestionIds] = useState<string[]>(target.questionIds);
  const [identifierMode, setIdentifierMode] = useState<IdentifierMode>(target.identifierMode);
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
      onSave(target.examId, { title: title.trim(), questionIds, identifierMode });
    },
    [title, questionIds, identifierMode, target.examId, onSave],
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
