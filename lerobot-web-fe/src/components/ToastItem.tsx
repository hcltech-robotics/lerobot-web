import { useState } from 'react';
import { Toast } from 'radix-ui';
import { CheckCircledIcon, ExclamationTriangleIcon, InfoCircledIcon } from '@radix-ui/react-icons';
import { ToastType } from '../stores/toast.store';
import type { ToastItemProps } from '../models/general.model';

import styles from './ToastItem.module.css';

const iconFor = (type: ToastType) => {
  switch (type) {
    case ToastType.Success:
      return <CheckCircledIcon />;
    case ToastType.Error:
    case ToastType.Warning:
      return <ExclamationTriangleIcon />;
    case ToastType.Info:
    default:
      return <InfoCircledIcon />;
  }
};

export function ToastItem({ toast, onRemove }: ToastItemProps) {
  const { id, type, title, description, duration, animation } = toast;
  const [open, setOpen] = useState(true);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) onRemove(id);
  };

  const typeClass =
    type === ToastType.Success
      ? styles.success
      : type === ToastType.Error
        ? styles.error
        : type === ToastType.Warning
          ? styles.warning
          : styles.info;

  const animClass = animation === 'fadeIn' ? styles.fadeIn : styles.slideInRight;

  return (
    <Toast.Root
      key={id}
      open={open}
      onOpenChange={handleOpenChange}
      duration={duration ?? 3000}
      className={`${styles.toast} ${typeClass} ${animClass}`}
    >
      <div className={styles.head}>
        {title && (
          <Toast.Title className={styles.title}>
            <span className={styles.icon}>{iconFor(type)}</span>
            {title}
          </Toast.Title>
        )}
        <Toast.Close className={styles.toastClose} aria-label="Close">
          ×
        </Toast.Close>
      </div>

      <hr className={styles.separator} />

      {description && (
        <div className={styles.body}>
          <Toast.Description>{description}</Toast.Description>
        </div>
      )}
    </Toast.Root>
  );
}
