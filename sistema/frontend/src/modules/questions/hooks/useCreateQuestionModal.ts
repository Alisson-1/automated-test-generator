import { useState } from 'react';
import type { AlternativeFormItem, CreateQuestionInput } from '../types';

const emptyAlternative = (): AlternativeFormItem => ({ description: '', correct: false });

interface UseCreateQuestionModalProps {
  onSave: (data: CreateQuestionInput) => void;
}

export function useCreateQuestionModal({ onSave }: UseCreateQuestionModalProps) {
  const [statement, setStatement] = useState('');
  const [alternatives, setAlternatives] = useState<AlternativeFormItem[]>([
    emptyAlternative(),
    emptyAlternative(),
  ]);
  const [error, setError] = useState<string | null>(null);

  const updateAlternative = (index: number, patch: Partial<AlternativeFormItem>) => {
    setAlternatives((prev) => prev.map((a, i) => (i === index ? { ...a, ...patch } : a)));
  };

  const setCorrectAlternative = (index: number) => {
    setAlternatives((prev) => prev.map((a, idx) => ({ ...a, correct: idx === index })));
  };

  const addAlternative = () => {
    setAlternatives((prev) => [...prev, emptyAlternative()]);
  };

  const removeAlternative = (index: number) => {
    setAlternatives((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!statement.trim()) {
      setError('Statement is required.');
      return;
    }
    if (alternatives.length < 2) {
      setError('The question must have at least 2 alternatives.');
      return;
    }
    if (alternatives.some((a) => !a.description.trim())) {
      setError('All alternatives must have a description.');
      return;
    }
    if (alternatives.filter((a) => a.correct).length !== 1) {
      setError('Select exactly one correct alternative.');
      return;
    }
    const descriptions = alternatives.map((a) => a.description.trim().toLowerCase());
    if (descriptions.length !== new Set(descriptions).size) {
      setError('Alternatives must have unique descriptions.');
      return;
    }

    onSave({
      statement: statement.trim(),
      alternatives: alternatives.map((a) => ({ description: a.description.trim(), correct: a.correct })),
    });
  };

  return {
    statement,
    setStatement,
    alternatives,
    error,
    updateAlternative,
    setCorrectAlternative,
    addAlternative,
    removeAlternative,
    handleSubmit,
  };
}
