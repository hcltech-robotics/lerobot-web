import { Suspense, type PropsWithChildren } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import { TableModel } from './TableModel';

type MainSceneProps = PropsWithChildren<{
  zoom?: number;
}>;

export function MainScene({ children, zoom = 10 }: MainSceneProps) {
  return (
    <>
      <Canvas shadows camera={{ position: [10, 5, 2], fov: zoom }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 8, 0]} intensity={1.5} castShadow />
          <Grid
            position={[0, 0, 0]}
            args={[10, 10]}
            cellSize={10.5}
            sectionSize={0.5}
            sectionColor="#5f1ebe"
            fadeDistance={30}
            fadeStrength={0.5}
            infiniteGrid
          />
          {children}
          <TableModel />
          <OrbitControls
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2}
            enablePan={true}
            enableZoom={true}
            target={[0, 0.45, 0]}
            autoRotate
            autoRotateSpeed={0.1}
          />
        </Suspense>
      </Canvas>
    </>
  );
}
