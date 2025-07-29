import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import CalibrationTabItem from '../components/CalibrationTabItem';
import Selector from '../components/Selector';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';

import { calibrationFirstStepJointStates, startPositionJointState } from '../constants/robotPositions';
import { calibrationSteps } from '../constants/calibration';
import { useCalibration } from '../hooks/useCalibration';
import { useSecondStepAnimation } from '../hooks/useSecondStepAnimation';
import type { CalibrationStep } from '../models/calibration.model';

import styles from './Calibration.module.css';

export default function Calibration() {
  const [selectedRobotIndex, setSelectedRobotIndex] = useState('0');

  const { currentStep, tabValue, completed, goToNextStep, restartCalibration } = useCalibration();

  const robotOptions = [
    { label: 'Robot Arm 1', value: '0' },
    { label: 'Robot Arm 2', value: '1' },
  ];

  const selectedRobot = robotOptions[parseInt(selectedRobotIndex)];

  const handleTabClick = async (index: number) => {
    if (index !== currentStep || !selectedRobot) return;

    const step = calibrationSteps[index] as CalibrationStep;

    try {
      if (step.step) {
        await new Promise((res) => setTimeout(res, 1000));
      }

      goToNextStep();
    } catch (error) {
      console.error('Calibration API call failed', error);
      return;
    }
  };

  const secondStepActive = currentStep === 2;
  const secondStepAnimationState = useSecondStepAnimation(secondStepActive);
  const calibrationJointState =
    currentStep === 1 ? calibrationFirstStepJointStates : currentStep === 2 ? secondStepAnimationState : startPositionJointState;

  return (
    <div className={styles.contentArea}>
      <div className={styles.controlPanel}>
        <div className={styles.selectWrapper}>
          <Selector
            label="Select robot arm to calibrate"
            options={robotOptions}
            value={selectedRobotIndex}
            onChange={setSelectedRobotIndex}
            disabled={currentStep !== 0 || completed}
          />
          {currentStep > 0 && !completed && (
            <div className={styles.progressIndicator}>
              <p>Calibration in progress</p>
              <span className={styles.loader} />
            </div>
          )}
        </div>

        <Tabs.Root value={tabValue}>
          <Tabs.List className={styles.tabsList}>
            {calibrationSteps.map((step, index) => {
              const isFirst = index === 0;
              const disabled = isFirst && (!selectedRobotIndex || robotOptions.length === 0);
              return (
                <CalibrationTabItem
                  key={step.id}
                  id={step.id}
                  label={step.label}
                  activeLabel={step.activeLabel}
                  index={index}
                  currentStep={currentStep}
                  completed={completed}
                  totalSteps={calibrationSteps.length}
                  onClick={() => handleTabClick(index)}
                  disabled={disabled}
                />
              );
            })}
          </Tabs.List>

          {calibrationSteps.map((step) => (
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

        <button className={styles.restartButton} onClick={restartCalibration} disabled={!completed}>
          Restart Calibration
        </button>
      </div>

      <div className={styles.sceneContainer}>
        <div className={styles.mainScene}>
          <MainScene>
            <Robot isLive={false} calibrationJointState={calibrationJointState} />
          </MainScene>
        </div>
      </div>
    </div>
  );
}
