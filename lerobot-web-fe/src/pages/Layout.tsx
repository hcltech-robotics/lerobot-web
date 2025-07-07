import { useState } from 'react';
import { DrawerMenu } from '../components/DrawerMenu';
import Header from '../components/Header';
import styles from './Layout.module.css';
import { BrandLogo } from '../components/BrandLogo';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  const [isOpen, setOpen] = useState(false);

  return (
    <div className={styles.root}>
      <DrawerMenu isOpen={isOpen} setOpen={setOpen} />
      <div className={styles.mainArea}>
        <Header />
        <Outlet />
        <div className={styles.logoArea}>
          <BrandLogo />
        </div>
      </div>
    </div>
  );
}
