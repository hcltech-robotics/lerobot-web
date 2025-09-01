import { useRobotStore } from '../stores/robot.store';
import FollowerArmIcon from './FollowerArmIcon';
import LeaderArmIcon from './LeaderArmIcon';
import Loader from './Loader';

import styles from './RobotIcons.module.css';

interface RobotIconsProps {
  robotCount: number;
  setActive?: boolean;
  leaderIndex?: number[] | null;
}

export const RobotIcons = ({ robotCount, setActive = false, leaderIndex = null }: RobotIconsProps) => {
  const isRobotsLoading = useRobotStore((store) => store.isLoading);
  const hasLeader = leaderIndex !== null;

  return (
    <div className={styles.robotIcons}>
      {isRobotsLoading && <Loader showText={false} />}
      {Array.from({ length: robotCount }).map((_, index) => (
        <div key={index} className={`${styles.robotIcon} ${setActive ? styles.active : ''}`}>
          {hasLeader && leaderIndex.includes(index) ? <LeaderArmIcon /> : <FollowerArmIcon />}
        </div>
      ))}
    </div>
  );
};
