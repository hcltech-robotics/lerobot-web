import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { ModelsItem } from '../models/modelPlayback.model';

interface ModelPlaybackState {
  models: ModelsItem[] | null;
  apiKey: string | null;
  userId: string | null;
}

interface ModelPlaybackActions {
  setModels: (models: ModelsItem[]) => void;
  setApiKey: (apiKey: string) => void;
  setUserId: (userId: string) => void;
}

export const useModelPlaybackStore = create<ModelPlaybackState & ModelPlaybackActions>()(
  persist(
    immer((set) => ({
      models: null,
      apiKey: null,
      userId: null,
      setModels: (models) => {
        set((state) => {
          state.models = models;
        });
      },
      setApiKey: (apiKey) => {
        set((state) => {
          state.apiKey = apiKey;
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
        apiKey: state.apiKey,
        userId: state.userId,
      }),
    },
  ),
);
