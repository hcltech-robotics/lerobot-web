import { Toast } from 'radix-ui';
import { useToastStore } from '../stores/toast.store';
import { ToastItem } from './ToastItem';

import styles from './ToastProvider.module.css';

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <Toast.Provider swipeDirection="right">
      {toasts?.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
      <Toast.Viewport className={styles.toastViewport} />
    </Toast.Provider>
  );
}
