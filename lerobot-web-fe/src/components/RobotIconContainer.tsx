import { useState } from 'react';
import FollowerArmIcon from './FollowerArmIcon';
import PopoverWrapper from './PopoverWrapper';
import LeaderArmIcon from './LeaderArmIcon';
import { useRobotStatus } from '../hooks/useRobotStatus';
import { HandIcon } from '@radix-ui/react-icons';
import { type RobotStatus } from '../models/robot.model';
import styles from './RobotIconContainer.module.css';

export default function RobotIconContainer() {
  const { robotStatus } = useRobotStatus();
  const [leaderIndex, setLeaderIndex] = useState<number | null>(null);

  const handleSetLeader = (index: number) => {
    setLeaderIndex(index);
  };

  const DEFAULT_ROBOT_PLACEHOLDERS: Array<RobotStatus> = Array.from({ length: 2 });

  const generateRobotIcons = (robotList: Array<RobotStatus>, setActive: boolean = false, leaderIndex: number | null = null) => {
    const hasLeader = leaderIndex !== null;

    return (
      <div className={styles.robotIcons}>
        {robotList.map((_, index) => (
          <div key={index} className={`${styles.robotIcon} ${setActive ? styles.active : ''}`}>
            {hasLeader && index === leaderIndex ? <LeaderArmIcon /> : <FollowerArmIcon />}
          </div>
        ))}
      </div>
    );
  };

  const connectedRobotIcons = generateRobotIcons(robotStatus, true, leaderIndex);
  const disconnectedRobotIcons = generateRobotIcons(DEFAULT_ROBOT_PLACEHOLDERS, false);

  return (
    <>
      {robotStatus.length > 0 ? (
        <PopoverWrapper title="Robot Info" trigger={connectedRobotIcons}>
          {robotStatus.map((robot, index) => (
            <div key={index} className={styles.robotDetail}>
              <div className={styles.robotRow}>
                <span className={styles.robotId}>#{index}</span>
                <span>{robot.name}</span>
                <span>{robot.device_name}</span>
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
        disconnectedRobotIcons
      )}
    </>
  );
}
