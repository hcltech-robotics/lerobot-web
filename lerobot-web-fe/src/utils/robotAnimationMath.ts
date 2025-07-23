export const isNearlyEqualState = (a: number, b: number, threshold = 0.001) => Math.abs(a - b) < threshold;

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpAngle(a: number, b: number, t: number) {
  let delta = b - a;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;
  return a + delta * t;
}

export const safeCancelAnimationFrame = (frame: number | null | undefined) => {
  if (frame != null) {
    cancelAnimationFrame(frame);
  }
};
