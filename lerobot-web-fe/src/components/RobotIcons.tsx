import FollowerArmIcon from './FollowerArmIcon';
import LeaderArmIcon from './LeaderArmIcon';
import styles from './RobotIcons.module.css';
import { type RobotStatus } from '../models/robot.model';

interface RobotIconsProps {
  robotList: RobotStatus[];
  setActive?: boolean;
  leaderIndex?: number | null;
}

export const RobotIcons = ({ robotList, setActive = false, leaderIndex = null }: RobotIconsProps) => {
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
