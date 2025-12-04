import { useState } from 'react';
import type { CameraProps } from '../models/camera.model';
import { useCameraStream } from '../hooks/useCameraStream';

import styles from './CameraBox.module.css';

export function CameraBox({ id, apiUrl, isZoomable = true }: CameraProps) {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { frame } = useCameraStream({ id, apiUrl });

  if (!frame) {
    return null;
  }

  const onCameraClick = () => {
    if (!isZoomable) {
      return;
    }
    setIsCameraOpen((prev) => !prev);
  };

  return (
    <div
      key={id}
      data-zoomable={isZoomable}
      className={[styles.cameraBox, isCameraOpen && isZoomable && styles.zoomed].filter(Boolean).join(' ')}
      onClick={onCameraClick}
    >
      <div className={styles.camera}>
        <img src={frame} className={styles.cameraImage} alt={`Camera ${id}`} />
      </div>
      <div className={styles.cameraLabel}>Camera {id}</div>
    </div>
  );
}
