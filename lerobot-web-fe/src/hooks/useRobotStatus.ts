import { useEffect, useState } from 'react';
import { getStatus } from '../services/status.service';

export function useRobotStatus() {
  const [robotStatus, setRobotStatus] = useState<{ device_name: string; name: string; robot_type: string }[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
          const { robot_status, leader_follower_status } = await getStatus();
          //filter out the so-100 model because status response can contain other kind of models.
          const filteredRobots = robot_status.filter((robot) => robot.name === 'so-100');
        setRobotStatus(filteredRobots);
        setIsConnected(leader_follower_status);
      } catch (error) {
        console.error("Failed to fetch robot status: ", error);
      }
    };

    fetchData();
  }, []);
  
  return { robotStatus, isConnected };
}