import React, { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import URDFLoader from 'urdf-loader';
import { STLLoader } from 'three/examples/jsm/Addons.js';
import type { JointState } from './Teleoperate';

export function Robot({ jointState, onRobotReady }: { jointState: JointState | null; onRobotReady?: (robot: THREE.Object3D) => void }) {
  const { scene } = useThree();
  const robotRef = useRef<THREE.Object3D | null>(null);

  React.useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);

    loader.loadMeshCb = (path, manager, done) => {
      const ext = path.split('.').pop()?.toLowerCase();
      if (ext === 'stl') {
        new STLLoader(manager).load(
          path,
          (geometry) => {
            const material = new THREE.MeshStandardMaterial({ color: 0x999999 });
            const mesh = new THREE.Mesh(geometry, material);
            done(mesh);
          },
          undefined,
          (err) => {
            console.error(`STL error: ${path}`, err);
            done(null as unknown as THREE.Object3D);
          },
        );
      }
    };

    loader.load('/assets/so-100/urdf/so-100.urdf', (robot) => {
      robot.rotation.x = -Math.PI / 2;
      scene.add(robot);
      robotRef.current = robot;
      if (onRobotReady) onRobotReady(robot);
    });
  }, [scene, onRobotReady]);

  useEffect(() => {
    if (!robotRef.current || !jointState) return;

    const rotationJoint = robotRef.current.getObjectByName('Rotation');
    const pitchJoint = robotRef.current.getObjectByName('Pitch');
    const elbowJoint = robotRef.current.getObjectByName('Elbow');
    const wristPitchJoint = robotRef.current.getObjectByName('Wrist_Pitch');
    const wristRollJoint = robotRef.current.getObjectByName('Wrist_Roll');
    const jawJoint = robotRef.current.getObjectByName('Jaw');

    if (rotationJoint && pitchJoint && elbowJoint && wristPitchJoint && wristRollJoint && jawJoint) {
      rotationJoint.rotation.y = jointState.rotation;
      pitchJoint.rotation.x = jointState.pitch;
      elbowJoint.rotation.x = jointState.elbow;
      wristPitchJoint.rotation.x = jointState.wristPitch;
      wristRollJoint.rotation.y = jointState.wristRoll;
      jawJoint.rotation.z = jointState.jaw;
    } else {
      console.warn('Joint state not found.');
    }
  }, [jointState]);

  return (
    <>
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}
