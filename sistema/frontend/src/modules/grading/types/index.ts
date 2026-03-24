export type { GradingMode, GradeExamInput, GradeExamResult } from '@/service/endpoint/grading';

export interface ReportRow {
  studentIdentifier: string;
  proofNumber: string;
  questionScores: string[];
  totalScore: string;
}
