export interface TeleoperateResponse {
  status: string;
  message: string | null;
  additionalProp1?: Record<string, unknown>;
}

export const teleoperateStatusList = {
  READY: 'Ready to start',
  RUN: 'Running',
  OK: 'ok',
} as const;

export type teleoperateStatus = (typeof teleoperateStatusList)[keyof typeof teleoperateStatusList];
