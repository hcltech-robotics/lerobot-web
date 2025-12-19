import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface ConfigState {
  apiUrl: string | null;
}

interface ConfigActions {
  setApiUrl: (url: string) => void;
}

export const useConfigStore = create<ConfigState & ConfigActions>()(
  persist(
    immer((set) => ({
      apiUrl: 'http://127.0.0.1:8000',
      setApiUrl: (url) => {
        set((state) => {
          state.apiUrl = url;
        });
      },
    })),
    {
      name: 'config',
      partialize: (state) => ({
        apiUrl: state.apiUrl,
      }),
    },
  ),
);
