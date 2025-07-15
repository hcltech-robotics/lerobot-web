import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useStatusStore } from '../stores/status.store';

import styles from './CameraStream.module.css';

export function CameraStream() {
  const [cameraIds, setCameraIds] = useState<number[]>();
  const apiUrl = useStatusStore((s) => s.apiUrl);
  const status = useStatusStore((s) => s.status);
  const cameraIdsPlaceholder = Array.from({ length: 3 }, (_, index) => index);

  useEffect(() => {
    if (status?.cameras?.video_cameras_ids) {
      setCameraIds(status.cameras.video_cameras_ids);
    }
  }, [status]);

  return (
    <div className={styles.cameraStream}>
      {cameraIdsPlaceholder &&
        cameraIdsPlaceholder.map((cameraId) => (
          <div key={cameraId} className={styles.cameraWrapper}>
            {cameraIds && cameraIds.includes(cameraId) ? (
              <div className={styles.cameraBox}>
                <img src={`${apiUrl}/video/${cameraId}`} className={styles.cameraImage} alt={`Camera ${cameraId}`} />
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
