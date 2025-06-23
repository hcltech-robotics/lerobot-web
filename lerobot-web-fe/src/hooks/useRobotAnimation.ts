import { useEffect } from 'react';
import * as THREE from 'three';
import { jointStateNameList, type JointState } from '../models/robot.model';

export function useRobotAnimation(jointState: JointState | null, robotRef: React.RefObject<THREE.Object3D>) {
  useEffect(() => {
    if (!robotRef.current || !jointState) return;

    const getJoint = (name: string) => {
      return robotRef.current.getObjectByName(name);
    };

    const joints = {
      rotation: getJoint(jointStateNameList.ROTATION),
      pitch: getJoint(jointStateNameList.PITCH),
      elbow: getJoint(jointStateNameList.ELBOW),
      wristPitch: getJoint(jointStateNameList.WRIST_PITCH),
      wristRoll: getJoint(jointStateNameList.WRIST_ROLL),
      jaw: getJoint(jointStateNameList.JAW),
    };

    if (Object.values(joints).some((joint) => !joint)) {
      console.warn('One or more joints not found');
      return;
    }

    joints.rotation!.rotation.y = jointState.rotation;
    joints.pitch!.rotation.x = jointState.pitch;
    joints.elbow!.rotation.x = jointState.elbow;
    joints.wristPitch!.rotation.x = jointState.wristPitch - 1.5;
    joints.wristRoll!.rotation.y = jointState.wristRoll - 3.2;
    joints.jaw!.rotation.z = jointState.jaw - 3.3;
  }, [jointState, robotRef]);
}
