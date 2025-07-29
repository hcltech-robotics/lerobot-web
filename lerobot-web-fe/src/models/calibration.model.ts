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
