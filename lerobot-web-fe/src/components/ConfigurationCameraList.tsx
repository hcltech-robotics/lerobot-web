import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useCameraStore } from '../stores/camera.store';
import { useConfigStore } from '../stores/config.store';
import { CameraBox } from './CameraBox';

import styles from './ConfigurationCameraList.module.css';

export default function ConfigurationCameraList() {
  const apiUrl = useConfigStore((state) => state.apiUrl);
  const cameraIds = useCameraStore((state) => state.cameraList?.cameras);

  return (
    <div className={styles.cameraListWrapper}>
      {cameraIds && cameraIds.length > 0 && apiUrl ? (
        cameraIds.map((cameraId) => (
          <div key={cameraId} className={styles.cameraBoxWrapper}>
            <CameraBox apiUrl={apiUrl} id={cameraId} />
          </div>
        ))
      ) : (
        <div className={styles.noSignal}>
          <ExclamationTriangleIcon className={styles.noSignalIcon} />
          <span>No cameras available</span>
        </div>
      )}
    </div>
  );
}
