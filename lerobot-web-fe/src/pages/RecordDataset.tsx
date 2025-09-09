import { useMemo, useState } from 'react';
import { CameraStream } from '../components/CameraStream';
import { OnlineStatusButton } from '../components/OnlineStatusButton';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { useRobotStore } from '../stores/robot.store';
import { robotRoleList, robotSideList, type RobotItem } from '../models/robot.model';
import { robotLayout } from '../models/teleoperate.model';
import { RecordDatasetControlPanel } from '../components/RecordDatasetControlPanel';

import styles from './RecordDataset.module.css';

export default function RecordDataset() {
  const [isLive, setIsLive] = useState(false);
  const robots = useRobotStore((store) => store.robots);

  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);

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
        <div className={styles.statusBox}>
          <h2 className={styles.title}>Record a new dataset</h2>
          <RecordDatasetControlPanel />
        </div>
        <div className={styles.sceneContainer}>
          <OnlineStatusButton isLive={isLive} onClick={setIsLive} />
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
