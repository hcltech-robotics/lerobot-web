import type { PropsWithChildren } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';

export function MainScene(props: PropsWithChildren) {
  return (
    <>
      <Canvas camera={{ position: [10, 5, 0], fov: 5 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <Grid
          position={[0, 0, 0]}
          args={[10, 10]}
          cellSize={10.5}
          cellColor="#555"
          sectionSize={0.5}
          sectionColor="#999"
          fadeDistance={15}
          fadeStrength={0.5}
          infiniteGrid
        />
        {props.children}
        <OrbitControls />
      </Canvas>
    </>
  );
}
