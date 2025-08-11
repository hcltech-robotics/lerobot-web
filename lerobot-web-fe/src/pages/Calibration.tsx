import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import CalibrationTabItem from '../components/CalibrationTabItem';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { startCalibration, sendCalibrationStep } from '../services/calibration.service';
import Selector from '../components/Selector';

import styles from './Calibration.module.css';

interface Step {
  id: string;
  label: string;
  content: string;
  activeLabel: string;
  endpoint?: string;
  finalContent?: string;
}

const steps: Step[] = [
  {
    id: 'start',
    label: 'Start',
    activeLabel: 'Start calibration',
    content: 'Click "Start calibration" to begin the calibration process.',
  },
  {
    id: 'step1',
    label: 'Step 1',
    activeLabel: 'Confirm step 1',
    content:
      'Move the arm forward and fully close the gripper. The moving part of the gripper should be on the left side of the arm. If the robot matches the 3D model, click Confirm step 1.',
  },
  {
    id: 'step2',
    label: 'Step 2',
    activeLabel: 'Confirm step 2',
    content:
      'Fully extend the arm, rotate it to the left, and fully open the gripper. If the robot matches the 3D model, click Confirm step 2.',
  },
  {
    id: 'finish',
    label: 'Finish',
    activeLabel: 'Finish calibration',
    content: 'Return the arms to the resting position, then click Finish to complete the calibration.',
  },
];

export default function Calibration() {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [tabValue, setTabValue] = useState<string>((steps[0] as Step).id);
  const [completed, setCompleted] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<string>('');
  const [dropdownDisabled, setDropdownDisabled] = useState<boolean>(false);
  const [isLive, setIsLive] = useState(false);

  const robotKind = 'follower';

  const handleTabClick = async (index: number) => {
    if (index !== currentStep) return;

    const step = steps[index] as Step;

    if (step.id === 'start') {
      try {
        await startCalibration(selectedId, robotKind, 'c');
      } catch (error) {
        console.error('Failed to call backend for', step.id, error);
      }
    } else if (step.id !== 'finish') {
      try {
        await sendCalibrationStep(selectedId, robotKind, '');
      } catch (error) {
        console.error('Failed to call backend for', step.id, error);
      }
    }

    if (index < steps.length - 1) {
      setCurrentStep(index + 1);
      setTabValue((steps[index + 1] as Step).id);
    } else {
      setCompleted(true);
    }

    if (index === 0) {
      setDropdownDisabled(true);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setTabValue((steps[0] as Step).id);
    setCompleted(false);
    setDropdownDisabled(false);
  };

  const robotList = [
    {
      label: 'follower',
      value: '58FA1019351',
    },
    {
      label: 'leader',
      value: '5A4B0491371',
    },
  ];

  return (
    <div className={styles.contentArea}>
      <div className={styles.controlPanel}>
        <div className={styles.selectWrapper}>
          <Selector label="Select Robot ID" value={selectedId} options={robotList} onChange={setSelectedId} disabled={dropdownDisabled} />
          {dropdownDisabled && !completed && (
            <div className={styles.progressIndicator}>
              <p>Calibration in progress</p>
              <span className={styles.loader} />
            </div>
          )}
        </div>
        <Tabs.Root value={tabValue}>
          <Tabs.List className={styles.tabsList}>
            {steps.map((step, index) => (
              <CalibrationTabItem
                key={step.id}
                stepId={step.id}
                stepLabel={step.label}
                activeLabel={step.activeLabel}
                index={index}
                currentStep={currentStep}
                completed={completed}
                totalSteps={steps.length}
                onClick={() => handleTabClick(index)}
              />
            ))}
          </Tabs.List>

          {steps.map((step) => (
            <Tabs.Content key={step.id} value={step.id} className={styles.tabContent}>
              {!completed ? step.content : <p className={styles.calibrationFinish}>Congratulation, you have finished the calibration</p>}
              {step.id === 'start' && (
                <div className={styles.alert}>
                  <ExclamationTriangleIcon className={styles.alertIcon} />
                  <span>Make sure you can safely support the robot. Torques will be disabled during calibration.</span>
                </div>
              )}
            </Tabs.Content>
          ))}
        </Tabs.Root>

        <button className={styles.resetButton} onClick={reset}>
          Reset Calibration
        </button>
      </div>
      <div className={styles.sceneContainer}>
        <button className={`${styles.isLive} ${isLive ? styles.online : styles.offline}`} onClick={() => setIsLive(!isLive)}>
          {isLive ? 'Online' : 'Offline'}
        </button>
        <div className={styles.mainScene}>
          <MainScene>
            <Robot isLive={isLive} />
          </MainScene>
        </div>
      </div>
    </div>
  );
}
