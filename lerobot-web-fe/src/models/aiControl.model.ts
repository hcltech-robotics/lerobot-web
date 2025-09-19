export interface AiControlResponse {
  status: AiControlStatus;
  message: string;
}
export interface PoliciesResponse {
  models: PolicyItem[];
}

export interface PolicyItem {
  id: string;
  modelId: string;
  private: boolean;
  createdAt: string;
}

export const aiControlStatusList = {
  OK: 'ok',
  ERROR: 'error',
} as const;

export type AiControlStatus = (typeof aiControlStatusList)[keyof typeof aiControlStatusList];
