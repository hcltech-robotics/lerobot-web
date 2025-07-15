import type { StatusResponse } from '../services/status.service';

export const DEFAULT_ROBOT_COUNT = 2;
export const EMPTY_ROBOT_INDEX = '-1';

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

export interface RobotStatus {
  device_name: string | null;
  name: string;
  robot_type: string;
}

export const mockStatusResponse: StatusResponse = {
  status: 'ok',
  name: 'jetson',
  robots: ['so-100', 'so-100', 'agilex-piper'],
  robot_status: [
    {
      name: 'so-100',
      robot_type: 'manipulator',
      device_name: '58FA101935',
    },
    {
      name: 'so-100',
      robot_type: 'manipulator',
      device_name: '5A4B049137',
    },
    {
      name: 'agilex-piper',
      robot_type: 'manipulator',
      device_name: null,
    },
  ],
  cameras: {
    cameras_status: [],
    is_stereo_camera_available: false,
    realsense_available: false,
    video_cameras_ids: [],
  },
  version_id: '0.3.49',
  is_recording: false,
  ai_running_status: 'stopped',
  server_ip: '192.168.100.102',
  leader_follower_status: false,
};
