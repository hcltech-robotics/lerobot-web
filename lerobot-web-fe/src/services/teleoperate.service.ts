import type { RobotIds, TeleoperateResponse } from '../models/teleoperate.model';

const API_BASE = 'http://127.0.0.1:80';

export async function startTeleoperate({ leader, follower }: RobotIds): Promise<TeleoperateResponse> {
  try {
    const res = await fetch(`${API_BASE}/move/leader/start`, {
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

    if (!res.ok) {
      throw new Error(`Teleoperate start failed: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error('Error starting Teleoperation:', error);
    throw error;
  }
}

export async function stopTeleoperate(): Promise<TeleoperateResponse> {
  try {
    const res = await fetch(`${API_BASE}/move/leader/stop`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Teleoperate stop failed: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error('Error stoping Teleoperation:', error);
    throw error;
  }
}

export async function sleepPosition(id: string): Promise<TeleoperateResponse> {
  try {
    const res = await fetch(`${API_BASE}/move/sleep?robot_id=${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Move to sleep failed: ${res.statusText}`);
    }

    return res.json();
  } catch (error) {
    console.error('Error moving Sleep position:', error);
    throw error;
  }
}
