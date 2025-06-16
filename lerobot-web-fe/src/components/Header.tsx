import styles from './Header.module.css';
import RobotIcon from './RobotIcon';

interface AppbarProps {
  isDrawerOpen: boolean;
  robotStatus: boolean[];
}

export default function Appbar({ isDrawerOpen, robotStatus }: AppbarProps) {
  return (
    <header className={`${styles.appbar} ${isDrawerOpen ? styles.open : styles.closed}`}>
      <h1 className={styles.title}>Lerobot Robot Arm</h1>
      <div className={styles.robotIcons}>
        {robotStatus.map((isActive, idx) => (
          <RobotIcon key={idx} className={isActive ? styles.activeRobotIcon : styles.inactiveRobotIcon} />
        ))}
      </div>
    </header>
  );
}
