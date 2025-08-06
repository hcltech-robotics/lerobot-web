import type { JointStatesResponse } from '../models/robot.model';
import { useConfigStore } from '../stores/config.store';

export async function getJointPositions(follower_id: string): Promise<JointStatesResponse> {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const res = await fetch(`${apiUrl}/joint_state`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        follower_id,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to retrieve joint states: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error in getJointPositions:', error);
    throw error;
  }
}
