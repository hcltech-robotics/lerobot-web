import { useEffect, useRef, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import URDFLoader from 'urdf-loader';
import { STLLoader } from 'three/examples/jsm/Addons.js';
import { useRobotAnimation } from '../hooks/useRobotAnimation';
import { useJointStatePoller } from '../hooks/useJointStatePoller';
import type { JointState, RobotProps } from '../models/robot.model';

export function Robot({ isLive }: RobotProps) {
  const { scene } = useThree();
  const robotRef = useRef<THREE.Object3D | null>(null);
  const [jointState, setJointState] = useState<JointState | null>(null);

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
    });
  }, [scene]);

  useJointStatePoller(0, isLive, setJointState);
  useRobotAnimation(jointState, robotRef);

  return (
    <>
      <mesh position={[0, 0, 0]} visible={false}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}
