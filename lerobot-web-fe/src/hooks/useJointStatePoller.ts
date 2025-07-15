import { useEffect, useRef } from 'react';
import { getJointPositions } from '../services/robot.service';
import type { JointState } from '../models/robot.model';

export function useJointStatePoller(id: number, isLive: boolean, setJointState: (state: JointState) => void) {
  const isCancelled = useRef(false);

  useEffect(() => {
    if (!isLive) {
      return;
    }

    isCancelled.current = false;

    const getJointStateAPICalls = async () => {
      while (!isCancelled.current) {
        try {
          const { angles } = await getJointPositions(id);

          if (angles && angles.length === 6) {
            setJointState({
              rotation: angles[0] ?? 0,
              pitch: angles[1] ?? 0,
              elbow: angles[2] ?? 0,
              wristPitch: angles[3] ?? 0,
              wristRoll: angles[4] ?? 0,
              jaw: angles[5] ?? 0,
            });
          }
        } catch (error) {
          console.error('Failed to fetch joint states:', error);
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
        if (isCancelled.current) break;
      }
    };

    getJointStateAPICalls();

    return () => {
      isCancelled.current = true;
    };
  }, [id, isLive]);
}
