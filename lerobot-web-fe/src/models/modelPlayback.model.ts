export interface ModelPlaybackResponse {
  status: aiControlStatus;
  message: string;
}

export interface ModelsResponse {
  models: ModelsItem[];
}

export interface ModelsItem {
  id: string;
  modelId: string;
  private: boolean;
  createdAt: Date;
}

export const aiControlStatusList = {
  OK: 'ok',
  ERROR: 'error',
} as const;

export type aiControlStatus = (typeof aiControlStatusList)[keyof typeof aiControlStatusList];
