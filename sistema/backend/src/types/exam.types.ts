export type IdentifierMode = 'letters' | 'powers-of-2';

export interface Exam {
  id: string;
  title: string;
  questionIds: string[];
  identifierMode: IdentifierMode;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamDTO {
  title: string;
  questionIds: string[];
  identifierMode: IdentifierMode;
}

export interface UpdateExamDTO {
  title?: string;
  questionIds?: string[];
  identifierMode?: IdentifierMode;
}
