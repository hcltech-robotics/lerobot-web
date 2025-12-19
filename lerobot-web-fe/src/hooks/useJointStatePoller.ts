import { useEffect, useRef } from 'react';
import { createJointPositionsWebSocket } from '../services/robot.service';
import type { JointState, JointStatesWSResponse } from '../models/robot.model';

export function useJointStatePollerWebSocket(follower: string, isLive: boolean, setJointState: (state: JointState) => void) {
  const websocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!isLive) {
      return;
    }

    websocket.current = createJointPositionsWebSocket(follower, (jointState: string) => {
      const response: JointStatesWSResponse = JSON.parse(jointState);
      setJointState(response.jointState);
    });

    return () => {
      websocket.current?.close();
    };
  }, [follower, isLive, setJointState]);
}
