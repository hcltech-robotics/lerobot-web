import RobotIconContainer from './RobotIconContainer';

import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>HCLTech Robot Dojo</h1>
      <RobotIconContainer />
    </header>
  );
}
