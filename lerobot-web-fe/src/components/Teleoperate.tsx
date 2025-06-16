import { useState } from 'react';
import { PlayIcon, StopIcon } from '@radix-ui/react-icons';
import styles from './Teleoperate.module.css';
import { startTeleoperate, stopTeleoperate } from '../services/teleoperateService';

export default function Teleoperate() {
  const [status, setStatus] = useState<string>('');
  const [pid, setPid] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      const { status, pid } = await startTeleoperate();
      setStatus(status);
      setPid(pid);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (pid === null) return;

    setLoading(true);
    setError(null);

    try {
      const { status } = await stopTeleoperate(pid);
      setStatus(status);
      setPid(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const isRunning = !!pid && !!status;

  return (
    <div className={styles.container}>
      <div className={styles.statusBox}>
        <h2 className={styles.statusTitle}>Teleoperation Status</h2>
        <p className={styles.statusText}>
          {loading ? 'Loading...' : status || 'Not started'}
          {pid && !loading ? ` – PID: ${pid}` : ''}
        </p>
        {error && <p className={styles.errorText}>⚠ Error: {error}</p>}
      </div>

      <button
        className={`${styles.controlButton} ${isRunning ? styles.stop : styles.start}`}
        onClick={isRunning ? handleStop : handleStart}
        disabled={loading}
      >
        {false ? (
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
