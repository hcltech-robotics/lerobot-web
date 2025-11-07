import type { ToastMessage } from '../stores/toast.store';

export const controlStatus = {
  START: 'start',
  STOP: 'stop',
} as const;

export type ControlStatus = (typeof controlStatus)[keyof typeof controlStatus];

export const tableLegPositions: [number, number, number][] = [
  [-0.65, 0.2, -0.1],
  [0.65, 0.2, -0.1],
  [-0.65, 0.2, 0.5],
  [0.65, 0.2, 0.5],
];

export interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

export const UNKNOWN_ERROR_CODE = 'unknown_error';
