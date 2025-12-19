import type { RobotRoles, RobotTypes } from '../models/robot.model';
import { apiFetch } from '../utils/apiFetch';

export async function startCalibration(robotId: string, robotKind: RobotRoles, robotType: RobotTypes, robotName?: string) {
  return apiFetch<{ message: string }>('calibrate/start', {
    method: 'POST',
    body: JSON.stringify({
      robot_id: robotId,
      robot_kind: robotKind,
      robot_type: robotType,
      robot_name: robotName,
    }),
    toast: { success: `Calibration started for ${robotName ?? robotId}` },
  });
}

export async function confirmCalibrationStart() {
  return await apiFetch<{ message: string }>('calibrate/confirm_calibration_start', {
    method: 'POST',
    toast: { success: false },
  });
}

export async function confirmCalibrationStep() {
  return await apiFetch<{ message: string }>('calibrate/confirm_calibration_step', {
    method: 'POST',
    toast: { success: false },
  });
}
