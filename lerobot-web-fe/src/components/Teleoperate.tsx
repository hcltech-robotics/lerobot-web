import { useState } from 'react';
import { startTeleoperate, stopTeleoperate } from '../services/teleoperateService';
import { Alert, Box, Button, Checkbox, FormControlLabel } from '@mui/material';

export default function Teleoperate() {
  const [status, setStatus] = useState<string>('');
  const [pid, setPid] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [camerasOn, setCamerasOn] = useState<boolean>(false);

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

  const statusText = (status || ' - ').concat(pid ? ` - pid: ${pid}` : '');

  return (
    <>
      <p>Teleoperated status:</p>
      <p>{statusText}</p>
      {error && <Alert severity="error">Error: {error}</Alert>}

      <Box sx={{ '& button': { m: 1 } }}>
        <Button
          variant="contained"
          onClick={handleStart}
          loading={loading}
          loadingPosition="end"
          disabled={!!pid || loading}
          sx={{ background: '#3C91FF' }}
        >
          Start
        </Button>
        <Button variant="contained" sx={{ background: '#C3325F' }} onClick={handleStop} disabled={!pid || loading}>
          Stop
        </Button>
        <FormControlLabel
          control={<Checkbox checked={camerasOn} onChange={(e) => setCamerasOn(e.target.checked)} disabled={loading} />}
          label="Turn on cameras"
          sx={{ ml: 5 }}
        />
      </Box>
    </>
  );
}
