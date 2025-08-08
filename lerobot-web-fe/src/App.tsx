import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { getCameraList } from './services/camera.service';
import { useConfigStore } from './stores/config.store';
import { getRobotList } from './services/robot.service';

export default function App() {
  const apiUrl = useConfigStore((store) => store.apiUrl);

  useEffect(() => {
    if (apiUrl) {
      getCameraList();
      getRobotList();
    }
  }, []);

  return (
    <>
      <AppRouter />
    </>
  );
}
