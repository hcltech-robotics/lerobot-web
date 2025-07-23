import { useState } from 'react';
import { calibrationSteps } from '../constants/calibration';
import type { Step } from '../models/calibration.model';

export function useCalibration() {
  const [currentStep, setCurrentStep] = useState(0);
  const [tabValue, setTabValue] = useState((calibrationSteps[0] as Step).id);
  const [completed, setCompleted] = useState(false);

  const goToNextStep = () => {
    if (currentStep < calibrationSteps.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setTabValue((calibrationSteps[next] as Step).id);
    } else {
      setCompleted(true);
    }
  };

  const restartCalibration = () => {
    setCurrentStep(0);
    setTabValue((calibrationSteps[0] as Step).id);
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
