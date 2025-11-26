import { useEffect, useRef, useState } from 'react';
import { createCameraWebSocket } from '../services/camera.service';

type CameraProps = { id: number; apiUrl: string };

export function useCameraStream({ id, apiUrl }: CameraProps) {
  const [frame, setFrame] = useState<string | null>(null);
  const websocket = useRef<WebSocket | null>(null);
  const lastUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!apiUrl) return;

    websocket.current = createCameraWebSocket(id, apiUrl, (ab) => {
      const blob = new Blob([ab], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);

      if (lastUrlRef.current) URL.revokeObjectURL(lastUrlRef.current);
      lastUrlRef.current = url;

      requestAnimationFrame(() => setFrame(url));
    });

    return () => {
      try {
        websocket.current?.close();
      } catch {}
      websocket.current = null;

      if (lastUrlRef.current) {
        URL.revokeObjectURL(lastUrlRef.current);
        lastUrlRef.current = null;
      }
      setFrame(null);
    };
  }, [id, apiUrl]);

  return { frame };
}
