import FollowerArmIcon from './FollowerArmIcon';
import LeaderArmIcon from './LeaderArmIcon';
import styles from './RobotIcons.module.css';

interface RobotIconsProps {
  robotCount: number;
  setActive?: boolean;
  leaderIndex?: number[] | null;
}

export const RobotIcons = ({ robotCount, setActive = false, leaderIndex = null }: RobotIconsProps) => {
  const hasLeader = leaderIndex !== null;

  return (
    <div className={styles.robotIcons}>
      {Array.from({ length: robotCount }).map((_, index) => (
        <div key={index} className={`${styles.robotIcon} ${setActive ? styles.active : ''}`}>
          {hasLeader && leaderIndex.includes(index) ? <LeaderArmIcon /> : <FollowerArmIcon />}
        </div>
      ))}
    </div>
  );
};
