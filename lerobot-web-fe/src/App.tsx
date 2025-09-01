import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { getCameraList } from './services/camera.service';
import { useConfigStore } from './stores/config.store';
import { getRobotList } from './services/robot.service';
import { useRobotStore } from './stores/robot.store';
import { robotRoleList, robotSideList, type RobotItem } from './models/robot.model';

export default function App() {
  const apiUrl = useConfigStore((store) => store.apiUrl);
  const setRobots = useRobotStore((store) => store.setRobots);
  const robots = useRobotStore((store) => store.robots);
  const setIsLoading = useRobotStore((store) => store.setIsLoading);

  useEffect(() => {
    if (!apiUrl) {
      return;
    }

    setIsLoading(true);

    const robotsCopy = [...(robots ?? [])];

    fetchInitialData()
      .then(([robotsResponse]) => {
        const robotIds = new Set(robotsResponse);
        const existingRobots = robotsCopy.filter((robot) => robotIds.has(robot.id));
        const newMappedRobots: RobotItem[] = robotsResponse
          .filter((id) => !robots?.some((robot) => robot.id === id))
          .map((id) => ({
            id,
            side: robotSideList.LEFT,
            role: robotRoleList.FOLLOWER,
          }));

        setRobots([...existingRobots, ...newMappedRobots]);
      })
      .finally(() => setIsLoading(false));
  }, [apiUrl]);

  const fetchInitialData = async () => {
    return await Promise.all([getRobotList(), getCameraList()]);
  };

  return (
    <>
      <AppRouter />
    </>
  );
}
