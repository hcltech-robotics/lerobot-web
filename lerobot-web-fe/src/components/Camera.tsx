import { useEffect, useState } from 'react';

export function CameraFeed() {
  const [videoStream, setVideoStream] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/video');

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload?.data) {
          setVideoStream(`data:image/jpeg;base64,${payload.data}`);
        } else {
          console.warn('CameraFeed: missing data field in message', payload);
        }
      } catch (err) {
        console.error('CameraFeed: invalid JSON message', err);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket closed for video');
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <>{videoStream && <img src={videoStream} alt="Camera feed" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />}</>
  );
}
