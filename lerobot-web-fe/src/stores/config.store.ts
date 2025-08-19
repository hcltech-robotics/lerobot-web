import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ConfigState {
  apiUrl: string | null;
  token: string | null;
}

interface ConfigActions {
  setApiUrl: (url: string) => void;
  setToken: (token: string) => void;
}

export const useConfigStore = create<ConfigState & ConfigActions>()(
  persist(
    immer((set) => ({
      apiUrl: null,
      token: null,
      setApiUrl: (url) => {
        set((state) => {
          state.apiUrl = url;
        });
      },
      setToken: (token) => {
        set((state) => {
          state.token = token;
        });
      },
    })),
    {
      name: 'config',
      partialize: (state) => ({
        apiUrl: state.apiUrl,
        token: state.token,
      }),
    },
  ),
);
