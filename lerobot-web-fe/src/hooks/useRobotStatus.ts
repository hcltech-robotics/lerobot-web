import { useEffect, useState } from 'react';
import { getStatus } from '../services/status.service';
import { type RobotStatus, ROBOT_MODEL_SO_100 } from '../models/robot.model';

export function useRobotStatus() {
  const [robotStatus, setRobotStatus] = useState<RobotStatus[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { robot_status } = await getStatus();
        //filter out the so-100 model because status response can contain other kind of models.
        const filteredRobotArms = robot_status.filter((robot) => robot.name === ROBOT_MODEL_SO_100);
        setRobotStatus(filteredRobotArms);
      } catch (error) {
        console.error('Failed to fetch robot status: ', error);
        return;
      }
    };

    fetchData();
  }, []);

  return { robotStatus };
}
