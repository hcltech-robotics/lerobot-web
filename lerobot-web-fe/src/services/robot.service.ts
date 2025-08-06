import type { JointState, JointStatesResponse } from '../models/robot.model';
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

export function createJointPositionsWebSocket(
  follower_id: string,
  onMessage: (jointState: JointState) => void,
  onOpen?: () => void,
  onClose?: () => void,
): WebSocket {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  const websocket = new WebSocket(`${apiUrl}/ws/joint_state?follower_id=${follower_id}`);

  websocket.onopen = () => {
    console.log(`WebSocket opened: ${websocket.url}`);
    onOpen?.();
  };

  websocket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.joint_states) {
        onMessage(data.joint_states);
      }
    } catch (e) {
      console.warn('WebSocket message parse error', e);
    }
  };

  websocket.onclose = () => {
    console.log(`WebSocket closed: ${websocket.url}`);
    onClose?.();
  };

  return websocket;
}
