import { useTexture } from '@react-three/drei';
import { RepeatWrapping } from 'three';

export function TableModel() {
  const [top, bottom, side] = useTexture(['/assets/wood.jpg', '/assets/wood.jpg', '/assets/danger-stripe.png'], (textures) => {
    const sideTex = textures[2];
    if (!sideTex) {
      return;
    }
    sideTex.wrapS = sideTex.wrapT = RepeatWrapping;
    sideTex.repeat.set(20, 1);
  });

  const tableTextures = [side, side, top, bottom, side, side];

  const legPositions: [number, number, number][] = [
    [-0.45, 0.2, -0.65],
    [0.45, 0.2, -0.65],
    [-0.45, 0.2, 0.65],
    [0.45, 0.2, 0.65],
  ];

  return (
    <>
      <group>
        <mesh position={[0, 0.4, 0]} receiveShadow>
          <boxGeometry args={[1, 0.04, 1.5]} />
          {tableTextures.map((map, i) => map && <meshStandardMaterial key={i} attach={`material-${i}`} map={map} />)}
        </mesh>

        {legPositions.map((position, i) => (
          <mesh key={i} position={position} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.4, 16]} />
            <meshStandardMaterial color="#0f5fdc" />
          </mesh>
        ))}
      </group>
    </>
  );
}
