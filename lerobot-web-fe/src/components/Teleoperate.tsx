import { useState } from 'react';
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

  const statusText = loading ? 'loading...' : (status || ' - ').concat(pid ? ` - pid: ${pid}` : '');

  return (
    <>
      <p>Teleoperated status:</p>
      <p>{statusText}</p>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      <button onClick={handleStart} disabled={!!pid || loading}>
        Start teleoperate
      </button>
      <button onClick={handleStop} disabled={!pid || loading}>
        Stop teleoperate
      </button>
    </>
  );
}
