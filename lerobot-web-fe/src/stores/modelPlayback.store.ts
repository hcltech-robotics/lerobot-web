import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ModelsItem } from '../models/modelPlayback.model';

interface ModelPlaybackState {
  models: ModelsItem[] | null;
  userId: string | null;
}

interface ModelPlaybackActions {
  setModels: (models: ModelsItem[]) => void;
  setUserId: (userId: string) => void;
}

export const useModelPlaybackStore = create<ModelPlaybackState & ModelPlaybackActions>()(
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
      name: 'modelPlayback',
      partialize: (state) => ({
        models: state.models,
        userId: state.userId,
      }),
    },
  ),
);
