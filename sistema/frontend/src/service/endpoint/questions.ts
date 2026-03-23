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

export interface CreateQuestionInput {
  statement: string;
  alternatives: { description: string; correct: boolean }[];
}

const BASE = '/api/questions';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json();
  if (!res.ok) throw new Error(body.message ?? `HTTP ${res.status}`);
  return body.data as T;
}

export const questionsApi = {
  getAll: () => request<Question[]>(BASE),

  create: (data: CreateQuestionInput) =>
    request<Question>(BASE, { method: 'POST', body: JSON.stringify(data) }),

  updateStatement: (id: string, statement: string) =>
    request<Question>(`${BASE}/${id}/statement`, {
      method: 'PATCH',
      body: JSON.stringify({ statement }),
    }),

  updateAlternativeDescription: (questionId: string, altId: string, description: string) =>
    request<Question>(`${BASE}/${questionId}/alternatives/${altId}`, {
      method: 'PATCH',
      body: JSON.stringify({ description }),
    }),

  updateAlternatives: (id: string, alternatives: { description: string; correct: boolean }[]) =>
    request<Question>(`${BASE}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ alternatives }),
    }),

  addAlternative: (questionId: string, data: { description: string; correct: boolean }) =>
    request<Question>(`${BASE}/${questionId}/alternatives`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteQuestion: (id: string) =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),

  deleteAlternative: (questionId: string, altId: string) =>
    request<Question>(`${BASE}/${questionId}/alternatives/${altId}`, { method: 'DELETE' }),
};
