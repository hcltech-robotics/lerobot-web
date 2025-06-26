import { useEffect, useState } from 'react';
import { getStatus } from '../services/status.service';
import { type RobotStatus, ROBOT_NAME } from '../models/robot.model';

export function useRobotStatus() {
  const [robotStatus, setRobotStatus] = useState<RobotStatus[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { robot_status } = await getStatus();
        //filter out the so-100 model because status response can contain other kind of models.
        const filteredRobots = robot_status.filter((robot) => robot.name === ROBOT_NAME);
        setRobotStatus(filteredRobots);
      } catch (error) {
        console.error('Failed to fetch robot status: ', error);
        return;
      }
    };

    fetchData();
  }, []);

  return { robotStatus };
}
