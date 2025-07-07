import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { initializeStoresFromLocalStorage } from './stores/init.store';
import { API_URL_KEY } from './models/status.model';

export default function App() {
  useEffect(() => {
    localStorage.setItem(API_URL_KEY, 'http://127.0.0.1:8000');
    initializeStoresFromLocalStorage();
  }, []);

  return <AppRouter />;
}
