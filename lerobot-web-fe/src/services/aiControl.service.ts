import type { RobotTypes } from '../models/robot.model';
import type { AiControlResponse, PoliciesResponse } from '../models/aiControl.model';
import type { ControlStatus } from '../models/general.model';
import { apiFetch } from '../utils/apiFetch';
import { createWebSocket } from '../utils/createWebsocket';
import { useConfigStore } from '../stores/config.store';

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

export async function fetchAIControl(
  model: string,
  robotId: string,
  mode: ControlStatus,
  robotType: RobotTypes,
): Promise<AiControlResponse> {
  return apiFetch<AiControlResponse>('ai_control', {
    method: 'POST',
    body: JSON.stringify({
      mode,
      model,
      robot_id: robotId,
      robot_type: robotType,
    }),
    toast: { success: mode === 'start' ? `AI control has ${mode}ed.` : `AI control has ${mode}ped.` },
  });
}

export async function startGroot(langInstruction: string) {
  return apiFetch<any>('/ai-control/groot/start', {
    method: 'POST',
    body: JSON.stringify({ lang_instruction: langInstruction }),
    toast: { success: false },
  });
}

export function createGrootWebSocket(
  path: string,
  onMessage: (message: string) => void,
  onOpen?: () => void,
  onClose?: () => void,
): WebSocket {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  const url = new URL(path, apiUrl);

  return createWebSocket(url, (event) => onMessage(event.data), onOpen, onClose);
}

export async function stopGroot() {
  return apiFetch<any>('/ai-control/groot/stop', {
    method: 'POST',
    body: JSON.stringify({}),
    toast: { success: 'Groot stream stopped successfully.' },
  });
}
