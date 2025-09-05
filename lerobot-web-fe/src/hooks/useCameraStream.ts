import { useEffect, useRef, useState } from 'react';
import { createCameraWebSocket } from '../services/camera.service';
import type { CameraProps } from '../models/camera.model';

export function useCameraStream({ id, apiUrl }: CameraProps) {
  const [frame, setFrame] = useState<string | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (apiUrl) {
      websocket.current = createCameraWebSocket(id, apiUrl, (data) => {
        setFrame(`data:image/jpeg;base64,${data}`);
      });
    }

    return () => {
      websocket.current?.close();
    };
  }, [apiUrl]);

  return {
    frame,
  };
}
