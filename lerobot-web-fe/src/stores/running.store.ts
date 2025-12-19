import { create } from 'zustand';

export interface RunningState {
  runningStates: Record<string, boolean>;
}

export interface RunningActions {
  setRunning: (id: string, running: boolean) => void;
  isAnyRunning: () => boolean;
}

export const useRunningStore = create<RunningState & RunningActions>((set, get) => ({
  runningStates: {},
  setRunning: (id, running) => set((state) => ({ runningStates: { ...state.runningStates, [id]: running } })),
  isAnyRunning: () => Object.values(get().runningStates).some(Boolean),
}));
