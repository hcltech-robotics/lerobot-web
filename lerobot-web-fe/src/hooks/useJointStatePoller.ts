import { useEffect } from 'react';
import { useJointPositions } from '../services/robot.service';
import type { JointState } from '../models/robot.model';

export function useJointStatePoller(id: number, setJointState: (state: JointState) => void) {
  useEffect(() => {
    const fetchJointStates = async () => {
      try {
        const { angles } = await useJointPositions(id);
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
    };

    const interval = setInterval(fetchJointStates, 100);
    return () => clearInterval(interval);
  }, [setJointState]);
}
