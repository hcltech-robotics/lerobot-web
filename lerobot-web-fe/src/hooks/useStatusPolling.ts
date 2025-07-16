import { useEffect } from 'react';
import { getStatus } from '../services/status.service';

export function useStatusPolling(intervalMs = 5000) {
  useEffect(() => {
    getStatus().catch(console.error);

    const interval = setInterval(() => {
      getStatus().catch(console.error);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}
