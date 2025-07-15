import { useStatusStore } from '../stores/status.store';
import type { RobotIds, TeleoperateResponse } from '../models/teleoperate.model';

export async function startTeleoperate({ leader, follower }: RobotIds): Promise<TeleoperateResponse> {
  const { apiUrl } = useStatusStore.getState();

  try {
    const response = await fetch(`${apiUrl}/move/leader/start`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        robot_pairs: [
          {
            leader_id: leader,
            follower_id: follower,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Teleoperate start failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error starting Teleoperation:', error);
    throw error;
  }
}

export async function stopTeleoperate(): Promise<TeleoperateResponse> {
  const { apiUrl } = useStatusStore.getState();

  try {
    const response = await fetch(`${apiUrl}/move/leader/stop`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Teleoperate stop failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error stoping Teleoperation:', error);
    throw error;
  }
}

export async function sleepPosition(id: string): Promise<TeleoperateResponse> {
  const { apiUrl } = useStatusStore.getState();

  try {
    const response = await fetch(`${apiUrl}/move/sleep?robot_id=${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
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
