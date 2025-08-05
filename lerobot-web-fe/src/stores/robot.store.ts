import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface RobotState {
  selectedLeader: string | null;
  robotList: string[] | null;
  isBimanualMode: boolean;
}

export interface RobotActions {
  setSelectedLeader: (leaderId: string) => void;
  setRobotList: (robots: string[]) => void;
  setIsBimanualMode: (mode: boolean) => void;
}

export const useRobotStore = create<RobotState & RobotActions>()(
  persist(
    immer((set) => ({
      selectedLeader: null,
      robotList: null,
      isBimanualMode: false,
      setSelectedLeader: (selectedLeader: string) =>
        set((state) => {
          state.selectedLeader = selectedLeader;
        }),
      setRobotList: (robots: string[]) =>
        set((state) => {
          state.robotList = robots;
        }),
      setIsBimanualMode: (isBimanualMode: boolean) =>
        set((state) => {
          state.isBimanualMode = isBimanualMode;
        }),
    })),
    {
      name: 'robot',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedLeader: state.selectedLeader,
        robotList: state.robotList,
        isBimanualMode: state.isBimanualMode,
      }),
    },
  ),
);
