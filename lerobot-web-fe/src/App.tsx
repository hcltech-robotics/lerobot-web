import AppRouter from './routers/AppRouter';
import { useStatusPolling } from './hooks/useStatusPolling';

export default function App() {
  useStatusPolling();

  return (
    <>
      <AppRouter />
    </>
  );
}
