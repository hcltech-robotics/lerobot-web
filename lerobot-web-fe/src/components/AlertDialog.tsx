import * as BaseAlertDialog from '@radix-ui/react-alert-dialog';

import styles from './AlertDialog.module.css';

type AlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  cancelText?: string;
  actionText?: string;
  onAction?: () => void;
};

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelText = 'Cancel',
  actionText = 'OK',
  onAction,
}: AlertDialogProps) {
  return (
    <BaseAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Overlay className={styles.overlay} />
        <BaseAlertDialog.Content className={styles.content}>
          <BaseAlertDialog.Title className={styles.title}>{title}</BaseAlertDialog.Title>
          <BaseAlertDialog.Description className={styles.description}>{description}</BaseAlertDialog.Description>
          <div className={styles.buttonGroup}>
            <BaseAlertDialog.Cancel asChild>
              <button className={styles.button}>{cancelText}</button>
            </BaseAlertDialog.Cancel>
            <BaseAlertDialog.Action asChild>
              <button className={`${styles.button} ${styles.alert}`} onClick={onAction}>
                {actionText}
              </button>
            </BaseAlertDialog.Action>
          </div>
        </BaseAlertDialog.Content>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  );
}
