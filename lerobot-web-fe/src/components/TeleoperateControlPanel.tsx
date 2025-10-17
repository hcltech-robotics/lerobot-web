import { useEffect, useState } from 'react';
import { PlayIcon, StopIcon } from '@radix-ui/react-icons';
import { useRobotStore } from '../stores/robot.store';
import { validateRobots } from '../services/robot.service';

import styles from './TeleoperateControlPanel.module.css';

type TeleoperateControlPanelProps = {
  status: string;
  loading: boolean;
  error: string | null;
  isRunning: boolean;
  onToggleTeleoperate: () => void;
};

export function TeleoperateControlPanel({ status, loading, error, isRunning, onToggleTeleoperate }: TeleoperateControlPanelProps) {
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);
  const robots = useRobotStore((store) => store.robots);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  useEffect(() => {
    const isValid = validateRobots(robots, isBimanualMode);
    setIsDisabled(!isValid);
  }, [isBimanualMode, robots]);

  return (
    <div className={styles.statusBox}>
      <h2 className={styles.statusTitle}>Teleoperation Status</h2>
      {!isDisabled ? (
        <p className={styles.statusText}>{loading ? 'Loading...' : status}</p>
      ) : (
        <p className={styles.statusText}>Select a leader and a follower arm in the top right corner</p>
      )}
      {error && <p className={styles.errorText}>⚠ Error: {error}</p>}
      <button
        className={`${styles.controlButton} ${isRunning ? styles.stop : styles.start}`}
        onClick={onToggleTeleoperate}
        disabled={isDisabled || loading}
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
