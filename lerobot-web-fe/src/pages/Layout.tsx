import { useMemo, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DrawerMenu } from '../components/DrawerMenu';
import Header from '../components/Header';
import { BrandLogo } from '../components/BrandLogo';
import { OnlineStatusButton } from '../components/OnlineStatusButton';
import { MainScene } from '../components/MainScene';
import { CameraStream } from '../components/CameraStream';
import { useRobotStore } from '../stores/robot.store';
import { robotLayout } from '../models/teleoperate.model';
import { robotRoleList, robotSideList, type RobotItem } from '../models/robot.model';
import { Robot } from '../components/Robot';

import styles from './Layout.module.css';

export default function Layout() {
  const [isOpen, setOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);
  const robots = useRobotStore((store) => store.robots);

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
    <div className={styles.root}>
      <DrawerMenu isOpen={isOpen} setOpen={setOpen} />
      <div className={styles.mainArea}>
        <Header />
        <div className={styles.contentArea}>
          <div className={styles.leftArea}>
            <div className={styles.controlPanel}>
              <Outlet />
            </div>
            <div className={styles.sceneContainer}>
              <OnlineStatusButton isLive={isLive} onClick={setIsLive} />
              <div className={styles.mainScene}>
                <MainScene>{renderRobots}</MainScene>
              </div>
              <div className={styles.cameraContainer}>
                <CameraStream />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.logoArea}>
          <BrandLogo />
        </div>
      </div>
    </div>
  );
}
