import * as RadixAlertDialog from '@radix-ui/react-alert-dialog';

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
    <RadixAlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixAlertDialog.Portal>
        <RadixAlertDialog.Overlay className={styles.overlay} />
        <RadixAlertDialog.Content className={styles.content}>
          <RadixAlertDialog.Title className={styles.title}>{title}</RadixAlertDialog.Title>
          <RadixAlertDialog.Description className={styles.description}>{description}</RadixAlertDialog.Description>
          <div className={styles.buttonGroup}>
            <RadixAlertDialog.Cancel asChild>
              <button className={styles.button}>{cancelText}</button>
            </RadixAlertDialog.Cancel>
            <RadixAlertDialog.Action asChild>
              <button className={`${styles.button} ${styles.alert}`} onClick={onAction}>
                {actionText}
              </button>
            </RadixAlertDialog.Action>
          </div>
        </RadixAlertDialog.Content>
      </RadixAlertDialog.Portal>
    </RadixAlertDialog.Root>
  );
}
