export type HealthResponse = {
  status: string;
  timestamp: string;
  service: string;
};

export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch('/api/health');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<HealthResponse>;
}
