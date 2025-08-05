import { useStatusStore } from '../stores/status.store';
import type { CamraListResponse, StatusResponse } from '../models/status.model';

export async function getStatus(): Promise<StatusResponse> {
  const { apiUrl } = useStatusStore.getState();
  const setStatus = useStatusStore.getState().setStatus;

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const statusResponse = await fetch(`${apiUrl}/status`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const response = await statusResponse.json();
    setStatus(response);
    return response;
  } catch (error) {
    console.error('Error fetching status:', error);
    throw error;
  }
}

export async function getCameraList(): Promise<CamraListResponse> {
  const { apiUrl } = useStatusStore.getState();
  const setCameraList = useStatusStore.getState().setCameraList;

  if (!apiUrl) throw new Error('API URL not set. Please configure the system.');

  try {
    const cameraListResponse = await fetch(`${apiUrl}/list-cameras`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const response: CamraListResponse = await cameraListResponse.json();
    setCameraList(response);
    return response;
  } catch (error) {
    console.error('Error fetching status:', error);
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
