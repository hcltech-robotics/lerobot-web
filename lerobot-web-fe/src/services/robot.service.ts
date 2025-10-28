import {
  robotRoleList,
  robotSideList,
  type JointStatesResponse,
  type RobotItem,
  type RobotRoles,
  type RobotSides,
} from '../models/robot.model';
import { useConfigStore } from '../stores/config.store';
import { useRobotStore } from '../stores/robot.store';
import { createWebSocket } from '../utils/createWebsocket';
import { apiFetch } from '../utils/apiFetch';

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

export const toggleSelectedRobotSide = (id: string, change: boolean, robots: RobotItem[]) => {
  const updatedRobotList: RobotItem[] = [...robots].map((robot) => {
    const newSide = change ? robotSideList.RIGHT : robotSideList.LEFT;
    return robot.id === id ? { ...robot, side: newSide } : robot;
  });

  return updatedRobotList;
};

const toggleRole = (role: RobotRoles) => (role === robotRoleList.LEADER ? robotRoleList.FOLLOWER : robotRoleList.LEADER);

export const toggleSelectedRobotRole = (id: string, robots: RobotItem[]): RobotItem[] => {
  return robots.map((robot) => (robot.id === id ? { ...robot, role: toggleRole(robot.role) } : robot));
};

export async function getJointPositions(follower: RobotItem): Promise<JointStatesResponse> {
  return apiFetch<JointStatesResponse>('joint_state', {
    method: 'POST',
    body: JSON.stringify({ follower_id: follower.id }),
    toast: { success: false },
  });
}

export function createJointPositionsWebSocket(
  follower: RobotItem,
  onMessage: (jointStateResponse: string) => void,
  onOpen?: () => void,
  onClose?: () => void,
): WebSocket {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  const url = new URL('/ws/joint_state', apiUrl);
  url.search = new URLSearchParams({ follower_id: follower.id }).toString();

  return createWebSocket(url, (event) => onMessage(event.data), onOpen, onClose);
}

export async function getRobotList(): Promise<string[]> {
  const response = await apiFetch<string[]>('robots', {
    method: 'GET',
    toast: { error: false },
  });

  const { setRobotList } = useRobotStore.getState();
  setRobotList(response);

  return response;
}

export const getLeaderBySide = (robotList: RobotItem[], side: RobotSides): string[] => {
  return robotList
    .map((robot) => {
      return robot.side === side && robot.role === robotRoleList.LEADER ? robot.id : null;
    })
    .filter(Boolean) as string[];
};

export const getFollowerBySide = (robotList: RobotItem[], side: RobotSides): string[] => {
  return robotList
    .map((robot) => {
      return robot.side === side && robot.role === robotRoleList.FOLLOWER ? robot.id : null;
    })
    .filter(Boolean) as string[];
};

export const validateRobots = (robotList: RobotItem[] | null, isBimanualMode: boolean): boolean => {
  if (!robotList || robotList.length === 0) {
    return false;
  }

  const hasLeaderAndFollower = (side: RobotSides): boolean => {
    const robotsOnSide = robotList.filter((r) => r.side === side);
    const hasLeader = robotsOnSide.some((r) => r.role === robotRoleList.LEADER);
    const hasFollower = robotsOnSide.some((r) => r.role === robotRoleList.FOLLOWER);
    return hasLeader && hasFollower;
  };

  if (!isBimanualMode) {
    return hasLeaderAndFollower(robotSideList.LEFT) || hasLeaderAndFollower(robotSideList.RIGHT);
  }

  if (isBimanualMode) {
    return hasLeaderAndFollower(robotSideList.LEFT) && hasLeaderAndFollower(robotSideList.RIGHT);
  }

  return false;
};
