import { useState } from 'react';
import { calibrationSteps } from '../models/calibration.model';
import type { CalibrationStep } from '../models/calibration.model';

export function useCalibration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [tabValue, setTabValue] = useState((calibrationSteps[0] as CalibrationStep).id);
  const [completed, setCompleted] = useState(false);

  const goToNextStep = () => {
    if (currentStep < calibrationSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setTabValue((calibrationSteps[next] as CalibrationStep).id);
    } else {
      setCompleted(true);
    }
  };

  const restartCalibration = () => {
    setCurrentStep(0);
    setTabValue((calibrationSteps[0] as CalibrationStep).id);
    setCompleted(false);
  };

  return {
    currentStep,
    setCurrentStep,
    tabValue,
    setTabValue,
    completed,
    setCompleted,
    goToNextStep,
    restartCalibration,
  };
}
