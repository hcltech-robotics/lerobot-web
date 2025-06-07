import { useState } from 'react';
import Button from '@mui/material/Button';
import { startCalibration } from '../services/calibrationService';

export default function Calibration() {
  const [status, setStatus] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    try {
      const { status } = await startCalibration();
      setStatus(status);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button variant="contained" onClick={handleStart} loading={loading} sx={{ background: '#3C91FF' }} loadingPosition="end">
        Start calibrate
      </Button>
    </>
  );
}
