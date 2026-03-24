export type GradingMode = 'strict' | 'lenient';

export interface GradeExamInput {
  answerKeyCsv: string;
  studentResponsesCsv: string;
  gradingMode: GradingMode;
  examValue?: number;
}

export interface GradeExamResult {
  reportCsv: string;
}

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

export const gradingApi = {
  grade: (data: GradeExamInput) =>
    request<GradeExamResult>('/api/grade', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
