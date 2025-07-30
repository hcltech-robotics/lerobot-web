import * as Tabs from '@radix-ui/react-tabs';
import styles from './CalibrationTabItem.module.css';

interface CalibrationTabItemProps {
  id: string;
  label: string;
  activeLabel?: string;
  index: number;
  currentStep: number;
  completed: boolean;
  totalSteps: number;
  onClick: () => void;
  disabled: boolean;
}

export default function CalibrationTabItem({
  id,
  label,
  activeLabel,
  index,
  currentStep,
  completed,
  totalSteps,
  onClick,
  disabled,
}: CalibrationTabItemProps) {
  const isCompleted = index < currentStep || (completed && index <= currentStep);
  const isActive = index === currentStep && !completed;
  const isDisabled = disabled || index !== currentStep;

  const triggerClass = [styles.tabTrigger, isCompleted && styles.completed, isActive && styles.active].filter(Boolean).join(' ');

  return (
    <div className={styles.tabItem}>
      <Tabs.Trigger value={id} onClick={onClick} disabled={isDisabled} className={triggerClass}>
        {isActive ? (activeLabel ?? label) : label}
      </Tabs.Trigger>
      {index < totalSteps - 1 && <div className={`${styles.connector} ${isCompleted ? styles.connectorCompleted : ''}`} />}
    </div>
  );
}
