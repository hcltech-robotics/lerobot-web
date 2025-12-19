import type { PropsWithChildren } from 'react';
import { Tooltip as ReduxTooltip } from 'radix-ui';

import styles from './Tooltip.module.css';

type TooltipProps = PropsWithChildren<{
  content: string;
}>;

export function Tooltip({ children, content }: TooltipProps) {
  return (
    <ReduxTooltip.Provider>
      <ReduxTooltip.Root>
        <ReduxTooltip.Trigger asChild>{children}</ReduxTooltip.Trigger>
        <ReduxTooltip.Portal>
          <ReduxTooltip.Content className={styles.content} sideOffset={25}>
            {content}
            <ReduxTooltip.Arrow className={styles.arrow} />
          </ReduxTooltip.Content>
        </ReduxTooltip.Portal>
      </ReduxTooltip.Root>
    </ReduxTooltip.Provider>
  );
}
