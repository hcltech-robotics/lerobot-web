import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ModelsItem } from '../models/modelPlayback.model';

interface ModelPlaybackState {
  models: any | null;
}

interface ModelPlaybackActions {
  setModels: (models: ModelsItem[]) => void;
}

export const useModelPlaybackStore = create<ModelPlaybackState & ModelPlaybackActions>()(
  persist(
    immer((set) => ({
      models: null,
      setModels: (models) => {
        set((state) => {
          state.models = models;
        });
      },
    })),
    {
      name: 'modelPlayback',
      partialize: (state) => ({
        models: state.models,
      }),
    },
  ),
);
