import { useState } from 'react';
import { DrawerMenu } from './DrawerMenu';
import Header from './Header';
import styles from './Layout.module.css';
import { BrandLogo } from './BrandLogo';
import { MainScene } from './MainScene';
import { Robot } from './Robot';
import { CameraStream } from './CameraStream';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [isOpen, setOpen] = useState(false);
  const [isLive, setIsLive] = useState(false);

  return (
    <div className={styles.root}>
      <DrawerMenu isOpen={isOpen} setOpen={setOpen} />
      <div className={styles.mainArea}>
        <Header />
        <div className={styles.contentArea}>
          <div className={styles.leftArea}>
            <div className={styles.pageContainer}>
              <Outlet />
            </div>
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
        <div className={styles.logoArea}>
          <BrandLogo />
        </div>
      </div>
    </div>
  );
}
