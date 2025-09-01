import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import CalibrationTabItem from '../components/CalibrationTabItem';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { confirmCalibrationStart, confirmCalibrationStep, startCalibration } from '../services/calibration.service';
import { BaseSelector } from '../components/BaseSelector';
import { type SelectOption } from '../components/BaseSelector';

import styles from './Calibration.module.css';
import { calibrationFirstStepJointStates, startPositionJointState } from '../models/calibration.model';
import { calibrationSteps } from '../models/calibration.model';
import { useCalibration } from '../hooks/useCalibration';
import { useSecondStepAnimation } from '../hooks/useSecondStepAnimation';
import type { CalibrationStep } from '../models/calibration.model';
import type { RobotItem } from '../models/robot.model';
import { useRobotStore } from '../stores/robot.store';

const getSelectOptionsFromRobotItems = (robotList: RobotItem[]): SelectOption[] =>
  robotList.map((robot) => ({
    label: `${robot.side} ${robot.role}`,
    value: robot.id,
  }));

export default function Calibration() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLive, setIsLive] = useState(false);
  const robots = useRobotStore.getState().robots;
  const robotList = getSelectOptionsFromRobotItems(robots!) as SelectOption[];
  const robotKind = robots!.find((robot) => robot.id === selectedId)?.role;

  const { currentStep, tabValue, completed, goToNextStep, restartCalibration } = useCalibration();

  const secondStepActive = currentStep === 2;
  const secondStepAnimationState = useSecondStepAnimation(secondStepActive);
  const calibrationJointState =
    currentStep === 1 ? calibrationFirstStepJointStates : currentStep === 2 ? secondStepAnimationState : startPositionJointState;

  const handleTabClick = async (index: number) => {
    if (index !== currentStep || !selectedId) return;

    const step = calibrationSteps[index] as CalibrationStep;

    if (step.id === 'start') {
      try {
        await startCalibration(selectedId, robotKind!);
        await confirmCalibrationStart();
      } catch (error) {
        console.error('Failed to call backend for', step.id, error);
      }
    } else if (step.id !== 'finish') {
      try {
        await confirmCalibrationStep();
      } catch (error) {
        console.error('Failed to call backend for', step.id, error);
      }
    }

    try {
      if (step.step) {
        await new Promise((res) => setTimeout(res, 1000));
      }
      goToNextStep();
    } catch (error) {
      console.error('Calibration API call failed', error);
    }
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.controlPanel}>
        <div className={styles.selectWrapper}>
          <BaseSelector
            label="Select Robot ID"
            value={selectedId}
            options={robotList}
            onChange={setSelectedId}
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
              const disabled = isFirst && (!selectedId || robots!.length === 0);
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
          Reset Calibration
        </button>
      </div>
      <div className={styles.sceneContainer}>
        <button className={`${styles.isLive} ${isLive ? styles.online : styles.offline}`} onClick={() => setIsLive(!isLive)}>
          {isLive ? 'Online' : 'Offline'}
        </button>
        <div className={styles.mainScene}>
          <MainScene>
            <Robot isLive={isLive} calibrationJointState={calibrationJointState} />
          </MainScene>
        </div>
      </div>
    </div>
  );
}
