import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { StatusResponse } from '../models/status.model';

export interface StatusState {
  status: StatusResponse | null;
  selectedLeader: string | null;
  apiUrl: string | null;
  token: string | null;
}

export interface StatusActions {
  setStatus: (status: StatusResponse) => void;
  setSelectedLeader: (leaderId: string) => void;
  setApiUrl: (url: string) => void;
  setToken: (token: string) => void;
}

export const useStatusStore = create<StatusState & StatusActions>()(
  persist(
    immer((set) => ({
      status: null,
      selectedLeader: null,
      apiUrl: null,
      token: null,
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
      setToken: (token: string) =>
        set((state) => {
          state.token = token;
        }),
    })),
    {
      name: 'status-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        status: state.status,
        selectedLeader: state.selectedLeader,
        apiUrl: state.apiUrl,
        token: state.token,
      }),
    },
  ),
);
