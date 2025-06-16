import styles from './Header.module.css';
import RobotIcon from './RobotIcon';

interface AppbarProps {
  isDrawerOpen: boolean;
  robotStatus: boolean[];
}

export default function Appbar({ robotStatus }: AppbarProps) {
  return (
    <header className={styles.appbar}>
      <h1 className={styles.title}>Lerobot Robot Arm</h1>
      <div className={styles.robotIcons}>
        {robotStatus.map((isActive) => (
          <div className={`${styles.robotIcon} ${isActive ? styles.active : ''}`}>
            <RobotIcon />
          </div>
        ))}
      </div>
    </header>
  );
}
