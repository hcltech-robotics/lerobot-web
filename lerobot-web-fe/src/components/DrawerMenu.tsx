import * as Collapsible from '@radix-ui/react-collapsible';
import {
  GearIcon,
  LightningBoltIcon,
  RocketIcon,
  LayersIcon,
  MixerVerticalIcon,
  HamburgerMenuIcon,
  Cross1Icon,
} from '@radix-ui/react-icons';
import { NavLink } from 'react-router-dom';

import styles from './DrawerMenu.module.css';

interface DrawerProps {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
}

const pages = [
  { label: 'Teleoperate', path: '/teleoperate', icon: <RocketIcon /> },
  { label: 'Calibration', path: '/calibration', icon: <GearIcon /> },
  { label: 'AI Control', path: '/ai-control', icon: <LightningBoltIcon /> },
  { label: 'Record Dataset', path: '/record-dataset', icon: <LayersIcon /> },
  { label: 'Configuration', path: '/configuration', icon: <MixerVerticalIcon /> },
];

export function DrawerMenu({ isOpen, setOpen }: DrawerProps) {
  return (
    <Collapsible.Root open={isOpen} onOpenChange={setOpen}>
      <nav className={`${styles.drawer} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.drawerHeader}>
          {!isOpen ? (
            <HamburgerMenuIcon className={styles.burger} onClick={() => setOpen(true)} />
          ) : (
            <Cross1Icon className={styles.close} onClick={() => setOpen(false)} />
          )}
        </div>

        <div className={styles.drawerContent}>
          {pages.map((page) => (
            <NavLink
              key={page.label}
              to={page.path}
              className={({ isActive }) => `${styles.drawerItem} ${isActive ? styles.selected : ''}`}
            >
              <span className={styles.drawerIcon}>{page.icon}</span>
              {isOpen && <span className={styles.drawerLabel}>{page.label}</span>}
            </NavLink>
          ))}
        </div>
      </nav>
    </Collapsible.Root>
  );
}
