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

export interface GrootStartPayload {
  lang_instruction: string;
  robot_type: string;
  robot_port: string;
}

export interface GrootStartResponse {
  started: boolean;
  pid: number;
}

export interface GrootStopResponse {
  stopped: boolean;
}
