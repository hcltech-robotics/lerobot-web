import { useEffect, useMemo, useState } from 'react';
import { sleepPosition, startTeleoperate, stopTeleoperate } from '../services/teleoperate.service';
import { teleoperateStatusList } from '../models/teleoperate.model';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { CameraStream } from '../components/CameraStream';
import { TeleoperateControlPanel } from '../components/TeleoperateControlPanel';
import { useStatusStore } from '../stores/status.store';
import { getStatus } from '../services/status.service';

import styles from './Teleoperate.module.css';

export default function Teleoperate() {
  const [teleoperateStatus, setTeleoperateStatus] = useState<string>(teleoperateStatusList.READY);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const { selectedLeader } = useStatusStore();

  const isRunning = useMemo(() => teleoperateStatus === teleoperateStatusList.RUN, [teleoperateStatus]);

  const handleTeleoperate = async () => {
    setLoading(true);
    setError(null);

    const followerIndex = selectedLeader === '0' ? '1' : '0';

    try {
      let statusResponse: string;

      if (isRunning) {
        await stopTeleoperate();
        const response = await sleepPosition(followerIndex);
        statusResponse = response.status;
      } else {
        const response = await startTeleoperate({ leader: selectedLeader || '0', follower: followerIndex });
        statusResponse = response.status;
      }

      setTeleoperateStatus(
        statusResponse === teleoperateStatusList.OK
          ? isRunning
            ? teleoperateStatusList.READY
            : teleoperateStatusList.RUN
          : statusResponse,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.leftArea}>
        <TeleoperateControlPanel
          status={teleoperateStatus}
          loading={loading}
          error={error}
          isRunning={isRunning}
          onToggleTeleoperate={handleTeleoperate}
        />
        <div className={styles.sceneContainer}>
          <button className={`${styles.isLive} ${isLive ? styles.online : styles.offline}`} onClick={() => setIsLive(!isLive)}>
            {isLive ? 'Online' : 'Offline'}
          </button>
          <div className={styles.mainScene}>
            <MainScene>
              <Robot isLive={isLive} />
            </MainScene>
          </div>
        </div>
      </div>
      <div className={styles.cameraContainer}>
        <CameraStream />
      </div>
    </div>
  );
}
