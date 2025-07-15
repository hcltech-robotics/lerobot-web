import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { useStatusStore } from './stores/status.store';
import StatusPoller from './components/StatusPoller';

export default function App() {
  useEffect(() => {
    const { apiUrl, setApiUrl } = useStatusStore.getState();
    if (!apiUrl) {
      setApiUrl('http://192.168.0.46:80');
    }
  }, []);

  return (
    <>
      <StatusPoller />
      <AppRouter />
    </>
  );
}
