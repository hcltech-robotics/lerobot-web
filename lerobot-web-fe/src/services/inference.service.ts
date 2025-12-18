import type {
  AiControlResponse,
  GrootStartPayload,
  GrootStartResponse,
  GrootStopResponse,
  InferencePayload,
  PoliciesResponse,
} from '../models/aiControl.model';
import { apiFetch } from '../utils/apiFetch';
import { createWebSocket } from '../utils/createWebsocket';
import { useConfigStore } from '../stores/config.store';
import { useCameraStore } from '../stores/camera.store';

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

export async function startInference(payload: InferencePayload): Promise<AiControlResponse> {
  const { cameraList } = useCameraStore.getState();
  const cameras = cameraList?.cameras.map((camera) => ({
    type: 'opencv',
    index_or_path: camera,
    width: 640,
    height: 480,
    fps: 30,
  }));

  return apiFetch<AiControlResponse>('inference/start', {
    method: 'POST',
    body: JSON.stringify({
      task_description: payload.singleTask,
      remote_model: payload.remoteModel,
      model_id: payload.repoId,
      robot_id: payload.followerId,
      robot_type: payload.robotType,
      policy_path_local: payload.policyPathLocal,
      episode_time_s: payload.episodeTime,
      user_id: payload.userId,
      cameras,
    }),
    toast: { success: 'Inference has started successfully.' },
  });
}

export async function stopInference(): Promise<AiControlResponse> {
  return apiFetch<AiControlResponse>('inference/stop', {
    method: 'POST',
    body: JSON.stringify({}),
    toast: { success: 'Inference has stopped successfully.' },
  });
}

export async function startGroot(payload: GrootStartPayload) {
  return apiFetch<GrootStartResponse>('ai-control/groot/start', {
    method: 'POST',
    body: JSON.stringify(payload),
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
  return apiFetch<GrootStopResponse>('ai-control/groot/stop', {
    method: 'POST',
    body: JSON.stringify({}),
    toast: { success: 'Groot stream stopped successfully.' },
  });
}
