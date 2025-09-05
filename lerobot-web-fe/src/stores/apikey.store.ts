import { create } from 'zustand';

interface ApiKeyState {
  apiKey: string | null;
}

interface ApiKeyActions {
  setApiKey: (key: string) => void;
}

export const useApiKeyStore = create<ApiKeyState & ApiKeyActions>((set) => ({
  apiKey: null,
  setApiKey: (apiKey) => set({ apiKey }),
}));
