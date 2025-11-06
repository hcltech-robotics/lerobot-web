import type { ControlStatus } from '../models/general.model';
import type { RobotItem, RobotTypes } from '../models/robot.model';
import type { TeleoperateResponse } from '../models/teleoperate.model';
import { apiFetch } from '../utils/apiFetch';

export async function toggleTeleoperate(
  mode: ControlStatus,
  robots: RobotItem[],
  robotType: RobotTypes,
  fps: number = 30,
): Promise<TeleoperateResponse> {
  return apiFetch<TeleoperateResponse>(`teleoperate/${mode}`, {
    method: 'POST',
    body: JSON.stringify({ mode, robots, robot_type: robotType, fps }),
    toast: { success: `Teleoperate ${mode} successfully completed`, error: `Teleoperate ${mode} failed` },
  });
}

export async function sleepPosition(follower_id: string, robotType: RobotTypes): Promise<TeleoperateResponse> {
  return apiFetch<TeleoperateResponse>('move_to_sleep', {
    method: 'POST',
    body: JSON.stringify({ follower_id, robot_type: robotType }),
    toast: { error: 'Sleep position failed' },
  });
}
