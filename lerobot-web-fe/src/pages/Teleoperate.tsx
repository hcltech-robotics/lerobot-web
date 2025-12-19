import { useEffect, useMemo, useState } from 'react';
import { toggleTeleoperate } from '../services/teleoperate.service';
import { teleoperateStatusList } from '../models/teleoperate.model';
import { TeleoperateControlPanel } from '../components/TeleoperateControlPanel';
import { useRobotStore } from '../stores/robot.store';
import { controlStatus } from '../models/general.model';
import { useRunningStore } from '../stores/running.store';

export default function Teleoperate() {
  const [teleoperateStatus, setTeleoperateStatus] = useState<string>(teleoperateStatusList.READY);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const robots = useRobotStore((store) => store.robots);
  const isRunning = useMemo(() => teleoperateStatus === teleoperateStatusList.RUN, [teleoperateStatus]);
  const setRunning = useRunningStore((state) => state.setRunning);
  const robotType = useRobotStore((state) => state.robotType);

  useEffect(() => {
    setRunning('teleoperate', isRunning);
  }, [isRunning]);

  const handleTeleoperate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await toggleTeleoperate(isRunning ? controlStatus.STOP : controlStatus.START, robots!, robotType);

      setTeleoperateStatus(response.message?.toLowerCase().includes('started') ? teleoperateStatusList.RUN : teleoperateStatusList.READY);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeleoperateControlPanel
      status={teleoperateStatus}
      loading={loading}
      error={error}
      isRunning={isRunning}
      onToggleTeleoperate={handleTeleoperate}
    />
  );
}
