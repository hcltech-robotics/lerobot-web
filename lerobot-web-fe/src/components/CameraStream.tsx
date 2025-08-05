import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useStatusStore } from '../stores/status.store';
import { CameraBox } from './CameraBox';

import styles from './CameraStream.module.css';

export function CameraStream() {
  const apiUrl = useStatusStore((state) => state.apiUrl);
  const cameraIds = useStatusStore((state) => state.cameraList?.cameras ?? []);

  return (
    <div className={styles.cameraStream}>
      {cameraIds.length > 0 && apiUrl ? (
        cameraIds.map((cameraId) => (
          <div key={cameraId} className={styles.cameraWrapper}>
            <CameraBox apiUrl={apiUrl} id={cameraId} />
            <div className={styles.cameraLabel}>Camera {cameraId}</div>
          </div>
        ))
      ) : (
        <div className={styles.noSignal}>
          <ExclamationTriangleIcon className={styles.noSignalIcon} />
          <span>No Signal!</span>
        </div>
      )}
    </div>
  );
}
