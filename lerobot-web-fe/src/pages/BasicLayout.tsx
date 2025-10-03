import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { DrawerMenu } from '../components/DrawerMenu';
import Header from '../components/Header';
import { BrandLogo } from '../components/BrandLogo';

import styles from './Layout.module.css';

export function BasicLayout() {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className={styles.root}>
      <DrawerMenu isOpen={isOpen} setOpen={setOpen} />
      <div className={styles.mainArea}>
        <Header />
        <div className={styles.contentArea}>
          <Outlet />
        </div>
        <div className={styles.logoArea}>
          <BrandLogo />
        </div>
      </div>
    </div>
  );
}
