import type { ControlStatus } from '../models/general.model';
import { type RobotItem } from '../models/robot.model';
import type { TeleoperateResponse } from '../models/teleoperate.model';
import { useConfigStore } from '../stores/config.store';

export async function toggleTeleoperate(mode: ControlStatus, robots: RobotItem[], fps: number = 30): Promise<TeleoperateResponse> {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const response = await fetch(`${apiUrl}/teleoperate/${mode}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        robots,
        fps,
      }),
    });

    if (!response.ok) {
      throw new Error(`Teleoperate ${mode} failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error during teleoperation ${mode}:`, error);
    throw error;
  }
}

export async function sleepPosition(follower_id: string): Promise<TeleoperateResponse> {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const response = await fetch(`${apiUrl}/move_to_sleep`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        follower_id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Move to sleep failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error moving Sleep position:', error);
    throw error;
  }
}
