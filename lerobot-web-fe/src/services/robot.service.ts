import { useStatusStore } from '../stores/status.store';
import type { JointStatesResponse } from '../models/robot.model';

export async function getJointPositions(id: number): Promise<JointStatesResponse> {
  const { apiUrl } = useStatusStore.getState();

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
