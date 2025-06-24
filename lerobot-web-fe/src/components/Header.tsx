import { useState } from 'react';
import styles from './Header.module.css';
import FollowerArmIcon from './FollowerArmIcon';
import PopoverWrapper from './PopoverWrapper';
import LeaderArmIcon from './LeaderArmIcon';
import { HandIcon } from '@radix-ui/react-icons';
import { useRobotStatus } from '../hooks/useRobotStatus';

export default function Appbar() {
  const { robotStatus, isConnected } = useRobotStatus();
  const [leaderIndex, setLeaderIndex] = useState<number | null>(null);

  const handleSetLeader = (index: number) => {
    setLeaderIndex(index);
  };

  return (
    <header className={styles.appbar}>
      <h1 className={styles.title}>Lerobot Robot Arm</h1>
      {isConnected ? (
        <PopoverWrapper
          title="Robot Info"
          trigger={
            <div className={styles.robotIcons} title="Click to view robot status">
              {robotStatus.map((_, index) => (
                <div key={index} className={`${styles.robotIcon} ${styles.active}`}>
                  {index === leaderIndex ? <LeaderArmIcon /> : <FollowerArmIcon />}
                </div>
              ))}
            </div>
          }
        >
          {robotStatus.map((robot, index) => (
            <div key={index} className={styles.robotDetail}>
              <div className={styles.robotRow}>
                <span className={styles.robotId}>#{index}</span>
                <span className={styles.robotType}>{robot.name}</span>
                <span className={styles.robotDevice}>{robot.device_name}</span>
                <button
                  className={`${styles.leaderButton} ${leaderIndex === index ? styles.leaderActive : ''}`}
                  onClick={() => handleSetLeader(index)}
                  title="Set as Leader"
                >
                  <HandIcon />
                </button>
              </div>
              {index < robotStatus.length - 1 && <div className={styles.divider} />}
            </div>
          ))}
        </PopoverWrapper>
      ) : (
        <div className={styles.robotIcon}>
          <FollowerArmIcon />
          <FollowerArmIcon />
        </div>
      )}
    </header>
  );
}
