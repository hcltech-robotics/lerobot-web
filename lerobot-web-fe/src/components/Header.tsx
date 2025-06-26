import styles from './Header.module.css';
import RobotIconContainer from './RobotIconContainer';

export default function Appbar() {
  return (
    <header className={styles.appbar}>
      <h1 className={styles.title}>Lerobot Robot Arm</h1>
      <RobotIconContainer />
    </header>
  );
}
