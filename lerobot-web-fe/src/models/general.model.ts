export const controlStatus = {
  START: 'start',
  STOP: 'stop',
} as const;

export type ControlStatus = (typeof controlStatus)[keyof typeof controlStatus];
