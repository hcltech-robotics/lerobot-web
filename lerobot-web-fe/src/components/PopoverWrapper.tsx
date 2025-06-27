import * as Popover from '@radix-ui/react-popover';
import styles from './PopoverWrapper.module.css';
import type { ReactNode } from 'react';

interface PopoverWrapperProps {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}

export default function PopoverWrapper({ trigger, title, children }: PopoverWrapperProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className={styles.popoverContent} onOpenAutoFocus={(e) => e.preventDefault()}>
          <h3 className={styles.popoverTitle}>{title}</h3>
          {children}
          <Popover.Arrow className={styles.popoverArrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
