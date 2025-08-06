import { useEffect, useRef } from 'react';
import { getJointPositions, createJointPositionsWebSocket } from '../services/robot.service';
import type { JointState } from '../models/robot.model';

export function useJointStatePoller(followerId: string, isLive: boolean, setJointState: (state: JointState) => void) {
  const isCancelled = useRef(false);

  useEffect(() => {
    if (!isLive) {
      return;
    }

    isCancelled.current = false;

    const getJointStateAPICalls = async () => {
      while (!isCancelled.current) {
        try {
          const { jointState } = await getJointPositions(followerId);

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
  }, [followerId, isLive, setJointState]);
}

export function useJointStatePollerWebSocket(followerId: string, isLive: boolean, setJointState: (state: JointState) => void) {
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isLive) {
      return;
    }

    websocket.current = createJointPositionsWebSocket(followerId, (jointState) => {
      setJointState(jointState);
    });

    return () => {
      websocket.current?.close();
    };
  }, [followerId, isLive, setJointState]);
}
