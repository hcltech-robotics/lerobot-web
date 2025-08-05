import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { getCameraList } from './services/camera.service';
import { useConfigStore } from './stores/config.store';

export default function App() {
  const apiUrl = useConfigStore((store) => store.apiUrl);
  const setApiUrl = useConfigStore((store) => store.setApiUrl);

  useEffect(() => {
    if (!apiUrl) {
      setApiUrl('http://127.0.0.1:8000');
      getCameraList();
    }
  }, []);

  return (
    <>
      <AppRouter />
    </>
  );
}
