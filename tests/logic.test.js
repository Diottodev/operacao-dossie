import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canSee,
  circleIntersectsRect,
  createRng,
  formatTime,
  hasLineOfSight,
  moveWithCollisions,
  updateAlert,
} from '../src/logic.js';

const world = { w: 500, h: 400 };
const wall = { x: 200, y: 100, w: 40, h: 160 };

test('formatTime arredonda para cima e nunca fica negativo', () => {
  assert.equal(formatTime(65.1), '01:06');
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(-3), '00:00');
});

test('colisão círculo-retângulo considera as bordas', () => {
  assert.equal(circleIntersectsRect({ x: 190, y: 150, r: 12 }, wall), true);
  assert.equal(circleIntersectsRect({ x: 180, y: 150, r: 12 }, wall), false);
});

test('movimento desliza pela parede e respeita os limites do mapa', () => {
  const player = { x: 180, y: 150, r: 12 };
  const moved = moveWithCollisions(player, 30, 20, [wall], world);
  assert.equal(moved.x, 180);
  assert.equal(moved.y, 170);
  const bounded = moveWithCollisions({ x: 10, y: 10, r: 12 }, -50, -50, [], world);
  assert.equal(bounded.x, 12);
  assert.equal(bounded.y, 12);
});

test('paredes bloqueiam visão', () => {
  const a = { x: 100, y: 150 };
  const b = { x: 350, y: 150 };
  assert.equal(hasLineOfSight(a, b, []), true);
  assert.equal(hasLineOfSight(a, b, [wall]), false);
});

test('campo de visão exige distância, ângulo e linha livre', () => {
  const guard = { x: 100, y: 150, angle: 0, vision: 300, fov: Math.PI / 2 };
  assert.equal(canSee(guard, { x: 250, y: 150 }, []), true);
  assert.equal(canSee(guard, { x: 80, y: 150 }, []), false);
  assert.equal(canSee(guard, { x: 250, y: 150 }, [wall]), false);
  assert.equal(canSee(guard, { x: 450, y: 150 }, []), false);
});

test('alerta sobe quando visto, cai oculto e permanece entre 0 e 100', () => {
  assert.equal(updateAlert(0, true, 1, 1), 48);
  assert.equal(updateAlert(50, false, 1, 1), 33);
  assert.equal(updateAlert(90, true, 1, 1), 100);
  assert.equal(updateAlert(2, false, 1, 1), 0);
});

test('gerador aleatório é determinístico', () => {
  const a = createRng(42);
  const b = createRng(42);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
});
