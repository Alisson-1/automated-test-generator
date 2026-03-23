import { useState } from 'react';

interface UseAddAlternativeModalProps {
  questionId: string;
  onSave: (questionId: string, description: string, correct: boolean) => void;
}

export function useAddAlternativeModal({ questionId, onSave }: UseAddAlternativeModalProps) {
  const [description, setDescription] = useState('');
  const [correct, setCorrect] = useState(false);

  const isValid = !!description.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) onSave(questionId, description.trim(), correct);
  };

  return { description, setDescription, correct, setCorrect, isValid, handleSubmit };
}
