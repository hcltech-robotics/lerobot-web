import type { Step } from '../models/calibration.model';

export const calibrationSteps: Step[] = [
  {
    id: 'start',
    label: 'Start',
    activeLabel: 'Start calibration',
    content: 'Click "Start calibration" to begin the calibration process.',
    step: 'start',
  },
  {
    id: 'step1',
    label: 'Step 1',
    activeLabel: 'Confirm step 1',
    content:
      'Move the arm forward and fully close the gripper. The moving part of the gripper should be on the top. If the robot matches the 3D model, click Confirm step 1.',
    step: '1',
  },
  {
    id: 'step2',
    label: 'Step 2',
    activeLabel: 'Confirm step 2',
    content: 'Move each joint through its full range of motion',
    step: '2',
  },
  {
    id: 'finish',
    label: 'Finish',
    activeLabel: 'Finish calibration',
    content: 'Return the arms to the resting position, then click Finish to complete the calibration.',
  },
];
