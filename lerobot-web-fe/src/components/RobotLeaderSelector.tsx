import { useEffect, useState } from 'react';
import { EMPTY_ROBOT_INDEX } from '../models/robot.model';
import Selector from './Selector';

interface RobotLeaderSelectorProps {
  robotList: string[];
  selectedRobot: string;
  label?: string;
  disabled?: boolean;
  onChange: (change: string) => void;
}

export function RobotLeaderSelector({
  robotList,
  selectedRobot,
  label = 'Select a Leader Robot',
  disabled = false,
  onChange,
}: RobotLeaderSelectorProps) {
  const [options, setOptions] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (robotList) {
      const robotOptions = robotList.map((robot) => ({
        label: robot,
        value: robot,
      }));
      setOptions(robotOptions);
    }
  }, [robotList]);

  return (
    <>
      {options.length > 0 ? (
        <Selector label={label} value={selectedRobot} disabled={disabled} options={options} onChange={onChange} />
      ) : (
        <p>There is no robot list.</p>
      )}
    </>
  );
}
