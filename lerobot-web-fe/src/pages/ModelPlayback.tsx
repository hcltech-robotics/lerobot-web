import { useMemo, useState } from 'react';
import { StopIcon } from '@radix-ui/react-icons';
import { PlayIcon } from 'lucide-react';
import { robotLayout } from '../models/teleoperate.model';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { robotRoleList, robotSideList, type RobotItem } from '../models/robot.model';
import { useRobotStore } from '../stores/robot.store';
import { CameraStream } from '../components/CameraStream';
import { Selector } from '../components/Selector';

import styles from './ModelPlayback.module.css';

export default function Policies() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [options, setOptions] = useState<string[]>(['model1', 'model2']);
  const robots = useRobotStore((store) => store.robots);
  const isRunning = false;
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

  const onModelChange = () => {
    console.log('changed');
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.control}>
        <div className={styles.statusBox}>
          <h2 className={styles.title}>Select a pre-trained model</h2>
          <Selector label="Select a model" options={options} selected={''} onChange={onModelChange} />
          <button className={`${styles.controlButton} ${isRunning ? styles.stop : styles.start}`} disabled={true}>
            {isRunning ? (
              <>
                <StopIcon className={styles.icon} />
                Stop
              </>
            ) : (
              <>
                <PlayIcon className={styles.icon} />
                Start
              </>
            )}
          </button>
        </div>
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
