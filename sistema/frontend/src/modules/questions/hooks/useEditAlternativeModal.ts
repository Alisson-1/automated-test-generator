import { useState } from 'react';

interface UseEditAlternativeModalProps {
  initialDescription: string;
  questionId: string;
  altId: string;
  onSave: (questionId: string, altId: string, description: string) => void;
}

export function useEditAlternativeModal({ initialDescription, questionId, altId, onSave }: UseEditAlternativeModalProps) {
  const [description, setDescription] = useState(initialDescription);

  const isValid = !!description.trim() && description.trim() !== initialDescription;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) onSave(questionId, altId, description.trim());
  };

  return { description, setDescription, isValid, handleSubmit };
}
