import { useEffect, useState } from 'react';
import { fetchHealth } from '../../../service/endpoint/health';
import type { ApiStatus } from '../types';

export function useApiStatus(): ApiStatus {
  const [status, setStatus] = useState<ApiStatus>({ state: 'loading' });

  useEffect(() => {
    fetchHealth()
      .then((data) =>
        setStatus({ state: 'online', timestamp: data.timestamp, service: data.service }),
      )
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setStatus({ state: 'offline', error: message });
      });
  }, []);

  return status;
}
