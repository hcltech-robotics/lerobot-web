import { HandIcon } from '@radix-ui/react-icons';
import { DEFAULT_ROBOT_COUNT, ROBOT_MODEL_SO_100 } from '../models/robot.model';
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

  const filteredRobots = status.robot_status.filter((robot) => robot.name === ROBOT_MODEL_SO_100);

  const connectedRobotIcons = <RobotIcons robotCount={filteredRobots.length} setActive={true} leaderIndex={selectedLeaderIndex} />;
  const disconnectedRobotIcons = <RobotIcons robotCount={DEFAULT_ROBOT_COUNT} />;

  return (
    <>
      {filteredRobots.length > 0 ? (
        <PopoverWrapper title="Robot Info" trigger={connectedRobotIcons}>
          {filteredRobots.map((robot, index) => (
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
              {index < filteredRobots.length - 1 && <div className={styles.divider} />}
            </div>
          ))}
        </PopoverWrapper>
      ) : (
        disconnectedRobotIcons
      )}
    </>
  );
}
