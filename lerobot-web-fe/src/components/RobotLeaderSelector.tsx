import { useEffect, useState } from 'react';
import { EMPTY_ROBOT_INDEX } from '../models/robot.model';
import Selector from './Selector';

interface RobotLeaderSelectorProps {
  robotList: string[];
  label?: string;
  disabled?: boolean;
}

export function RobotLeaderSelector({ robotList, label = 'Select a Leader Robot', disabled = false }: RobotLeaderSelectorProps) {
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

  const setSelectedLeader = (value: string) => {
    console.log('selected. ', value);
  };

  return (
    <>
      {options.length > 0 ? (
        <Selector label={label} value={EMPTY_ROBOT_INDEX} onChange={setSelectedLeader} disabled={disabled} options={options} />
      ) : (
        <p>There is no robot list.</p>
      )}
    </>
  );
}
