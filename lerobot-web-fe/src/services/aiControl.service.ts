import type { AiControlResponse, PoliciesResponse } from '../models/aiControl.model';
import type { ControlStatus } from '../models/general.model';
import { apiFetch } from '../utils/apiFetch';

export async function getUserModels(apiKey: string, userId: string): Promise<PoliciesResponse> {
  return apiFetch<PoliciesResponse>('user-models', {
    method: 'POST',
    body: JSON.stringify({
      api_key: apiKey,
      user_id: userId,
    }),
    toast: { success: 'Models fetched successfully.' },
  });
}

export async function fetchAIControl(model: string, robotId: string, mode: ControlStatus): Promise<AiControlResponse> {
  return apiFetch<AiControlResponse>('ai_control', {
    method: 'POST',
    body: JSON.stringify({
      mode,
      model,
      robot_id: robotId,
    }),
    toast: { success: mode === 'start' ? `AI control has ${mode}ed.` : `AI control has ${mode}ped.` },
  });
}
