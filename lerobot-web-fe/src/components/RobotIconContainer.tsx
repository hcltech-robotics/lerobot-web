import { useState } from 'react';
import FollowerArmIcon from './FollowerArmIcon';
import PopoverWrapper from './PopoverWrapper';
import LeaderArmIcon from './LeaderArmIcon';
import { useRobotStatus } from '../hooks/useRobotStatus';
import { HandIcon } from '@radix-ui/react-icons';
import { ROBOT_NAME } from '../models/robot.model';
import styles from './RobotIconContainer.module.css';

export default function RobotIconContainer() {
  const { robotStatus } = useRobotStatus();
  const [leaderIndex, setLeaderIndex] = useState<number | null>(null);

  const handleSetLeader = (index: number) => {
    setLeaderIndex(index);
  };

  const activeRobotIconsTrigger = (
    <div className={styles.robotIcons} title="Click to view robot status">
      {robotStatus.map((status, index) => (
        <div key={index} className={`${styles.robotIcon} ${status.name === ROBOT_NAME ? styles.active : ''}`}>
          {index === leaderIndex ? <LeaderArmIcon /> : <FollowerArmIcon />}
        </div>
      ))}
    </div>
  );

  return (
    <>
      {robotStatus.length > 0 ? (
        <PopoverWrapper title="Robot Info" trigger={activeRobotIconsTrigger}>
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
        <>
          <div className={styles.robotIcon}>
            <FollowerArmIcon />
          </div>
          <div className={styles.robotIcon}>
            <FollowerArmIcon />
          </div>
        </>
      )}
    </>
  );
}
