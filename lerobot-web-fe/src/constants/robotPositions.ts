import type { JointState } from 'src/models/robot.model';

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
