export const DEFAULT_ROBOT_COUNT = 2;
export const EMPTY_ROBOT_INDEX = '-1';

export const unitList = {
  RAD: 'rad',
  MOTOR_UNITS: 'motor_units',
  DEGREES: 'degrees',
} as const;

export type unitlistName = (typeof unitList)[keyof typeof unitList];

export interface JointStatesResponse {
  jointState: JointState;
}

export interface JointStatesWSResponse {
  timestamp: string;
  jointState: JointState;
}

export interface JointState {
  rotation: number;
  pitch: number;
  elbow: number;
  wristPitch: number;
  wristRoll: number;
  jaw: number;
}

export const jointStateNameList = {
  ROTATION: 'Rotation',
  PITCH: 'Pitch',
  ELBOW: 'Elbow',
  WRIST_PITCH: 'Wrist_Pitch',
  WRIST_ROLL: 'Wrist_Roll',
  JAW: 'Jaw',
} as const;

export type jointStateNames = (typeof jointStateNameList)[keyof typeof jointStateNameList];

export const robotSideList = {
  LEFT: 'left',
  RIGHT: 'right',
} as const;

export type RobotSides = (typeof robotSideList)[keyof typeof robotSideList];

export const robotRoleList = {
  LEADER: 'leader',
  FOLLOWER: 'follower',
} as const;

export type RobotRoles = (typeof robotRoleList)[keyof typeof robotRoleList];

export const robotTypeList = {
  SO100: 'so100',
  SO101: 'so101',
} as const;

export type RobotTypes = (typeof robotTypeList)[keyof typeof robotTypeList];

export interface RobotProps {
  isLive: boolean;
  calibrationJointState?: JointState | null;
  position?: [number, number, number];
  rotation?: [number, number, number];
  robotLabel: string;
}

export const JOINT_STATES_OFFSETS = {
  WRIST_PITCH: -1.5,
  WRIST_ROLL: -3.2,
  JAW: -3.3,
} as const;

export interface RobotItem {
  id: string;
  side: RobotSides;
  role: RobotRoles;
}

export interface RobotIds {
  leader: string;
  follower: string;
}

export type RobotLayoutKey = RobotSides | 'single';

export type RobotLayout = Record<RobotLayoutKey, { position: [number, number, number]; rotation: [number, number, number] }>;

export const robotLayout: RobotLayout = {
  left: {
    position: [0.35, 0.42, -0.3],
    rotation: [-Math.PI / 2, 0, 0],
  },
  right: {
    position: [-0.35, 0.42, -0.3],
    rotation: [-Math.PI / 2, 0, 0],
  },
  single: {
    position: [0, 0.42, -0.3],
    rotation: [-Math.PI / 2, 0, 0],
  },
};
