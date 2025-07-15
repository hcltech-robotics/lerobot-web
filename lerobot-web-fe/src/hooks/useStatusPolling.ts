import { useEffect } from 'react';
import { getStatus } from '../services/status.service';

export function useStatusPolling(intervalMs = 5000) {
  useEffect(() => {
    getStatus();

    const interval = setInterval(() => {
      getStatus();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
}
