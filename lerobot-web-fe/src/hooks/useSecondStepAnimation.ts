import { useEffect, useState } from 'react';
import type { JointState } from '../models/robot.model';

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

    const runAnimation = async () => {
      const update = (partial: Partial<JointState>) => {
        setAnimatedState((prev) => ({ ...prev, ...partial }));
      };

      await delay(1000);

      // 1. Jaw 1.7 → 0
      update({ jaw: 1.7 });
      await delay(2000);
      update({ jaw: 0 });
      await delay(2000);

      // 2. WristRoll sequence
      for (const val of [0, 1.5, 0, -1.5, -3.2, 0]) {
        update({ wristRoll: val });
        await delay(1500);
      }

      // 3. WristPitch sequence
      for (const val of [1.8, -1.8, 0]) {
        update({ wristPitch: val });
        await delay(2000);
      }

      // 4. Pitch to -1.5, then elbow 1.5 → -1.6
      update({ pitch: -1.5 });
      await delay(3000);
      update({ elbow: 1.5 });
      await delay(3000);
      update({ elbow: -1.6 });
      await delay(3500);

      // 5. Pitch to 1.7 → both to 0
      update({ pitch: 1.7 });
      await delay(3500);
      update({ pitch: 0, elbow: 0 });
      await delay(3500);

      // 6. Rotation: 1.5 → -1.5 → 0
      for (const val of [1.5, -1.5, 0]) {
        update({ rotation: val });
        await delay(3500);
      }
    };

    runAnimation();
  }, [active]);

  return animatedState;
}
