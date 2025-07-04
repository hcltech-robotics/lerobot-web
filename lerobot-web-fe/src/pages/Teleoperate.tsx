import { useMemo, useState } from 'react';
import { sleepPosition, startTeleoperate, stopTeleoperate } from '../services/teleoperate.service';
import { teleoperateStatusList, type RobotIds } from '../models/teleoperate.model';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { CameraStream } from '../components/CameraStream';
import { TeleoperateControlPanel } from '../components/TeleoperateControlPanel';

import styles from './Teleoperate.module.css';

export default function Teleoperate() {
  const [status, setStatus] = useState<string>(teleoperateStatusList.READY);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [robotIds, setRobotIds] = useState<RobotIds>({ leader: '0', follower: '1' });
  const [isLive, setIsLive] = useState(false);

  const isRunning = useMemo(() => status === teleoperateStatusList.RUN, [status]);

  const handleTeleoperate = async () => {
    setLoading(true);
    setError(null);

    try {
      let statusResponse: string;

      if (isRunning) {
        await stopTeleoperate();
        const response = await sleepPosition(robotIds.follower);
        statusResponse = response.status;
      } else {
        const response = await startTeleoperate({ leader: robotIds.leader, follower: robotIds.follower });
        statusResponse = response.status;
      }

      setStatus(
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

  const handleRobotId = (id: string) => {
    const followerId = id === '0' ? '1' : '0';
    setRobotIds({
      leader: id,
      follower: followerId,
    });
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.leftArea}>
        <TeleoperateControlPanel
          status={status}
          loading={loading}
          error={error}
          isRunning={isRunning}
          robotIds={robotIds}
          onChangeRobotId={handleRobotId}
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
