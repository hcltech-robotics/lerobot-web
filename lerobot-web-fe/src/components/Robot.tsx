import React, { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import URDFLoader from 'urdf-loader';
import { STLLoader } from 'three/examples/jsm/Addons.js';

export interface JointState {
  rotation: number;
  pitch: number;
  elbow: number;
  wristPitch: number;
  wristRoll: number;
  jaw: number;
}

export default function Robot() {
  const { scene } = useThree();
  const robotRef = useRef<THREE.Object3D | null>(null);
  const [jointState, setJointState] = useState<JointState | null>(null);

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
    });
  }, [scene]);

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:8000/ws/joint_state');

    socket.onmessage = (event) => {
      const data: JointState = JSON.parse(event.data);
      setJointState(data);
    };

    socket.onclose = () => {
      console.log('WebSocket closed for joint state');
    };

    return () => {
      socket.close();
    };
  }, []);

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
