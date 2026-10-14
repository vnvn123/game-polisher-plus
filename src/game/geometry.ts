/** Closest point on a projectile's travelled segment, not its final position. */
export function segmentHit(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  x: number,
  y: number,
  radius: number,
): boolean {
  const dx = bx - ax,
    dy = by - ay;
  const length = dx * dx + dy * dy;
  const t = length ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / length)) : 0;
  return (x - ax - t * dx) ** 2 + (y - ay - t * dy) ** 2 <= radius ** 2;
}

export function attractionStep(distance: number, speed: number, dt: number): number {
  return distance > 0 ? Math.min(distance, speed * dt) / distance : 0;
}

export function overlapsArc(
  px: number,
  py: number,
  x: number,
  y: number,
  facing: number,
  range: number,
  halfAngle: number,
): boolean {
  const dx = x - px,
    dy = y - py;
  if (Math.hypot(dx, dy) > range) return false;
  const difference = Math.atan2(
    Math.sin(Math.atan2(dy, dx) - facing),
    Math.cos(Math.atan2(dy, dx) - facing),
  );
  return Math.abs(difference) <= halfAngle;
}
