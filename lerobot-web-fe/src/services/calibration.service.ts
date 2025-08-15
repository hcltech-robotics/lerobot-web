import { useConfigStore } from '../stores/config.store';
import type { RobotRoles } from '../models/robot.model';

const { apiUrl } = useConfigStore.getState();

export const startCalibration = async (robotId: string, robotKind: RobotRoles) => {
  try {
    const res = await fetch(`${apiUrl}/calibrate/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        robot_id: robotId,
        robot_kind: robotKind,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Start calibration error:', err);
    throw err;
  }
};

export const confirmCalibrationStart = async () => {
  const res = await fetch(`${apiUrl}/calibrate/confirm_calibration_start`, { method: 'POST' });
  const data = await res.json();
  console.log(data.message);
};

export const confirmCalibrationStep = async () => {
  const res = await fetch(`${apiUrl}/calibrate/confirm_calibration_step`, { method: 'POST' });
  const data = await res.json();
  console.log(data.message);
};
