import { useEffect, useState } from 'react';
import { getStatus } from '../services/status.service';
import { type RobotStatus, ROBOT_MODEL_SO_100 } from '../models/robot.model';

export function useRobotStatus() {
  const [robotStatus, setRobotStatus] = useState<RobotStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { robot_status } = await getStatus();
        const filteredRobotArms = robot_status.filter((robot) => robot.name === ROBOT_MODEL_SO_100);
        setRobotStatus(filteredRobotArms);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch robot status: ', error);
        setError((error as Error).message);
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { robotStatus };
}
