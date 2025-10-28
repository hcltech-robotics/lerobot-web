import type { ToastMessage } from '../stores/toast.store';

export const controlStatus = {
  START: 'start',
  STOP: 'stop',
} as const;

export type ControlStatus = (typeof controlStatus)[keyof typeof controlStatus];

export const tableLegPositions: [number, number, number][] = [
  [-0.45, 0.2, -0.65],
  [0.45, 0.2, -0.65],
  [-0.45, 0.2, 0.65],
  [0.45, 0.2, 0.65],
];

export interface ToastItemProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}
