import { useTexture } from '@react-three/drei';
import { RepeatWrapping } from 'three';
import { tableLegPositions } from '../models/general.model';

export function TableModel() {
  const [top, bottom, side] = useTexture(['/assets/wood.jpg', '/assets/wood.jpg', '/assets/danger-stripe.png'], (textures) => {
    const sideTex = textures[2];
    if (!sideTex) {
      return;
    }
    sideTex.wrapS = sideTex.wrapT = RepeatWrapping;
    sideTex.repeat.set(20, 1);
    const topTex = textures[0];
    if (!topTex) {
      return;
    }
    topTex.wrapS = topTex.wrapT = RepeatWrapping;
    topTex.repeat.set(1, 4);
  });

  const tableTextures = [side, side, top, bottom, side, side];

  return (
    <>
      <group>
        <mesh position={[0, 0.4, 0.2]} receiveShadow>
          <boxGeometry args={[1.5, 0.04, 0.8]} />
          {tableTextures.map((map, i) => map && <meshStandardMaterial key={i} attach={`material-${i}`} map={map} />)}
        </mesh>

        {tableLegPositions.map((position, i) => (
          <mesh key={i} position={position} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.4, 16]} />
            <meshStandardMaterial color="#0f5fdc" />
          </mesh>
        ))}
      </group>
    </>
  );
}
