import { EMPTY_ROBOT_INDEX } from '../models/robot.model';
import { useStatusStore } from '../stores/status.store';
import Selector from './Selector';

interface RobotLeaderSelectorProps {
  label?: string;
  disabled?: boolean;
}

export function RobotLeaderSelector({ label = 'Select a Leader Robot', disabled = false }: RobotLeaderSelectorProps) {
  const status = useStatusStore((s) => s.status);
  const selectedLeader = useStatusStore((s) => s.selectedLeader);
  const setSelectedLeader = useStatusStore((s) => s.setSelectedLeader);

  const getRobotIndex = (deviceName: string) => {
    return status?.robot_status.findIndex((robot) => robot.device_name === deviceName).toString() || EMPTY_ROBOT_INDEX;
  };

  const robotList = status?.robot_status
    .filter((robot) => robot.device_name)
    .map((robot) => ({ label: `${robot.name} (${robot.device_name})`, value: getRobotIndex(robot.device_name as string) }));

  return (
    <>
      {robotList && robotList.length > 0 ? (
        <Selector label={label} value={selectedLeader || ''} onChange={setSelectedLeader} disabled={disabled} options={robotList} />
      ) : (
        <p>There is no robot list.</p>
      )}
    </>
  );
}
