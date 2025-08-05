import { useMemo, useState } from 'react';
import { sleepPosition, toggleTeleoperate } from '../services/teleoperate.service';
import { teleoperateStatusList } from '../models/teleoperate.model';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { CameraStream } from '../components/CameraStream';
import { TeleoperateControlPanel } from '../components/TeleoperateControlPanel';

import styles from './Teleoperate.module.css';

export default function Teleoperate() {
  const [teleoperateStatus, setTeleoperateStatus] = useState<string>(teleoperateStatusList.READY);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const selectedLeader = '5A4B0491371';
  const follower = '58FA1019351';
  const isRunning = useMemo(() => teleoperateStatus === teleoperateStatusList.RUN, [teleoperateStatus]);
  const isLeaderSelected = !!selectedLeader;

  const handleTeleoperate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await toggleTeleoperate(isRunning ? 'stop' : 'start', { leader: selectedLeader, follower });

      setTeleoperateStatus(response.message?.toLowerCase().includes('started') ? teleoperateStatusList.RUN : teleoperateStatusList.READY);
      if (isRunning) {
        await sleepPosition(follower);
      }
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
          isLeaderSelected={isLeaderSelected}
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
