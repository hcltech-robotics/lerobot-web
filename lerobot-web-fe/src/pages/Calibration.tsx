import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import CalibrationTabItem from '../components/CalibrationTabItem';
import { RobotLeaderSelector } from '../components/RobotLeaderSelector';
import { MainScene } from '../components/MainScene';
import { Robot } from '../components/Robot';

import { calibrationSteps as steps } from '../constants/calibration';
import { performCalibrationStep } from '../services/calibration.service';
import { useStatusStore } from '../stores/status.store';
import { useCalibration } from '../hooks/useCalibration';
import type { Step } from '../models/calibration.model';

import styles from './Calibration.module.css';

export default function Calibration() {
  const [isLive, setIsLive] = useState(false);
  const [selectedRobotIndex, setSelectedRobotIndex] = useState('0');

  const { currentStep, tabValue, completed, goToNextStep, resetCalibration } = useCalibration();

  const status = useStatusStore((s) => s.status);
  const robotOptions =
    status?.robot_status?.map((robot, index) => ({
      label: `${robot.device_name}`,
      value: index.toString(),
    })) || [];

  const selectedRobot = status?.robot_status?.[parseInt(selectedRobotIndex)] ?? null;

  const handleTabClick = async (index: number) => {
    if (index !== currentStep || !selectedRobot) return;

    const step = steps[index] as Step;

    try {
      if (step.step) {
        await performCalibrationStep(selectedRobotIndex);
      }

      goToNextStep();
    } catch (error) {
      console.error('Calibration API call failed', error);
      return;
    }
  };


  return (
    <div className={styles.contentArea}>
      <div className={styles.controlPanel}>
        <div className={styles.selectWrapper}>
          <RobotLeaderSelector label="Select Robot ID" disabled={dropdownDisabled} />
          {dropdownDisabled && !completed && (
            <div className={styles.progressIndicator}>
              <p>Calibration in progress</p>
              <span className={styles.loader} />
            </div>
          )}
        </div>
        <Tabs.Root value={tabValue}>
          <Tabs.List className={styles.tabsList}>
            {steps.map((step, index) => {
              const isFirst = index === 0;
              const disabled = isFirst && (!selectedRobotIndex || robotOptions.length === 0);
              return (
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
                  disabled={disabled}
                />
              );
            })}
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
