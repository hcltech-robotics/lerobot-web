import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { API_BASE, getStatus } from '../services/status.service';

import styles from './CameraStream.module.css';

export function CameraStream() {
  const [cameraIds, setCameraIds] = useState<number[]>();
  const [cameraIdsPlaceholder, setCameraIdsPlaceholder] = useState<number[]>();
  const [error, setError] = useState<string | null>('');

  useEffect(() => {
    getCameraStatus();
    const emptyPlaceholder = Array.from({ length: 3 }).map((_, index) => index);
    setCameraIdsPlaceholder(emptyPlaceholder);
  }, []);

  const getCameraStatus = async () => {
    setError(null);

    try {
      const { cameras } = await getStatus();
      setCameraIds(cameras.video_cameras_ids);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className={styles.cameraStream}>
      {cameraIdsPlaceholder &&
        cameraIdsPlaceholder.map((cameraId) => (
          <div key={cameraId} className={styles.cameraWrapper}>
            {cameraIds && cameraIds.includes(cameraId) && !error ? (
              <div className={styles.cameraBox}>
                <img src={`${API_BASE}/video/${cameraId}`} className={styles.cameraImage} alt={`Camera ${cameraId}`} />;
              </div>
            ) : (
              <div className={styles.noSignal}>
                <ExclamationTriangleIcon className={styles.noSignalIcon} />
                <span>No Signal!</span>
              </div>
            )}
            <div className={styles.cameraLabel}>Camera {cameraId}</div>
          </div>
        ))}
    </div>
  );
}
