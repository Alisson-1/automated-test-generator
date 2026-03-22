export interface Alternative {
  id: string;
  description: string;
  correct: boolean;
}

export interface Question {
  id: string;
  statement: string;
  alternatives: Alternative[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDTO {
  statement: string;
  alternatives: { description: string; correct: boolean }[];
}
