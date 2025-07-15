import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { useStatusStore } from './stores/status.store';
import { useStatusPolling } from './hooks/useStatusPolling';

export default function App() {
  useEffect(() => {
    const { apiUrl, setApiUrl } = useStatusStore.getState();
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
