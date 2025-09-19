import type { AiControlResponse, PoliciesResponse } from '../models/aiControl.model';
import type { ControlStatus } from '../models/general.model';
import { useConfigStore } from '../stores/config.store';

export async function getUserModels(apiKey: string, userId: string): Promise<PoliciesResponse> {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const res = await fetch(`${apiUrl}/get-user-models`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: apiKey,
        user_id: userId,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to query models: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error in query models:', error);
    throw error;
  }
}

export async function fetchAIControl(model: string, robotId: string, mode: ControlStatus): Promise<AiControlResponse> {
  const { apiUrl } = useConfigStore.getState();

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const res = await fetch(`${apiUrl}/ai_control`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        mode,
        model,
        robot_id: robotId,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to playback model: ${res.statusText}`);
    }

    return await res.json();
  } catch (error) {
    console.error('Error in model playback:', error);
    throw error;
  }
}
