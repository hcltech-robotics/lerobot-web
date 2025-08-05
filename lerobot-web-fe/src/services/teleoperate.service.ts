import { useStatusStore } from '../stores/status.store';
import type { RobotIds, TeleoperateResponse } from '../models/teleoperate.model';

export async function toggleTeleoperate(mode: 'start' | 'stop', { leader, follower }: RobotIds): Promise<TeleoperateResponse> {
  const { apiUrl } = useStatusStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const response = await fetch(`${apiUrl}/teleoperate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        leader_id: leader,
        follower_id: follower,
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
  const { apiUrl } = useStatusStore.getState();

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
