import { useMemo, useState } from 'react';
import { toggleTeleoperate } from '../services/teleoperate.service';
import { robotLayout, teleoperateStatusList } from '../models/teleoperate.model';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { CameraStream } from '../components/CameraStream';
import { TeleoperateControlPanel } from '../components/TeleoperateControlPanel';
import { robotRoleList, robotSideList, type RobotItem } from '../models/robot.model';
import { useRobotStore } from '../stores/robot.store';
import { controlStatus } from '../models/general.model';

import styles from './Teleoperate.module.css';

export default function Teleoperate() {
  const [teleoperateStatus, setTeleoperateStatus] = useState<string>(teleoperateStatusList.READY);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const robots = useRobotStore((store) => store.robots);
  // const follower = '58FA1019351';
  const isRunning = useMemo(() => teleoperateStatus === teleoperateStatusList.RUN, [teleoperateStatus]);
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);

  const handleTeleoperate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await toggleTeleoperate(isRunning ? controlStatus.STOP : controlStatus.START, robots!);

      setTeleoperateStatus(response.message?.toLowerCase().includes('started') ? teleoperateStatusList.RUN : teleoperateStatusList.READY);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const followers = useMemo(() => {
    if (!robots) return [];

    const allFollowers = robots.filter((robot) => robot.role === robotRoleList.FOLLOWER);

    if (isBimanualMode) {
      const left = allFollowers.find((follower) => follower.side === robotSideList.LEFT);
      const right = allFollowers.find((follower) => follower.side === robotSideList.RIGHT);
      return [left, right].filter(Boolean) as RobotItem[];
    }

    const left = allFollowers.find((follower) => follower.side === robotSideList.LEFT);
    return left ? [left] : [];
  }, [robots, isBimanualMode]);

  const renderRobots = followers.map((follower) => {
    const layout = isBimanualMode ? robotLayout[follower.side] : robotLayout.single;

    return <Robot key={follower.id} isLive={isLive} position={layout.position} rotation={layout.rotation} robotLabel={follower.id} />;
  });

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
            <MainScene>{renderRobots}</MainScene>
          </div>
        </div>
      </div>
      <div className={styles.cameraContainer}>
        <CameraStream />
      </div>
    </div>
  );
}
