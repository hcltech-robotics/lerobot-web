import type { RobotTypes } from './robot.model';

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

export interface InferenceMetaData {
  repoId: string;
  policyPathLocal: string;
  episodeTime: string | number;
  singleTask: string;
  remoteModel: string;
}

export interface InferencePayload extends InferenceMetaData {
  followerId: string;
  robotType: RobotTypes;
}

export const initFormData: InferenceMetaData = {
  repoId: '',
  episodeTime: '',
  policyPathLocal: '',
  singleTask: '',
  remoteModel: '',
};

export interface InferenceFormProps {
  remoteModels: string[];
  isRunning: boolean;
  onSubmit: (data: InferenceMetaData) => void;
}
