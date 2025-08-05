import type { JointStatesResponse } from '../models/robot.model';
import { useConfigStore } from '../stores/config.store';

export async function getJointPositions(id: number): Promise<JointStatesResponse> {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const res = await fetch(`${apiUrl}/joints/read?robot_id=${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
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
