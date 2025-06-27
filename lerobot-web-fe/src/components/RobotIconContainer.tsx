import { useState } from 'react';
import { useRobotStatus } from '../hooks/useRobotStatus';
import { HandIcon } from '@radix-ui/react-icons';
import type { RobotStatus } from 'src/models/robot.model';
import PopoverWrapper from './PopoverWrapper';
import styles from './RobotIconContainer.module.css';
import { RobotIcons } from './RobotIcons';

export default function RobotIconContainer() {
  const { robotStatus } = useRobotStatus();
  const [leaderIndex, setLeaderIndex] = useState<number | null>(null);

  const handleSetLeader = (index: number) => {
    setLeaderIndex(index);
  };

  const DEFAULT_ROBOT_PLACEHOLDERS: Array<RobotStatus> = Array.from({ length: 2 });

  const connectedRobotIcons = <RobotIcons robotList={robotStatus} setActive={true} leaderIndex={leaderIndex} />;
  const disconnectedRobotIcons = <RobotIcons robotList={DEFAULT_ROBOT_PLACEHOLDERS} />;

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
