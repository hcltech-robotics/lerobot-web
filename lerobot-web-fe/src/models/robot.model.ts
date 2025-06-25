export const unitList = {
  RAD: 'rad',
  MOTOR_UNITS: 'motor_units',
  DEGREES: 'degrees',
} as const;

export type unitlistName = (typeof unitList)[keyof typeof unitList];

export interface JointStatesResponse {
  angles: number[];
  unit: unitlistName;
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

export interface RobotProps {
  isLive: boolean;
}

export const JOINT_STATES_OFFSETS = {
  WRIST_PITCH: -1.5,
  WRIST_ROLL: -3.2,
  JAW: -3.3,
} as const;
