import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { JOINT_STATES_OFFSETS, jointStateNameList, type JointState } from '../models/robot.model';
import { lerp, lerpAngle, isNearlyEqualState } from '../utils/robotAnimationMath';

export function useRobotAnimation(
  jointState: JointState | null | undefined,
  robotRef: React.RefObject<THREE.Object3D | null>,
  smooth: boolean = false,
  robotModelLoaded: boolean = false,
) {
  const currentState = useRef<JointState | null>(null);
  const animationFrame = useRef<number>(null);

  useEffect(() => {
    if (!robotRef.current || !jointState || !robotModelLoaded) {
      return;
    }

    if (!currentState.current) {
      currentState.current = {
        ...jointState,
      };
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

    const animate = () => {
      if (!jointState) return;

      const lerpSpeed = 0.02;

      const prev = currentState.current || jointState;

      const nextState: JointState = {
        rotation: smooth ? lerpAngle(prev.rotation, jointState.rotation, lerpSpeed) : jointState.rotation,
        pitch: smooth ? lerp(prev.pitch, jointState.pitch, lerpSpeed) : jointState.pitch,
        elbow: smooth ? lerp(prev.elbow, jointState.elbow, lerpSpeed) : jointState.elbow,
        wristPitch: smooth ? lerp(prev.wristPitch, jointState.wristPitch, lerpSpeed) : jointState.wristPitch,
        wristRoll: smooth ? lerpAngle(prev.wristRoll, jointState.wristRoll, lerpSpeed) : jointState.wristRoll,
        jaw: smooth ? lerp(prev.jaw, jointState.jaw, lerpSpeed) : jointState.jaw,
      };

      joints.rotation!.rotation.y = nextState.rotation;
      joints.pitch!.rotation.x = nextState.pitch;
      joints.elbow!.rotation.x = nextState.elbow;
      joints.wristPitch!.rotation.x = nextState.wristPitch + JOINT_STATES_OFFSETS.WRIST_PITCH;
      joints.wristRoll!.rotation.y = nextState.wristRoll + JOINT_STATES_OFFSETS.WRIST_ROLL;
      joints.jaw!.rotation.z = nextState.jaw + JOINT_STATES_OFFSETS.JAW;

      currentState.current = nextState;
      const done =
        isNearlyEqualState(nextState.rotation, jointState.rotation) &&
        isNearlyEqualState(nextState.pitch, jointState.pitch) &&
        isNearlyEqualState(nextState.elbow, jointState.elbow) &&
        isNearlyEqualState(nextState.wristPitch, jointState.wristPitch) &&
        isNearlyEqualState(nextState.wristRoll, jointState.wristRoll) &&
        isNearlyEqualState(nextState.jaw, jointState.jaw);
      if (!done && smooth) {
        cancelAnimationFrame(animationFrame.current!);
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        currentState.current = jointState;
      }
    };

    cancelAnimationFrame(animationFrame.current!);
    if (smooth) {
      animationFrame.current = requestAnimationFrame(animate);
    } else {
      animate();
    }
    return () => cancelAnimationFrame(animationFrame.current!);
  }, [jointState, robotRef, smooth, robotModelLoaded]);
}
