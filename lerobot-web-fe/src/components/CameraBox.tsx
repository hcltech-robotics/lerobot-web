import type { CameraProps } from '../models/camera.model';
import { useCameraStream } from '../hooks/useCameraStream';

import styles from './CameraBox.module.css';

export function CameraBox({ id, apiUrl }: CameraProps) {
  const { frame } = useCameraStream({ id, apiUrl });

  if (!frame) {
    return null;
  }

  return (
    <div key={id} className={styles.cameraBox}>
      <div className={styles.camera}>
        <img src={frame} className={styles.cameraImage} alt={`Camera ${id}`} />
      </div>
      <div className={styles.cameraLabel}>Camera {id}</div>
    </div>
  );
}
