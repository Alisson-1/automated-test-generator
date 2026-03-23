import { useState } from 'react';
import type { CreateQuestionInput, BulkCreateResult } from '../types';

interface UseBulkCreateModalProps {
  onSave: (questions: CreateQuestionInput[]) => Promise<BulkCreateResult | null>;
}

export function useBulkCreateModal({ onSave }: UseBulkCreateModalProps) {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<BulkCreateResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(input);
    } catch {
      setError('Invalid JSON. Please check the format.');
      return;
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
      setError('Input must be a non-empty JSON array of questions.');
      return;
    }

    setSubmitting(true);
    const res = await onSave(parsed as CreateQuestionInput[]);
    setSubmitting(false);
    if (res) setResult(res);
  };

  return { input, setInput, error, result, submitting, handleSubmit };
}
