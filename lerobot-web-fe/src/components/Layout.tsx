import { useState, type FC } from 'react';
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

type PageConfig = {
  key: string;
  component: React.FC;
};

const pages: readonly PageConfig[] = [
  { key: 'teleoperate', component: Teleoperate },
  { key: 'calibration', component: Calibration },
  { key: 'policies', component: Policies },
  { key: 'ai-training', component: AITraining },
];

export function Layout() {
  const [isOpen, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [robotStatus, setRobotStatus] = useState([false, false]);

  const { component: SelectedPage, key } = pages[selectedIndex] as PageConfig;

  return (
    <div className={styles.root}>
      <DrawerMenu isOpen={isOpen} setOpen={setOpen} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
      <div className={styles.mainArea}>
        <Header isDrawerOpen={isOpen} robotStatus={robotStatus} />
        <div className={styles.pageContainer}>
          <SelectedPage key={key} />
        </div>
        <div className={styles.sceneContainer}>
          <div className={styles.mainScene}>
            <MainScene>
              <Robot />
            </MainScene>
          </div>
          <div className={styles.cameraContainer}>{/* placeholder for camera feeds */}</div>
        </div>
        <div className={styles.logoArea}>
          <BrandLogo />
        </div>
      </div>
    </div>
  );
}
