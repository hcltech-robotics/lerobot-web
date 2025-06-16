import { useEffect, useState } from 'react';

export function CameraFeed() {
  const [videoStream, setVideoStream] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/video');

    socket.onmessage = (event) => {
      const data = `data:image/jpeg;base64,${JSON.parse(event.data).data}`;
      setVideoStream(data);
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
