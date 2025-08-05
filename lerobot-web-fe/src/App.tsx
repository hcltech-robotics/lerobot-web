import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { getCameraList } from './services/camera.service';
import { useConfigStore } from './stores/config.store';

export default function App() {
  const apiUrl = useConfigStore((store) => store.apiUrl);

  useEffect(() => {
    if (apiUrl) {
      getCameraList();
    }
  }, []);

  return (
    <>
      <AppRouter />
    </>
  );
}
