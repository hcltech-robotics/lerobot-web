import { useStatusStore } from '../stores/status.store';

export async function performCalibrationStep(robotId: string) {
  const { apiUrl } = useStatusStore.getState();
  const url = `${apiUrl}/calibrate?id=${robotId}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Calibration step failed: ${response.statusText}`);
    }
    return response.json();
  } catch (error) {
    console.error(`Error in calibration: ${error}`);
    throw error;
  }
}
