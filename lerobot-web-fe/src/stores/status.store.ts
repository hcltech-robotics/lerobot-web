import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { CamraListResponse, StatusResponse } from '../models/status.model';

export interface StatusState {
  status: StatusResponse | null;
  selectedLeader: string | null;
  apiUrl: string | null;
  cameraList: CamraListResponse | null;
}

export interface StatusActions {
  setStatus: (status: StatusResponse) => void;
  setSelectedLeader: (leaderId: string) => void;
  setApiUrl: (url: string) => void;
  setCameraList: (list: CamraListResponse) => void;
}

export const useStatusStore = create<StatusState & StatusActions>()(
  persist(
    immer((set) => ({
      status: null,
      selectedLeader: null,
      apiUrl: null,
      cameraList: null,
      setStatus: (status: StatusResponse) =>
        set((state) => {
          state.status = status;
        }),
      setSelectedLeader: (selectedLeader: string) =>
        set((state) => {
          state.selectedLeader = selectedLeader;
        }),
      setApiUrl: (url: string) =>
        set((state) => {
          state.apiUrl = url;
        }),
      setCameraList: (list: CamraListResponse) =>
        set((state) => {
          state.cameraList = list;
        }),
    })),
    {
      name: 'status-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        status: state.status,
        selectedLeader: state.selectedLeader,
        apiUrl: state.apiUrl,
        cameraList: state.cameraList,
      }),
    },
  ),
);
