import type { RobotSides } from './robot.model';

export interface TeleoperateResponse {
  status: string;
  message: string | null;
  additionalProp1?: Record<string, unknown>;
}

export const teleoperateStatusList = {
  READY: 'Ready to start',
  RUN: 'Running',
  OK: 'ok',
} as const;

export type teleoperateStatus = (typeof teleoperateStatusList)[keyof typeof teleoperateStatusList];

export interface RobotIds {
  leader: string;
  follower: string;
}

export type RobotLayoutKey = RobotSides | 'single';

export type RobotLayout = Record<RobotLayoutKey, { position: [number, number, number]; rotation: [number, number, number] }>;

export const robotLayout: RobotLayout = {
  left: {
    position: [0, 0, 0.45],
    rotation: [-Math.PI / 2, 0, -Math.PI],
  },
  right: {
    position: [0, 0, -0.45],
    rotation: [-Math.PI / 2, 0, 0],
  },
  single: {
    position: [0, 0, 0],
    rotation: [-Math.PI / 2, 0, 0],
  },
};
