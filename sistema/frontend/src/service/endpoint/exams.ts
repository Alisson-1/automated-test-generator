export type IdentifierMode = 'letters' | 'powers-of-2';

export interface Exam {
  id: string;
  title: string;
  questionIds: string[];
  identifierMode: IdentifierMode;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamInput {
  title: string;
  questionIds: string[];
  identifierMode: IdentifierMode;
}

export interface UpdateExamInput {
  title?: string;
  questionIds?: string[];
  identifierMode?: IdentifierMode;
}

const BASE = '/api/exams';

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

export const examsApi = {
  getAll: () => request<Exam[]>(BASE),

  getById: (id: string) => request<Exam>(`${BASE}/${id}`),

  create: (data: CreateExamInput) =>
    request<Exam>(BASE, { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdateExamInput) =>
    request<Exam>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  delete: (id: string) =>
    request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
};
