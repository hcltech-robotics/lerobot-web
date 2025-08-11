const API_BASE = 'http://localhost:8000';

export const startCalibration = async (robotId: string, robotKind: string, firstInput: string = '') => {
  try {
    const res = await fetch(`${API_BASE}/calibrate-thread/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        robot_id: robotId,
        robot_kind: robotKind,
        user_input: firstInput,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Start calibration error:', err);
    throw err;
  }
};

export const sendCalibrationStep = async (robotId: string, robotKind: string, input: string) => {
  try {
    const res = await fetch(`${API_BASE}/calibrate-thread/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        robot_id: robotId,
        robot_kind: robotKind,
        user_input: input,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Calibration step error:', err);
    throw err;
  }
};
