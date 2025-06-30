import * as Collapsible from '@radix-ui/react-collapsible';
import { GearIcon, LightningBoltIcon, RocketIcon, LayersIcon } from '@radix-ui/react-icons';
import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import styles from './DrawerMenu.module.css';

interface DrawerProps {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
}

const pages = [
  { label: 'Teleoperate', path: '/teleoperate', icon: <RocketIcon /> },
  { label: 'Calibration', path: '/calibration', icon: <GearIcon /> },
  { label: 'Policies', path: '/policies', icon: <LightningBoltIcon /> },
  { label: 'AI Training', path: '/ai-training', icon: <LayersIcon /> },
];

export function DrawerMenu({ isOpen, setOpen }: DrawerProps) {
  return (
    <Collapsible.Root open={isOpen} onOpenChange={setOpen}>
      <nav className={`${styles.drawer} ${isOpen ? styles.open : styles.closed}`}>
        <div className={styles.drawerHeader}>
          {!isOpen ? (
            <Menu className={styles.burger} onClick={() => setOpen(true)} />
          ) : (
            <X className={styles.close} onClick={() => setOpen(false)} />
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
