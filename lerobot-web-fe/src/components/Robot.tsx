import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import URDFLoader from 'urdf-loader';
import { Html } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/Addons.js';
import { useRobotAnimation } from '../hooks/useRobotAnimation';
import { useJointStatePollerWebSocket } from '../hooks/useJointStatePoller';
import { type JointState, type RobotProps } from '../models/robot.model';
import { robotLayout } from '../models/robot.model';

import styles from './Robot.module.css';

export function Robot({
  isLive,
  calibrationJointState = null,
  position = robotLayout.single.position,
  rotation = robotLayout.single.rotation,
  robotLabel,
}: RobotProps) {
  const robotRef = useRef<THREE.Object3D | null>(null);
  const [robotModel, setRobotModel] = useState<THREE.Object3D | null>(null);
  const [robotModelLoaded, setRobotModelLoaded] = useState(false);
  const [liveJointState, setLiveJointState] = useState<JointState | null>(null);

  const activeJointState = isLive ? liveJointState : calibrationJointState;

  useEffect(() => {
    const manager = new THREE.LoadingManager();
    const loader = new URDFLoader(manager);

    loader.loadMeshCb = (path, manager, done) => {
      const ext = path.split('.').pop()?.toLowerCase();
      if (ext === 'stl') {
        new STLLoader(manager).load(
          path,
          (geometry) => {
            const mesh = new THREE.Mesh(geometry);
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
      robotRef.current = robot;
      setRobotModel(robot);
      setRobotModelLoaded(true);
    });
  }, []);

  useJointStatePollerWebSocket(robotLabel, isLive, setLiveJointState);
  useRobotAnimation(activeJointState, robotRef, !isLive, robotModelLoaded);

  return (
    <>
      {robotModel && (
        <>
          <primitive object={robotModel} ref={robotRef} position={position} rotation={rotation} />
          {robotLabel && (
            <Html position={[position[0], position[1] - 0.05, position[2]]} center zIndexRange={[1]}>
              <div className={styles.robotLabel}>{robotLabel}</div>
            </Html>
          )}
        </>
      )}
    </>
  );
}
