import { useEffect } from 'react';
import { getStatus } from '../services/status.service';

export default function StatusPoller() {
  useEffect(() => {
    getStatus();

    const interval = setInterval(() => {
      getStatus();
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
