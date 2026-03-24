export type GradingMode = 'strict' | 'lenient';

export interface GradeExamDTO {
  answerKeyCsv: string;
  studentResponsesCsv: string;
  gradingMode: GradingMode;
  examValue?: number;
}

export interface GradeExamResult {
  reportCsv: string;
}
