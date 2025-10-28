import { create } from 'zustand';

export type ToastAnimation = 'fadeIn' | 'slideInRight';

export const ToastType = {
  Success: 'success',
  Error: 'error',
  Warning: 'warning',
  Info: 'info',
} as const;

export type ToastType = (typeof ToastType)[keyof typeof ToastType];

export interface ToastMessage {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
  duration?: number;
  animation?: ToastAnimation;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID(), animation: toast.animation ? toast.animation : 'slideInRight' }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));
