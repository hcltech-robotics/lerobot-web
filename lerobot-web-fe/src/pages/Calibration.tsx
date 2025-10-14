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
import { OnlineStatusButton } from '../components/OnlineStatusButton';
import { Selector } from '../components/Selector';

import styles from './Calibration.module.css';

export default function Calibration() {
  const [selectedId, setSelectedId] = useState<string>('');
  const [isLive, setIsLive] = useState(false);
  const [robotName, setRobotName] = useState('');
  const robots = useRobotStore((store) => store.robots);
  const robotList = useRobotStore((store) => store.robotList);
  const robotKind = robots!.find((robot) => robot.id === selectedId)?.role;

  const { currentStep, tabValue, completed, goToNextStep, restartCalibration } = useCalibration();

  const secondStepActive = currentStep === 2;
  const secondStepAnimationState = useSecondStepAnimation(secondStepActive);
  const calibrationJointState =
    currentStep === 1 ? calibrationFirstStepJointStates : currentStep === 2 ? secondStepAnimationState : startPositionJointState;

  const handleTabClick = async (index: number) => {
    if (index !== currentStep || !selectedId) return;
    const step = calibrationSteps[index] as CalibrationStep;

    try {
      if (step.id === 'start') {
        if (!robotKind) throw new Error('Missing robot kind for startCalibration');
        await startCalibration(selectedId, robotKind, robotName);
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
          <div className={styles.selectorWrapper}>
            <Selector
              label="Select Robot ID"
              selected={selectedId}
              options={robotList || []}
              onChange={setSelectedId}
              disabled={currentStep !== 0 || completed}
            />
          </div>
          <div className={styles.nameWrapper}>
            <label htmlFor="name">Add a name for the robot</label>
            <input
              type="text"
              name="name"
              id="name"
              value={robotName}
              onChange={(e) => setRobotName(e.target.value)}
              disabled={currentStep !== 0 || completed}
            />
          </div>
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
          Restart Calibration
        </button>
      </div>
      <div className={styles.sceneContainer}>
        <OnlineStatusButton isLive={isLive} onClick={setIsLive} />
        <div className={styles.mainScene}>
          <MainScene zoom={5}>
            <Robot isLive={isLive} calibrationJointState={calibrationJointState} />
          </MainScene>
        </div>
      </div>
    </div>
  );
}
