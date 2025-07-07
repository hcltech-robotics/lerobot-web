import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { StatusResponse } from '../services/status.service';
import { API_URL_KEY, SELECTED_LEADER_KEY, STATUS_KEY } from '../models/status.model';

export interface StatusState {
  status: StatusResponse | null;
  selectedLeader: string | null;
  apiUrl: string | null;
}

export interface StatusActions {
  setStatus: (status: StatusResponse) => void;
  setSelectedLeader: (leaderId: string) => void;
  setApiUrl: (url: string) => void;
}

export const useStatusStore = create<StatusState & StatusActions>()(
  immer((set) => ({
    status: null,
    selectedLeader: null,
    apiUrl: null,
    setStatus: (status: StatusResponse) =>
      set((state) => {
        state.status = status;
        localStorage.setItem(STATUS_KEY, JSON.stringify(status));
      }),
    setSelectedLeader: (selectedLeader: string) =>
      set((state) => {
        state.selectedLeader = selectedLeader;
        localStorage.setItem(SELECTED_LEADER_KEY, selectedLeader);
      }),
    setApiUrl: (url: string) =>
      set((state) => {
        state.apiUrl = url;
        localStorage.setItem(API_URL_KEY, url);
      }),
  })),
);
