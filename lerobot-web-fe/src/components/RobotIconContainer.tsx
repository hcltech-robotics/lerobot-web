import { HandIcon } from '@radix-ui/react-icons';
import { DEFAULT_ROBOT_COUNT } from '../models/robot.model';
import PopoverWrapper from './PopoverWrapper';
import { RobotIcons } from './RobotIcons';
import { useRobotStore } from '../stores/robot.store';

import styles from './RobotIconContainer.module.css';
import { Switch } from 'radix-ui';
import { useEffect } from 'react';

export default function RobotIconContainer() {
  const setSelectedLeader = useRobotStore((store) => store.setSelectedLeader);
  const robotList = useRobotStore((store) => store.robotList);
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);
  const setIsBimanualMode = useRobotStore((store) => store.setIsBimanualMode);

  if (!robotList) {
    return;
  }

  useEffect(() => {
    if (robotList.length < 4) {
      setIsBimanualMode(false);
    }
  }, [robotList]);

  const connectedRobotIcons = (
    <div tabIndex={0} role="button">
      <RobotIcons robotCount={robotList.length} setActive={true} leaderIndex={null} />
    </div>
  );
  const disconnectedRobotIcons = <RobotIcons robotCount={DEFAULT_ROBOT_COUNT} />;

  const handleSwitchChange = (checked: boolean) => {
    setIsBimanualMode(checked);
  };

  return (
    <>
      {robotList.length > 0 ? (
        <PopoverWrapper title="Robot Info" trigger={connectedRobotIcons}>
          <div className={styles.SwitchWrapper}>
            <label>Hand mode</label>
            <div className={styles.SwitchContainer}>
              <label>Manual</label>
              <Switch.Root
                className={styles.Switch}
                checked={isBimanualMode}
                disabled={robotList.length < 4}
                onCheckedChange={handleSwitchChange}
              >
                <Switch.Thumb className={styles.SwitchThumb} />
              </Switch.Root>
              <label>Bimanual</label>
            </div>
          </div>
          <div className={styles.divider} />
          {robotList.map((_, index) => (
            <div key={index} className={styles.robotDetail}>
              <div className={styles.robotRow}>
                <span className={styles.robotId}>#{index}</span>
                <span>robot.name</span>
                <span>robot.device_name</span>
                <button
                  className={`${styles.leaderButton} ${null === index ? styles.leaderActive : ''}`}
                  onClick={() => setSelectedLeader(index.toString())}
                  title="Set as Leader"
                >
                  <HandIcon />
                </button>
              </div>
              {index < robotList.length - 1 && <div className={styles.divider} />}
            </div>
          ))}
        </PopoverWrapper>
      ) : (
        disconnectedRobotIcons
      )}
    </>
  );
}
