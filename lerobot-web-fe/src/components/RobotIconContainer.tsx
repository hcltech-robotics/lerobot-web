import { useState } from 'react';
import { HandIcon } from '@radix-ui/react-icons';
import { useRobotStatus } from '../hooks/useRobotStatus';
import { DEFAULT_ROBOT_COUNT } from '../models/robot.model';
import PopoverWrapper from './PopoverWrapper';
import { RobotIcons } from './RobotIcons';

import styles from './RobotIconContainer.module.css';

export default function RobotIconContainer() {
  const { robotStatus } = useRobotStatus();
  const [leaderIndex, setLeaderIndex] = useState<number | null>(null);

  const handleSetLeader = (index: number) => {
    setLeaderIndex(index);
  };

  const connectedRobotIcons = <RobotIcons robotCount={robotStatus.length} setActive={true} leaderIndex={leaderIndex} />;
  const disconnectedRobotIcons = <RobotIcons robotCount={DEFAULT_ROBOT_COUNT} />;

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
