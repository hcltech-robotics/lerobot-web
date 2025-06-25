export interface TeleoperateResponse {
  status: string;
  message: string;
  additionalProp1: {};
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
