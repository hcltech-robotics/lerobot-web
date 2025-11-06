import { useEffect } from 'react';
import AppRouter from './routers/AppRouter';
import { getCameraList } from './services/camera.service';
import { useConfigStore } from './stores/config.store';
import { getRobotList } from './services/robot.service';
import { useRobotStore } from './stores/robot.store';
import { robotRoleList, robotSideList, type RobotItem, type RobotTypes } from './models/robot.model';
import { ToastProvider } from './components/ToastProvider';

export default function App() {
  const apiUrl = useConfigStore((store) => store.apiUrl);
  const setRobots = useRobotStore((store) => store.setRobots);
  const robots = useRobotStore((store) => store.robots);
  const setIsLoading = useRobotStore((store) => store.setIsLoading);
  const robotType = useRobotStore((store) => store.robotType);

  useEffect(() => {
    if (!apiUrl) {
      return;
    }

    setIsLoading(true);

    const robotsCopy = [...(robots ?? [])];

    fetchInitialData(robotType)
      .then(([robotsResponse]) => {
        if (!robotsResponse) {
          return;
        }

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
  }, [apiUrl, robotType]);

  const fetchInitialData = async (robotType: RobotTypes) => {
    return await Promise.all([getRobotList(robotType), getCameraList()]);
  };

  return (
    <>
      <AppRouter />
      <ToastProvider />
    </>
  );
}
