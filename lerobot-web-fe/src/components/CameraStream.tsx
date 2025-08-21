import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useConfigStore } from '../stores/config.store';
import { useCameraStore } from '../stores/camera.store';
import { CameraBox } from './CameraBox';

import styles from './CameraStream.module.css';

export function CameraStream() {
  const apiUrl = useConfigStore((state) => state.apiUrl);
  const cameraIds = useCameraStore((state) => state.cameraList?.cameras);

  return (
    <div className={styles.cameraStream}>
      {cameraIds && cameraIds.length > 0 && apiUrl ? (
        cameraIds.map((cameraId) => (
          <div key={cameraId} className={styles.cameraWrapper}>
            <CameraBox apiUrl={apiUrl} id={cameraId} />
          </div>
        ))
      ) : (
        <div className={styles.noSignal}>
          <ExclamationTriangleIcon className={styles.noSignalIcon} />
          <span>No camera available</span>
        </div>
      )}
    </div>
  );
}
