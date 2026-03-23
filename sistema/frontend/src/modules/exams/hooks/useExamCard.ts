import { useCallback, useMemo } from 'react';
import type { Question } from '@/service/endpoint/questions';
import type { Exam } from '../types';
import { computeCombinations, formatCombinations } from './useExams';

export function useExamCard(exam: Exam, allQuestions: Question[]) {
  const combinations = useMemo(
    () => computeCombinations(allQuestions, exam.questionIds),
    [allQuestions, exam.questionIds],
  );

  const combinationsLabel = useMemo(() => formatCombinations(combinations), [combinations]);

  const formatDate = useCallback((dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }, []);

  return { combinations, combinationsLabel, formatDate };
}
