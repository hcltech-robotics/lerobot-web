import { PlayIcon, StopIcon } from '@radix-ui/react-icons';
import Selector from './Selector';
import type { RobotIds } from '../models/teleoperate.model';

import styles from './TeleoperateControlPanel.module.css';

type TeleoperateControlPanelProps = {
  status: string;
  loading: boolean;
  error: string | null;
  isRunning: boolean;
  robotIds: RobotIds;
  onChangeRobotId: (id: string) => void;
  onToggleTeleoperate: () => void;
};

export function TeleoperateControlPanel({
  status,
  loading,
  error,
  isRunning,
  robotIds,
  onChangeRobotId,
  onToggleTeleoperate,
}: TeleoperateControlPanelProps) {
  return (
    <div className={styles.controlPanel}>
      <div className={styles.statusBox}>
        <h2 className={styles.statusTitle}>Teleoperation Status</h2>
        <p className={styles.statusText}>{loading ? 'Loading...' : status}</p>
        {error && <p className={styles.errorText}>⚠ Error: {error}</p>}
        <div className={styles.selectWrapper}>
          <Selector
            label="Select a Leader Robot"
            value={robotIds.leader}
            onChange={onChangeRobotId}
            disabled={isRunning}
            options={[
              { label: 'ID 0', value: '0' },
              { label: 'ID 1', value: '1' },
            ]}
          />
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
