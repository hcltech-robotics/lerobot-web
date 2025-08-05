import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { useStatusStore } from './stores/status.store';
import { useStatusPolling } from './hooks/useStatusPolling';
import { getCameraList } from './services/status.service';

export default function App() {
  const apiUrl = useStatusStore((store) => store.apiUrl);
  const setApiUrl = useStatusStore((store) => store.setApiUrl);

  useEffect(() => {
    if (!apiUrl) {
      setApiUrl('http://127.0.0.1:8000');
      getCameraList();
    }
  }, []);

  useStatusPolling();

  return (
    <>
      <AppRouter />
    </>
  );
}
