import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { useStatusStore } from './stores/status.store';
import { useStatusPolling } from './hooks/useStatusPolling';

export default function App() {
  const apiUrl = useStatusStore((s) => s.apiUrl);
  const setApiUrl = useStatusStore((s) => s.setApiUrl);

  useEffect(() => {
    if (!apiUrl) {
      setApiUrl('http://127.0.0.1:8000');
    }
  }, []);

  useStatusPolling();

  return (
    <>
      <AppRouter />
    </>
  );
}
