import type { CameraListResponse } from '../models/camera.model';
import { useCameraStore } from '../stores/camera.store';
import { createWebSocket } from '../utils/createWebsocket';
import { apiFetch } from '../utils/apiFetch';

export async function getCameraList(): Promise<CameraListResponse> {
  const response = await apiFetch<CameraListResponse>('list-cameras', { toast: { error: false } });

  const { setCameraList } = useCameraStore.getState();
  setCameraList(response);

  return response;
}

export function createCameraWebSocket(
  id: number,
  url: string,
  onMessage: (data: string) => void,
  onOpen?: () => void,
  onClose?: () => void,
): WebSocket {
  const urlObj = new URL(url);
  urlObj.pathname = `/ws/video/${encodeURIComponent(id)}`;

  return createWebSocket(urlObj, (event) => onMessage(event.data), onOpen, onClose);
}
