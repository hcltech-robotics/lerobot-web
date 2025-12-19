import { PauseIcon, ReloadIcon, StopIcon } from '@radix-ui/react-icons';
import { Tooltip } from './Tooltip';

import styles from './ControlButtons.module.css';

export function ControlButtons({ onPause, onRetry, onStop }: { onPause: () => void; onRetry: () => void; onStop: () => void }) {
  return (
    <div className={styles.controls}>
      <button className={styles.controlButton} onClick={onPause}>
        <Tooltip content="Pause">
          <PauseIcon className={styles.icon} />
        </Tooltip>
      </button>
      <button className={styles.controlButton} onClick={onRetry}>
        <Tooltip content="Retry">
          <ReloadIcon className={styles.icon} />
        </Tooltip>
      </button>
      <button className={`${styles.controlButton} ${styles.stop}`} onClick={onStop}>
        <Tooltip content="Stop">
          <StopIcon className={styles.icon} />
        </Tooltip>
      </button>
    </div>
  );
}
