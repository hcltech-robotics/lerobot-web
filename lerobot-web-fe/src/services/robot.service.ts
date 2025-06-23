import { API_BASE } from './status.service';
import type { JointStatesResponse } from '../models/robot.model';

export async function useJointPositions(id: number): Promise<JointStatesResponse> {
  try {
    const res = await fetch(`${API_BASE}/joints/read?robot_id=${id}`, {
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
    console.error('Error in useJointPositions:', error);
    throw error;
  }
}
