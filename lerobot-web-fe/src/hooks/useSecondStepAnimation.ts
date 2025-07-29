import { useEffect, useState } from 'react';
import type { JointState } from '../models/robot.model';
import { ANIMATION_MOVEMENT_SPEED, ANIMATION_SEQUENCES } from '../models/calibration.model';

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export function useSecondStepAnimation(active: boolean) {
  const [animatedState, setAnimatedState] = useState<JointState>({
    rotation: 0,
    pitch: 0,
    elbow: 0,
    wristPitch: 0,
    wristRoll: -1.5,
    jaw: 0,
  });

  useEffect(() => {
    if (!active) return;
    const animateStep = async (values: Partial<JointState>[] | Partial<JointState>, speed: number) => {
      const sequence = Array.isArray(values) ? values : [values];
      for (const step of sequence) {
        setAnimatedState((prev) => ({ ...prev, ...step }));
        await delay(speed);
      }
    };

    const runAnimation = async () => {
      await delay(2000);

      // 1. Jaw
      await animateStep(
        ANIMATION_SEQUENCES.JAW.map((jaw) => ({ jaw })),
        ANIMATION_MOVEMENT_SPEED.NORMAL,
      );

      // 2. WristRoll
      await animateStep(
        ANIMATION_SEQUENCES.WRIST_ROLL.map((wristRoll) => ({ wristRoll })),
        ANIMATION_MOVEMENT_SPEED.FAST,
      );

      // 3. WristPitch
      await animateStep(
        ANIMATION_SEQUENCES.WRIST_PITCH.map((wristPitch) => ({ wristPitch })),
        ANIMATION_MOVEMENT_SPEED.NORMAL,
      );

      // 4. Pitch and Elbow
      await animateStep({ pitch: -1.5 }, ANIMATION_MOVEMENT_SPEED.SLOW);
      await animateStep({ elbow: 1.5 }, ANIMATION_MOVEMENT_SPEED.SLOW);
      await animateStep({ elbow: -1.6 }, ANIMATION_MOVEMENT_SPEED.SLOW);

      // 5. Pitch to 1.7, then both to 0
      await animateStep({ pitch: 1.7 }, ANIMATION_MOVEMENT_SPEED.SLOW);
      await animateStep({ pitch: 0, elbow: 0 }, ANIMATION_MOVEMENT_SPEED.SLOW);

      // 6. Rotation
      await animateStep(
        ANIMATION_SEQUENCES.ROTATION.map((rotation) => ({ rotation })),
        ANIMATION_MOVEMENT_SPEED.SLOW,
      );
    };
    runAnimation();
  }, [active]);

  return animatedState;
}
