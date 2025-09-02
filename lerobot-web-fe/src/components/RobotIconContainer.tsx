import { useEffect, useState } from 'react';
import { DEFAULT_ROBOT_COUNT, robotRoleList, robotSideList } from '../models/robot.model';
import PopoverWrapper from './PopoverWrapper';
import { RobotIcons } from './RobotIcons';
import { useRobotStore } from '../stores/robot.store';
import ToggleSwitch, { type ToggleSwitchChange } from './ToggleSwitch';
import { capitalizeFirstLetter, getCheckedSwitch, toggleSelectedRobotRole, toggleSelectedRobotSide } from '../services/robot.service';
import Loader from './Loader';
import { Checkbox } from './Checkbox';

import styles from './RobotIconContainer.module.css';

export default function RobotIconContainer() {
  const robots = useRobotStore((store) => store.robots);
  const setRobots = useRobotStore((store) => store.setRobots);
  const robotList = useRobotStore((store) => store.robotList);
  const isBimanualMode = useRobotStore((store) => store.isBimanualMode);
  const setIsBimanualMode = useRobotStore((store) => store.setIsBimanualMode);
  const [leaderIndexes, setLeaderIndexes] = useState<number[] | null>(null);
  const isRobotsLoading = useRobotStore((store) => store.isLoading);

  if (!robotList) {
    return;
  }

  useEffect(() => {
    if (robotList.length < 4) {
      setIsBimanualMode(false);
    }
  }, [robotList]);

  useEffect(() => {
    if (!robots || !robots.length) {
      setLeaderIndexes(null);
      return;
    }

    const indexes = robots.reduce<number[]>((acc, robot, index) => {
      if (robot.role === robotRoleList.LEADER) {
        acc.push(index);
      }
      return acc;
    }, []);

    setLeaderIndexes(indexes);
  }, [robots]);

  const connectedRobotIcons = (
    <div tabIndex={0} role="button">
      <RobotIcons robotCount={robotList.length} setActive={true} leaderIndex={leaderIndexes} />
    </div>
  );
  const disconnectedRobotIcons = <RobotIcons robotCount={DEFAULT_ROBOT_COUNT} />;

  const onModeChange = ({ change }: ToggleSwitchChange) => {
    setIsBimanualMode(change);
  };

  const onArmChange = ({ change, id }: ToggleSwitchChange) => {
    if (!id || !robots) {
      return;
    }

    const mappedRobots = toggleSelectedRobotSide(id, change, robots);
    setRobots(mappedRobots);
  };

  const onLeaderChanged = (selectedRobotId: string) => {
    if (!robots) {
      return;
    }

    const mappedRobots = toggleSelectedRobotRole(selectedRobotId, robots);
    setRobots(mappedRobots);
  };

  return (
    <>
      {robotList.length > 0 ? (
        <PopoverWrapper title="Robot Info" trigger={connectedRobotIcons}>
          {isRobotsLoading && <Loader />}
          <ToggleSwitch
            title="Hand mode"
            labels={['Manual', 'Bimanual']}
            checked={isBimanualMode}
            disabled={robotList.length < 4}
            onChange={onModeChange}
          />
          <div className={styles.divider} />
          {robots &&
            robots.map((robot, index) => (
              <div key={index} className={styles.robotDetail}>
                <div className={styles.robotRow}>
                  <span className={styles.robotId}>#{index}</span>
                  <span className={styles.robotName} title={robot.id}>
                    {robot.id}
                  </span>
                  <ToggleSwitch
                    id={robot.id}
                    labels={[capitalizeFirstLetter(robotSideList.LEFT), capitalizeFirstLetter(robotSideList.RIGHT)]}
                    checked={getCheckedSwitch(robot.id, robots)}
                    disabled={robotList.length < 4}
                    onChange={onArmChange}
                  />
                  <Checkbox id={robot.id} checked={robot.role === robotRoleList.LEADER} onCheckedChange={onLeaderChanged} />
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
