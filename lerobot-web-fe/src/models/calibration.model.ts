import type { JointState } from '../models/robot.model';

export interface CalibrationStep {
  id: string;
  label: string;
  content: string;
  activeLabel: string;
  step?: string;
}

export const ANIMATION_MOVEMENT_SPEED = {
  FAST: 1500,
  NORMAL: 2000,
  SLOW: 3500,
} as const;

export const ANIMATION_SEQUENCES = {
  JAW: [1.7, 0],
  WRIST_ROLL: [0, 1.5, 0, -1.5, -3.2, 0],
  WRIST_PITCH: [1.8, -1.8, 0],
  ROTATION: [1.5, -1.5, 0],
};

export const calibrationSteps: CalibrationStep[] = [
  {
    id: 'start',
    label: 'Start',
    activeLabel: 'Start calibration',
    content: 'Click "Start calibration" to begin the calibration process.',
    step: 'start',
  },
  {
    id: 'step1',
    label: 'Step 1',
    activeLabel: 'Confirm step 1',
    content:
      'Move the arm forward and fully close the gripper. The moving part of the gripper should be on the top. If the robot matches the 3D model, click Confirm step 1.',
    step: '1',
  },
  {
    id: 'step2',
    label: 'Step 2',
    activeLabel: 'Confirm step 2',
    content: 'Move each joint through its full range of motion',
    step: '2',
  },
  {
    id: 'finish',
    label: 'Finish',
    activeLabel: 'Finish calibration',
    content: 'Return the arms to the resting position, then click Finish to complete the calibration.',
  },
];

export const startPositionJointState: JointState = {
  rotation: 0,
  pitch: -1.7,
  elbow: 1.5,
  wristPitch: 0.75,
  wristRoll: -1.6,
  jaw: 0,
};

export const calibrationFirstStepJointStates: JointState = {
  rotation: 0,
  pitch: 0,
  elbow: 0,
  wristPitch: 0,
  wristRoll: -1.5,
  jaw: 0,
};
