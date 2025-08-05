import { useEffect, useRef, useState } from 'react';
import { createCameraWebSocket } from '../services/camera.service';

export function useCameraStream(id: number, url: string) {
  const [frame, setFrame] = useState<string | null>(null);
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (url) {
      websocket.current = createCameraWebSocket(id, url, (data) => {
        setFrame(`data:image/jpeg;base64,${data}`);
      });
    }

    return () => {
      websocket.current?.close();
    };
  }, [url]);

  return {
    frame,
  };
}
