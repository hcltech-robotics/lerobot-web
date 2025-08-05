import { useCameraStream } from '../hooks/useCameraStream';

import styles from './CameraBox.module.css';

export function CameraBox({ apiUrl, id }: { apiUrl: string; id: number }) {
  const { frame } = useCameraStream(id, apiUrl);

  if (!frame) {
    return null;
  }

  return (
    <div className={styles.cameraBox}>
      <img src={frame} className={styles.cameraImage} alt={`Camera ${id}`} />
    </div>
  );
}
