import { HandIcon } from '@radix-ui/react-icons';
import { DEFAULT_ROBOT_COUNT } from '../models/robot.model';
import PopoverWrapper from './PopoverWrapper';
import { RobotIcons } from './RobotIcons';
import { useStatusStore } from '../stores/status.store';

import styles from './RobotIconContainer.module.css';

export default function RobotIconContainer() {
  const status = useStatusStore((s) => s.status);
  const selectedLeader = useStatusStore((s) => s.selectedLeader);
  const setSelectedLeader = useStatusStore((s) => s.setSelectedLeader);
  const selectedLeaderIndex = selectedLeader ? Number(selectedLeader) : null;

  if (!status) {
    return;
  }

  const connectedRobotIcons = (
    <div tabIndex={0} role="button">
      <RobotIcons robotCount={status.robot_status.length} setActive={true} leaderIndex={selectedLeaderIndex} />
    </div>
  );
  const disconnectedRobotIcons = <RobotIcons robotCount={DEFAULT_ROBOT_COUNT} />;

  return (
    <>
      {status.robot_status.length > 0 ? (
        <PopoverWrapper title="Robot Info" trigger={connectedRobotIcons}>
          {status.robot_status.map((robot, index) => (
            <div key={index} className={styles.robotDetail}>
              <div className={styles.robotRow}>
                <span className={styles.robotId}>#{index}</span>
                <span>{robot.name}</span>
                <span>{robot.device_name}</span>
                <button
                  className={`${styles.leaderButton} ${selectedLeaderIndex === index ? styles.leaderActive : ''}`}
                  onClick={() => setSelectedLeader(index.toString())}
                  title="Set as Leader"
                >
                  <HandIcon />
                </button>
              </div>
              {index < status.robot_status.length - 1 && <div className={styles.divider} />}
            </div>
          ))}
        </PopoverWrapper>
      ) : (
        disconnectedRobotIcons
      )}
    </>
  );
}
