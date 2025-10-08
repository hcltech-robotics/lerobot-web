import { PauseIcon, ReloadIcon, StopIcon } from '@radix-ui/react-icons';

import styles from './ControlButtons.module.css';

export function ControlButtons({ onPause, onRetry, onStop }: { onPause: () => void; onRetry: () => void; onStop: () => void }) {
  return (
    <div className={styles.controls}>
      <button className={styles.controlButton} onClick={onPause}>
        <PauseIcon className={styles.icon} />
      </button>
      <button className={styles.controlButton} onClick={onRetry}>
        <ReloadIcon className={styles.icon} />
      </button>
      <button className={`${styles.controlButton} ${styles.stop}`} onClick={onStop}>
        <StopIcon className={styles.icon} />
      </button>
    </div>
  );
}
