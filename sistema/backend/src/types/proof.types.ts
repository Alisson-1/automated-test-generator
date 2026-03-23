export interface ProofHeader {
  discipline: string;
  teacher: string;
  date: string;
  institution?: string;
  examValue?: string;
  logoBase64?: string;
}

export interface GenerateProofsDTO {
  count: number;
  header: ProofHeader;
}

export interface GenerateProofsResult {
  pdf: string;
  csv: string;
}
