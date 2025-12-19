import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { PolicyItem } from '../models/aiControl.model';

interface AiControlState {
  models: PolicyItem[] | null;
  userId: string | null;
}

interface AiControlActions {
  setModels: (models: PolicyItem[]) => void;
  setUserId: (userId: string) => void;
}

export const useAiControlStore = create<AiControlState & AiControlActions>()(
  persist(
    immer((set) => ({
      models: null,
      userId: null,
      setModels: (models) => {
        set((state) => {
          state.models = models;
        });
      },
      setUserId: (userId) => {
        set((state) => {
          state.userId = userId;
        });
      },
    })),
    {
      name: 'aiControl',
      partialize: (state) => ({
        models: state.models,
        userId: state.userId,
      }),
    },
  ),
);
