import type { CameraListResponse } from '../models/camera.model';
import { useCameraStore } from '../stores/camera.store';
import { apiFetch } from '../utils/apiFetch';

export async function getCameraList(): Promise<CameraListResponse> {
  const response = await apiFetch<CameraListResponse>('list-cameras', { toast: { error: false } });

  const { setCameraList } = useCameraStore.getState();
  setCameraList(response);

  return response;
}

export function createCameraWebSocket(
  id: number,
  apiUrl: string,
  onBinaryFrame: (data: ArrayBuffer) => void,
  onError?: (msg: string) => void,
) {
  const ws = new WebSocket(`${apiUrl.replace(/^http/, 'ws')}/ws/video/${id}`);
  ws.binaryType = 'arraybuffer';

  ws.onmessage = (evt) => {
    if (typeof evt.data === 'string') {
      if (evt.data.startsWith('ERROR:')) {
        onError?.(evt.data);
      }
      return;
    }
    onBinaryFrame(evt.data as ArrayBuffer);
  };

  ws.onerror = () => onError?.('WebSocket error');
  return ws;
}
