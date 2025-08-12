import { useEffect, useState } from 'react';
import { PlayIcon, StopIcon } from '@radix-ui/react-icons';
import { RobotLeaderSelector } from './RobotLeaderSelector';
import { useRobotStore } from '../stores/robot.store';
import { robotSideList } from '../models/robot.model';
import { getLeaderBySide } from '../services/robot.service';

import styles from './TeleoperateControlPanel.module.css';

type TeleoperateControlPanelProps = {
  status: string;
  loading: boolean;
  error: string | null;
  isRunning: boolean;
  isLeaderSelected: boolean;
  onToggleTeleoperate: () => void;
};

export function TeleoperateControlPanel({
  status,
  loading,
  error,
  isRunning,
  isLeaderSelected,
  onToggleTeleoperate,
}: TeleoperateControlPanelProps) {
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);
  const robotlist = useRobotStore((store) => store.robots);
  const [leftOptions, setLeftOptions] = useState<string[]>([]);
  const [rightOptions, setRightOptions] = useState<string[]>([]);

  useEffect(() => {
    if (robotlist) {
      const left = getLeaderBySide(robotlist, robotSideList.LEFT);
      const right = getLeaderBySide(robotlist, robotSideList.RIGHT);

      setLeftOptions(left);
      setRightOptions(right);
    }
  }, [isBimanualMode, robotlist]);

  return (
    <div className={styles.controlPanel}>
      <div className={styles.statusBox}>
        <h2 className={styles.statusTitle}>Teleoperation Status</h2>
        <p className={styles.statusText}>{loading ? 'Loading...' : status}</p>
        {error && <p className={styles.errorText}>⚠ Error: {error}</p>}
        <div className={styles.selectWrapper}>
          <RobotLeaderSelector
            robotList={leftOptions}
            label={isBimanualMode ? 'Select a leader for left' : 'Select a leader'}
            disabled={isRunning}
          />
          {isBimanualMode && <RobotLeaderSelector robotList={rightOptions} label="Select a leader for right" disabled={isRunning} />}
        </div>
      </div>

      <button
        className={`${styles.controlButton} ${isRunning ? styles.stop : styles.start}`}
        onClick={onToggleTeleoperate}
        disabled={!isLeaderSelected || loading}
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
