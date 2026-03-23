export type { Alternative, Question, CreateQuestionInput } from '@/service/endpoint/questions';

export interface AlternativeFormItem {
  description: string;
  correct: boolean;
}

export interface EditStatementTarget {
  questionId: string;
  statement: string;
}

export interface EditAlternativeTarget {
  questionId: string;
  altId: string;
  description: string;
}

export interface AddAlternativeTarget {
  questionId: string;
}
