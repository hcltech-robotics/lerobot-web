import * as Collapsible from '@radix-ui/react-collapsible';
import { GearIcon, LightningBoltIcon, RocketIcon, LayersIcon } from '@radix-ui/react-icons';
import styles from './DrawerMenu.module.css';
import { Menu, X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  setOpen: (value: boolean) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
}

const pages = [
  { label: 'Teleoperate', icon: <RocketIcon /> },
  { label: 'Calibration', icon: <GearIcon /> },
  { label: 'Policies', icon: <LightningBoltIcon /> },
  { label: 'AI Training', icon: <LayersIcon /> },
];

export function DrawerMenu({ isOpen, setOpen, selectedIndex, setSelectedIndex }: DrawerProps) {
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
          {pages.map((page, index) => (
            <button
              key={page.label}
              className={`${styles.drawerItem} ${selectedIndex === index ? styles.selected : ''}`}
              onClick={() => setSelectedIndex(index)}
            >
              <span className={styles.drawerIcon}>{page.icon}</span>
              {isOpen && <span className={styles.drawerLabel}>{page.label}</span>}
            </button>
          ))}
        </div>
      </nav>
    </Collapsible.Root>
  );
}
