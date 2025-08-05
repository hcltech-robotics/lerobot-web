import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface RobotState {
  selectedLeader: string | null;
}

export interface RobotActions {
  setSelectedLeader: (leaderId: string) => void;
}

export const useRobotStore = create<RobotState & RobotActions>()(
  persist(
    immer((set) => ({
      selectedLeader: null,
      setSelectedLeader: (selectedLeader: string) =>
        set((state) => {
          state.selectedLeader = selectedLeader;
        }),
    })),
    {
      name: 'robot',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedLeader: state.selectedLeader,
      }),
    },
  ),
);
