import { useState } from 'react';

interface UseEditStatementModalProps {
  initialStatement: string;
  questionId: string;
  onSave: (questionId: string, statement: string) => void;
}

export function useEditStatementModal({ initialStatement, questionId, onSave }: UseEditStatementModalProps) {
  const [statement, setStatement] = useState(initialStatement);

  const isValid = !!statement.trim() && statement.trim() !== initialStatement;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (statement.trim()) onSave(questionId, statement.trim());
  };

  return { statement, setStatement, isValid, handleSubmit };
}
