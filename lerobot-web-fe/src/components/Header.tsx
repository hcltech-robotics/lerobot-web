import RobotIconContainer from './RobotIconContainer';

import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Lerobot Robot Arm</h1>
      <RobotIconContainer />
    </header>
  );
}
