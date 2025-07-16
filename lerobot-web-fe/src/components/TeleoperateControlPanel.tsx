import { PlayIcon, StopIcon } from '@radix-ui/react-icons';
import { RobotLeaderSelector } from './RobotLeaderSelector';

import styles from './TeleoperateControlPanel.module.css';

type TeleoperateControlPanelProps = {
  status: string;
  loading: boolean;
  error: string | null;
  isRunning: boolean;
  onToggleTeleoperate: () => void;
};

export function TeleoperateControlPanel({ status, loading, error, isRunning, onToggleTeleoperate }: TeleoperateControlPanelProps) {
  return (
    <div className={styles.controlPanel}>
      <div className={styles.statusBox}>
        <h2 className={styles.statusTitle}>Teleoperation Status</h2>
        <p className={styles.statusText}>{loading ? 'Loading...' : status}</p>
        {error && <p className={styles.errorText}>⚠ Error: {error}</p>}
        <div className={styles.selectWrapper}>
          <RobotLeaderSelector disabled={isRunning} />
        </div>
      </div>

      <button
        className={`${styles.controlButton} ${isRunning ? styles.stop : styles.start}`}
        onClick={onToggleTeleoperate}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className={styles.loader} />
            Loading
          </>
        ) : isRunning ? (
          <>
            <StopIcon className={styles.icon} />
            Stop
          </>
        ) : (
          <>
            <PlayIcon className={styles.icon} />
            Start
          </>
        )}
      </button>
    </div>
  );
}
