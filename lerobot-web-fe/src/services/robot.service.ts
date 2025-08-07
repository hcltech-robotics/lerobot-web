import { robotRoleList, robotSideList, type JointState, type JointStatesResponse, type RobotItem } from '../models/robot.model';
import { useConfigStore } from '../stores/config.store';
import { useRobotStore } from '../stores/robot.store';

export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const getCheckedSwitch = (id: string, robots: RobotItem[] | null) => {
  if (!robots || robots.length === 0) {
    return false;
  }
  const currentRobot = getRobotById(id, robots);

  return currentRobot?.side.toLocaleLowerCase() === robotSideList.RIGHT;
};

export const getRobotById = (id: string, robots: RobotItem[]) => {
  return robots.find((robot) => robot.id === id);
};

export const setRobotSide = (id: string, change: boolean, robots: RobotItem[]) => {
  const updatedRobotList: RobotItem[] = [...robots].map((robot) => {
    const newSide = change ? robotSideList.RIGHT : robotSideList.LEFT;
    return robot.id === id ? { ...robot, side: newSide } : robot;
  });

  return updatedRobotList;
};

export const setRobotRole = (id: string, robots: RobotItem[]) => {
  const updatedRobotList: RobotItem[] = [...robots].map((robot) => {
    return robot.id === id ? { ...robot, role: robotRoleList.LEADER } : robot;
  });

  return updatedRobotList;
};

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
export async function getRobotList(): Promise<string[]> {
  const { apiUrl } = useConfigStore.getState();
  const { setRobotList, setRobots } = useRobotStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const res = await fetch(`${apiUrl}/robots`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to get robot list: ${res.statusText}`);
    }

    const response = await res.json();

    const mappedRobots: RobotItem[] = [
      ...response.map((robot: string) => ({ id: robot, side: robotSideList.LEFT, role: robotRoleList.FOLLOWER })),
    ];

    setRobotList(response);
    setRobots(mappedRobots);

    return response;
  } catch (error) {
    console.error('Error in get robot list:', error);
    throw error;
  }
}
