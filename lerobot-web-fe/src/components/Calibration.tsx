import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Select from '@radix-ui/react-select';
import { ExclamationTriangleIcon, ChevronDownIcon } from '@radix-ui/react-icons';

import styles from './Calibration.module.css';

type Step = {
  id: string;
  label: string;
  content: string;
  activeLabel?: string;
  endpoint?: string;
  finalContent?: string;
};

const API_BASE_URL = 'http://127.0.0.1:8000';

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
    endpoint: '`${API_BASE_URL}/step1`',
  },
  {
    id: 'step2',
    label: 'Step 2',
    activeLabel: 'Confirm step 2',
    content:
      'Fully extend the arm, rotate it to the left, and fully open the gripper. If the robot matches the 3D model, click Confirm step 2.',
    endpoint: `${API_BASE_URL}/step2`,
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
  const [selectedId, setSelectedId] = useState<'id_1' | 'id_2'>('id_1');
  const [dropdownDisabled, setDropdownDisabled] = useState<boolean>(false);

  const handleTabClick = async (index: number) => {
    if (index !== currentStep) return;

    const step = steps[index] as Step;

    if (step.endpoint) {
      try {
        await fetch(`${step.endpoint}?id=${selectedId}`, { method: 'POST' });
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

  return (
    <div className={styles.container}>
      <div className={styles.selectWrapper}>
        <label className={styles.selectLabel}>Select Robot ID:</label>
        <Select.Root value={selectedId} onValueChange={(value) => setSelectedId(value as 'id_1' | 'id_2')} disabled={dropdownDisabled}>
          <Select.Trigger className={styles.selectTrigger} aria-label="Robot ID">
            <Select.Value placeholder="Select ID" />
            <Select.Icon>
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className={styles.selectContent} position="popper">
              <Select.Viewport>
                <Select.Item value="id_1" className={styles.selectItem}>
                  <Select.ItemText>ID 1</Select.ItemText>
                </Select.Item>
                <Select.Item value="id_2" className={styles.selectItem}>
                  <Select.ItemText>ID 2</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
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
            const isCompleted = index < currentStep || (completed && index <= currentStep);
            const isActive = index === currentStep && !completed;
            const isDisabled = index !== currentStep;

            const triggerClass = [styles.tabTrigger, isCompleted ? styles.completed : '', isActive ? styles.active : ''].join(' ');

            return (
              <div key={step.id} className={styles.tabItem}>
                <Tabs.Trigger value={step.id} onClick={() => handleTabClick(index)} disabled={isDisabled} className={triggerClass}>
                  {isActive ? (step.activeLabel ?? step.label) : step.label}
                </Tabs.Trigger>
                {index < steps.length - 1 && <div className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ''}`} />}
              </div>
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
  );
}
