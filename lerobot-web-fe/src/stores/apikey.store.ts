import { create } from 'zustand';

interface ApiKeyState {
  apiKey: string | null;
}

interface ApiKeyActions {
  setApiKey: (url: string) => void;
}

export const useApiKeyStore = create<ApiKeyState & ApiKeyActions>((set) => ({
  apiKey: null,
  setApiKey: (key) => set({ apiKey: key }),
}));
