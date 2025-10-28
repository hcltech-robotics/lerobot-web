import type { ControlStatus } from '../models/general.model';
import type { RobotItem } from '../models/robot.model';
import type { TeleoperateResponse } from '../models/teleoperate.model';
import { apiFetch } from '../utils/apiFetch';

export async function toggleTeleoperate(mode: ControlStatus, robots: RobotItem[], fps: number = 30): Promise<TeleoperateResponse> {
  return apiFetch<TeleoperateResponse>(`teleoperate/${mode}`, {
    method: 'POST',
    body: JSON.stringify({ mode, robots, fps }),
    toast: { success: `Teleoperate ${mode} successfully completed`, error: `Teleoperate ${mode} failed` },
  });
}

export async function sleepPosition(follower_id: string): Promise<TeleoperateResponse> {
  return apiFetch<TeleoperateResponse>('move_to_sleep', {
    method: 'POST',
    body: JSON.stringify({ follower_id }),
    toast: { error: 'Sleep position failed' },
  });
}
