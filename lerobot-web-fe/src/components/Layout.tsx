import { useState } from 'react';
import { DrawerMenu } from './DrawerMenu';
import Header from './Header';
import styles from './Layout.module.css';
import Teleoperate from './Teleoperate';
import Calibration from './Calibration';
import Policies from './Policies';
import AITraining from './AITraining';
import { BrandLogo } from './BrandLogo';
import { MainScene } from './MainScene';
import Robot from './Robot';

const pages = [<Teleoperate />, <Calibration />, <Policies />, <AITraining />];

export function Layout() {
  const [isOpen, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [robotStatus, setRobotStatus] = useState([false, false]);

  return (
    <div className={styles.root}>
      <DrawerMenu isOpen={isOpen} setOpen={setOpen} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
      <div className={styles.mainArea}>
        <Header isDrawerOpen={isOpen} robotStatus={robotStatus} />
        <div className={styles.pageContainer}>
          {pages[selectedIndex]}
          <div className={styles.sceneContainer}>
            <div className={styles.mainScene}>
              <MainScene>
                <Robot />
              </MainScene>
            </div>
            <div className={styles.cameraContainer}>{/* placeholder for camera feeds */}</div>
          </div>
        </div>
        <div className={styles.logoArea}>
          <BrandLogo />
        </div>
      </div>
    </div>
  );
}
