export type { Exam, CreateExamInput, UpdateExamInput, IdentifierMode } from '@/service/endpoint/exams';

export interface EditExamTarget {
  examId: string;
  title: string;
  questionIds: string[];
  identifierMode: 'letters' | 'powers-of-2';
}
