import type { CameraListResponse } from '../models/camera.model';
import { useCameraStore } from '../stores/camera.store';
import { useConfigStore } from '../stores/config.store';

export async function getCameraList(): Promise<CameraListResponse> {
  const { apiUrl } = useConfigStore.getState();
  const setCameraList = useCameraStore.getState().setCameraList;

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const cameraListResponse = await fetch(`${apiUrl}/list-cameras`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const response: CameraListResponse = await cameraListResponse.json();
    setCameraList(response);
    return response;
  } catch (error) {
    console.error('Error fetching camera list:', error);
    throw error;
  }
}

export function createCameraWebSocket(
  id: number,
  url: string,
  onMessage: (data: string) => void,
  onOpen?: () => void,
  onClose?: () => void,
): WebSocket {
  const websocket = new WebSocket(`${url}/ws/video/${id}`);

  websocket.onopen = () => {
    console.log(`WebSocket opened: ${url}`);
    onOpen?.();
  };

  websocket.onmessage = (event) => {
    onMessage(event.data);
  };

  websocket.onclose = () => {
    console.log(`WebSocket closed: ${url}`);
    onClose?.();
  };

  return websocket;
}
