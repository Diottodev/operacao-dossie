export const TAU = Math.PI * 2;

export const DIFFICULTIES = {
  facil: { label: 'Fácil', lives: 5, time: 125, guardSpeed: 0.86, detection: 0.72, guards: 3, score: 0.8 },
  normal: { label: 'Normal', lives: 4, time: 105, guardSpeed: 1, detection: 1, guards: 4, score: 1 },
  dificil: { label: 'Difícil', lives: 3, time: 85, guardSpeed: 1.18, detection: 1.3, guards: 5, score: 1.35 },
};

export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
export const lerp = (from, to, amount) => from + (to - from) * amount;
export const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export const angleDifference = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function circleIntersectsRect(circle, rect) {
  const nearestX = clamp(circle.x, rect.x, rect.x + rect.w);
  const nearestY = clamp(circle.y, rect.y, rect.y + rect.h);
  const dx = circle.x - nearestX;
  const dy = circle.y - nearestY;
  return dx * dx + dy * dy < circle.r * circle.r;
}

export function moveWithCollisions(entity, dx, dy, obstacles, world) {
  const next = { ...entity };
  next.x = clamp(next.x + dx, next.r, world.w - next.r);
  if (obstacles.some((rect) => circleIntersectsRect(next, rect))) next.x = entity.x;
  next.y = clamp(next.y + dy, next.r, world.h - next.r);
  if (obstacles.some((rect) => circleIntersectsRect(next, rect))) next.y = entity.y;
  return next;
}

export function segmentIntersectsRect(a, b, rect) {
  if (a.x >= rect.x && a.x <= rect.x + rect.w && a.y >= rect.y && a.y <= rect.y + rect.h) return true;
  if (b.x >= rect.x && b.x <= rect.x + rect.w && b.y >= rect.y && b.y <= rect.y + rect.h) return true;

  const edges = [
    [{ x: rect.x, y: rect.y }, { x: rect.x + rect.w, y: rect.y }],
    [{ x: rect.x + rect.w, y: rect.y }, { x: rect.x + rect.w, y: rect.y + rect.h }],
    [{ x: rect.x + rect.w, y: rect.y + rect.h }, { x: rect.x, y: rect.y + rect.h }],
    [{ x: rect.x, y: rect.y + rect.h }, { x: rect.x, y: rect.y }],
  ];
  return edges.some(([c, d]) => segmentsIntersect(a, b, c, d));
}

export function segmentsIntersect(a, b, c, d) {
  const cross = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = cross(c, d, a);
  const d2 = cross(c, d, b);
  const d3 = cross(a, b, c);
  const d4 = cross(a, b, d);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

export function hasLineOfSight(a, b, obstacles) {
  return !obstacles.some((rect) => segmentIntersectsRect(a, b, rect));
}

export function canSee(observer, target, obstacles) {
  const range = observer.vision ?? 280;
  const fov = observer.fov ?? Math.PI / 3;
  const dist = distance(observer, target);
  if (dist > range || dist < 1) return false;
  const targetAngle = Math.atan2(target.y - observer.y, target.x - observer.x);
  return Math.abs(angleDifference(targetAngle, observer.angle)) <= fov / 2 && hasLineOfSight(observer, target, obstacles);
}

export function updateAlert(alert, seen, dt, detection = 1) {
  return clamp(alert + (seen ? 48 * detection : -17) * dt, 0, 100);
}

export function createRng(seed = 123456789) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
