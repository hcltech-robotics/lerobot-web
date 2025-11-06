import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import CalibrationTabItem from '../components/CalibrationTabItem';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';
import { confirmCalibrationStart, confirmCalibrationStep, startCalibration } from '../services/calibration.service';
import { calibrationFirstStepJointStates, startPositionJointState } from '../models/calibration.model';
import { calibrationSteps } from '../models/calibration.model';
import { useCalibration } from '../hooks/useCalibration';
import { useSecondStepAnimation } from '../hooks/useSecondStepAnimation';
import type { CalibrationStep } from '../models/calibration.model';
import { useRobotStore } from '../stores/robot.store';
import { Selector } from '../components/Selector';

import styles from './Calibration.module.css';

export default function Calibration() {
  const [selectedId, setSelectedId] = useState<string>('');
  const robots = useRobotStore((store) => store.robots);
  const robotType = useRobotStore((store) => store.robotType);
  const robotKind = robots!.find((robot) => robot.id === selectedId)?.role;
  const { currentStep, tabValue, completed, goToNextStep, restartCalibration } = useCalibration();

  const mappedRobots = robots && robots.map((item) => ({ label: `${item.side}-${item.role} (${item.id})`, value: item.id }));

  const secondStepActive = currentStep === 2;
  const secondStepAnimationState = useSecondStepAnimation(secondStepActive);
  const calibrationJointState =
    currentStep === 1 ? calibrationFirstStepJointStates : currentStep === 2 ? secondStepAnimationState : startPositionJointState;

  const handleTabClick = async (index: number) => {
    if (index !== currentStep || !selectedId) {
      return;
    }

    const step = calibrationSteps[index] as CalibrationStep;

    try {
      if (step.id === 'start') {
        if (!robotKind) {
          throw new Error('Missing robot kind for startCalibration');
        }
        await startCalibration(selectedId, robotKind, robotType);
        await confirmCalibrationStart();
      } else if (step.id !== 'finish') {
        await confirmCalibrationStep();
      }
      if (step.step) {
        await new Promise((res) => setTimeout(res, 1000));
      }
      goToNextStep();
    } catch (error) {
      console.error('Calibration API call failed for', step.id, error);
    }
  };

  return (
    <div className={styles.contentArea}>
      <div className={styles.controlPanel}>
        <h2 className={styles.title}>Calibration</h2>
        <div>
          <Selector
            label="Select a robot arm"
            selected={selectedId}
            options={mappedRobots || []}
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
              {!completed ? step.content : <p className={styles.calibrationFinish}>Congratulation, you have finished the calibration!</p>}
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
          <MainScene zoom={5}>
            <Robot isLive={false} calibrationJointState={calibrationJointState} robotLabel={selectedId} />
          </MainScene>
        </div>
      </div>
    </div>
  );
}
