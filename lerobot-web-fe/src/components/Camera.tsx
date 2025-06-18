import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import styles from './Camera.module.css';

type CameraFrame = Record<number, string | undefined>;

const cameraIds = [0, 1, 2];

export function CameraFeeds() {
  const [videoStreams, setVideoStreams] = useState<CameraFrame>({});

  useEffect(() => {
    const query = cameraIds.join(',');
    const socket = new WebSocket(`ws://localhost:8000/ws/video?camera_ids=${query}`);

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.error) {
          console.error(`Camera ${payload.camera_id ?? ''} error: ${payload.data}`);
          return;
        }

        if (payload.type === 'camera_frame' && payload.camera_id != null && payload.data) {
          setVideoStreams((prev) => ({
            ...prev,
            [payload.camera_id]: `data:image/jpeg;base64,${payload.data}`,
          }));
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
    <div className={styles.cameraFeeds}>
      {cameraIds.map((cameraId) => (
        <div key={cameraId} className={styles.cameraWrapper}>
          {videoStreams[cameraId] ? (
            <div className={styles.cameraBox}>
              <img src={videoStreams[cameraId]!} alt={`Camera ${cameraId}`} className={styles.cameraImage} />
            </div>
          ) : (
            <div className={styles.noSignal}>
              <ExclamationTriangleIcon className={styles.noSignalIcon} />
              <span>No Signal!</span>
            </div>
          )}
          <div className={styles.cameraLabel}>Camera ID {cameraId}</div>
        </div>
      ))}
    </div>
  );
}
