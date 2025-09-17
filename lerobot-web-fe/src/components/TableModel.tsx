import { useTexture } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { MeshStandardMaterial, RepeatWrapping } from 'three';

export function TableModel() {
  const [top, bottom, side] = useTexture(['/assets/wood.jpg', '/assets/wood.jpg', '/assets/danger-stripe.png']);

  useEffect(() => {
    if (side) {
      side.wrapS = RepeatWrapping;
      side.wrapT = RepeatWrapping;
      side.repeat.set(20, 1);
      side.needsUpdate = true;
    }
  }, [side]);

  const materials = useMemo(
    () => [
      new MeshStandardMaterial({ map: side }),
      new MeshStandardMaterial({ map: side }),
      new MeshStandardMaterial({ map: top }),
      new MeshStandardMaterial({ map: bottom }),
      new MeshStandardMaterial({ map: side }),
      new MeshStandardMaterial({ map: side }),
    ],
    [top, bottom, side],
  );
  return (
    <>
      <group>
        <mesh material={materials} position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[1, 0.04, 1.5]} />
        </mesh>

        <TableLegModel position={[-0.45, 0.2, -0.65]} />
        <TableLegModel position={[0.45, 0.2, -0.65]} />
        <TableLegModel position={[-0.45, 0.2, 0.65]} />
        <TableLegModel position={[0.45, 0.2, 0.65]} />
      </group>
    </>
  );
}

function TableLegModel({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <cylinderGeometry args={[0.035, 0.035, 0.4, 16]} />
      <meshStandardMaterial color="#0f5fdc" />
    </mesh>
  );
}
