import { useEffect, useRef } from 'react';
import { getJointPositions } from '../services/robot.service';
import type { JointState } from '../models/robot.model';

export function useJointStatePoller(id: number, isLive: boolean, setJointState: (state: JointState) => void) {
  const isCancelled = useRef(false);
  const follower = '58FA1019351'; // temporary const

  useEffect(() => {
    if (!isLive) {
      return;
    }

    isCancelled.current = false;

    const getJointStateAPICalls = async () => {
      while (!isCancelled.current) {
        try {
          const { jointState } = await getJointPositions(follower);

          if (jointState && Object.keys(jointState).length === 6) {
            setJointState(jointState);
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
  }, [id, isLive, setJointState]);
}
