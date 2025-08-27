import type { ModelPlaybackResponse } from '../models/modelPlayback.model';
import { useConfigStore } from '../stores/config.store';

export async function fetchAIControl(model: string, robotId: string, mode: string): Promise<ModelPlaybackResponse> {
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
