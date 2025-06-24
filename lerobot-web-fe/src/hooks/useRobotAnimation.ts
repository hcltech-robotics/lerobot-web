import { useEffect } from 'react';
import * as THREE from 'three';
import { JOINT_STATES_OFFSETS, jointStateNameList, type JointState } from '../models/robot.model';

export function useRobotAnimation(jointState: JointState | null, robotRef: React.RefObject<THREE.Object3D | null>) {
  useEffect(() => {
    if (!robotRef.current || !jointState) {
      return;
    }

    const robot = robotRef.current;

    const getJoint = (name: string) => {
      return robot.getObjectByName(name);
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
    joints.wristPitch!.rotation.x = jointState.wristPitch + JOINT_STATES_OFFSETS.WRIST_PITCH;
    joints.wristRoll!.rotation.y = jointState.wristRoll + JOINT_STATES_OFFSETS.WRIST_ROLL;
    joints.jaw!.rotation.z = jointState.jaw + JOINT_STATES_OFFSETS.JAW;
  }, [jointState, robotRef]);
}
