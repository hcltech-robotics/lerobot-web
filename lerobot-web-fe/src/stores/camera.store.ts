import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CameraListResponse } from '../models/camera.model';

interface CameraState {
  cameraList: CameraListResponse | null;
}

interface CameraActions {
  setCameraList: (list: CameraListResponse) => void;
}

export const useCameraStore = create<CameraState & CameraActions>()(
  persist(
    immer((set) => ({
      cameraList: null,
      setCameraList: (list) => {
        set((state) => {
          state.cameraList = list;
        });
      },
    })),
    {
      name: 'camera',
      partialize: (state) => ({
        cameraList: state.cameraList,
      }),
    },
  ),
);
