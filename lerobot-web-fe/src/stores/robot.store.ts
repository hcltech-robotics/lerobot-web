import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { RobotItem } from '../models/robot.model';

export interface RobotState {
  robots: RobotItem[] | null;
  robotList: string[] | null;
  isBimanualMode: boolean;
}

export interface RobotActions {
  setRobots: (robots: RobotItem[]) => void;
  setRobotList: (robots: string[]) => void;
  setIsBimanualMode: (mode: boolean) => void;
}

export const useRobotStore = create<RobotState & RobotActions>()(
  persist(
    immer((set) => ({
      robots: null,
      robotList: null,
      isBimanualMode: false,
      setRobots: (robots: RobotItem[]) =>
        set((state) => {
          state.robots = robots;
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
        robots: state.robots,
        robotList: state.robotList,
        isBimanualMode: state.isBimanualMode,
      }),
    },
  ),
);
