import { Tabs } from 'radix-ui';
import type { ReactNode } from 'react';

import styles from './TabsWrapper.module.css';

interface TabItem {
  label: string;
  value: string;
  content: ReactNode;
}

interface TabsWrapperProps {
  items: TabItem[];
  defaultValue?: string;
}

export const TabsWrapper = ({ items, defaultValue }: TabsWrapperProps) => {
  if (items.length === 0) return null;

  const initialValue: string = defaultValue ?? (items[0] as TabItem).value;

  return (
    <Tabs.Root className={styles.Root} defaultValue={initialValue}>
      <Tabs.List className={styles.list}>
        {items.map((item) => (
          <Tabs.Trigger key={item.value} className={styles.trigger} value={item.value}>
            {item.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {items.map((item) => (
        <Tabs.Content key={item.value} className={styles.content} value={item.value}>
          {item.content}
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
};
