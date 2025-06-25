import { useMemo, useState } from 'react';
import { PlayIcon, StopIcon } from '@radix-ui/react-icons';
import { sleepPosition, startTeleoperate, stopTeleoperate } from '../services/teleoperate.service';
import { teleoperateStatusList, type RobotIds } from '../models/teleoperate.model';
import Selector from './Selector';

import styles from './Teleoperate.module.css';

export default function Teleoperate() {
  const [status, setStatus] = useState<string>(teleoperateStatusList.READY);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [robotIds, setRobotIds] = useState<RobotIds>({ leader: '0', follower: '1' });

  const isRunning = useMemo(() => status === teleoperateStatusList.RUN, [status]);

  const handleTeleoperate = async () => {
    setLoading(true);
    setError(null);

    try {
      let statusResponse: string;

      if (isRunning) {
        await stopTeleoperate();
        const response = await sleepPosition(robotIds.follower);
        statusResponse = response.status;
      } else {
        const response = await startTeleoperate({ leader: robotIds.leader, follower: robotIds.follower });
        statusResponse = response.status;
      }

      setStatus(statusResponse === teleoperateStatusList.OK ? (isRunning ? teleoperateStatusList.READY : teleoperateStatusList.RUN) : statusResponse);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleRobotId = (id: string) => {
    const followerId = id === '0' ? '1' : '0';
    setRobotIds({
      leader: id,
      follower: followerId,
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.statusBox}>
        <h2 className={styles.statusTitle}>Teleoperation Status</h2>
        <p className={styles.statusText}>{loading ? 'Loading...' : status}</p>
        {error && <p className={styles.errorText}>⚠ Error: {error}</p>}
        <div className={styles.selectWrapper}>
          <Selector
            label="Select a Leader Robot"
            value={robotIds.leader}
            onChange={handleRobotId}
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
        onClick={handleTeleoperate}
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
