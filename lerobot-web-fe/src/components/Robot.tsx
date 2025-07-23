import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import URDFLoader from 'urdf-loader';
import { STLLoader } from 'three/examples/jsm/Addons.js';
import { useRobotAnimation } from '../hooks/useRobotAnimation';
import { useJointStatePoller } from '../hooks/useJointStatePoller';
import type { JointState, RobotProps } from '../models/robot.model';

export function Robot({ isLive, calibrationJointState }: RobotProps) {
  const { scene } = useThree();
  const robotRef = useRef<THREE.Object3D | null>(null);
  const [robotModelLoaded, setRobotModelLoaded] = useState(false); // ← NEW
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
      setRobotModelLoaded(true);
    });
  }, [scene]);

  useJointStatePoller(0, isLive, setLiveJointState);
  useRobotAnimation(activeJointState, robotRef, !isLive, robotModelLoaded);

  return (
    <>
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}
