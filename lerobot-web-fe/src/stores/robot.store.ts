import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { robotTypeList, type RobotItem, type RobotTypes } from '../models/robot.model';

export interface RobotState {
  robotType: RobotTypes;
  robots: RobotItem[] | null;
  robotList: string[] | null;
  isBimanualMode: boolean;
  isLoading: boolean;
}

export interface RobotActions {
  setRobots: (robots: RobotItem[]) => void;
  setRobotType: (robotType: RobotTypes) => void;
  setRobotList: (robots: string[]) => void;
  setIsBimanualMode: (mode: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}

export const useRobotStore = create<RobotState & RobotActions>()(
  persist(
    immer((set) => ({
      robotType: robotTypeList.SO100,
      robots: null,
      robotList: null,
      isBimanualMode: false,
      isLoading: false,
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
      setIsLoading: (isLoading: boolean) =>
        set((state) => {
          state.isLoading = isLoading;
        }),
      setRobotType: (robotType: RobotTypes) =>
        set((state) => {
          state.robotType = robotType;
        }),
    })),
    {
      name: 'robot',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        robotType: state.robotType,
        robots: state.robots,
        robotList: state.robotList,
        isBimanualMode: state.isBimanualMode,
        isLoading: state.isLoading,
      }),
    },
  ),
);
