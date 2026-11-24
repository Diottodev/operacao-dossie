import {
  angleDifference,
  canSee,
  clamp,
  createRng,
  DIFFICULTIES,
  distance,
  lerp,
  moveWithCollisions,
  TAU,
  updateAlert,
} from './logic.js';
import {
  createBackground,
  drawCamera,
  drawCoffee,
  drawDecoy,
  drawDocument,
  drawDrone,
  drawExit,
  drawGuard,
  drawMinimap,
  drawObjectiveArrow,
  drawPlayer,
  drawVisionCone,
} from './art.js';
import { DEFAULT_CHARACTER } from './characters.js';

const WIDTH = 1280;
const HEIGHT = 720;
const TOTAL_DOCUMENTS = 6;

export class Game {
  constructor(canvas, sound, hooks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sound = sound;
    this.hooks = hooks;
    this.world = { w: 1800, h: 1080 };
    this.obstacles = [
      { x: 0, y: 0, w: 1800, h: 92, type: 'invisible' },
      { x: 0, y: 1012, w: 1800, h: 68, type: 'invisible' },
      { x: 300, y: 150, w: 160, h: 85, type: 'kiosk' },
      { x: 640, y: 170, w: 210, h: 48, type: 'bench' },
      { x: 1050, y: 145, w: 190, h: 52, type: 'planter' },
      { x: 280, y: 390, w: 180, h: 50, type: 'bench' },
      { x: 540, y: 340, w: 150, h: 62, type: 'luggage' },
      { x: 820, y: 360, w: 220, h: 55, type: 'planter' },
      { x: 1260, y: 400, w: 160, h: 85, type: 'kiosk' },
      { x: 150, y: 690, w: 150, h: 62, type: 'luggage' },
      { x: 450, y: 700, w: 230, h: 55, type: 'planter' },
      { x: 800, y: 760, w: 190, h: 48, type: 'bench' },
      { x: 1160, y: 680, w: 160, h: 62, type: 'luggage' },
      { x: 1460, y: 790, w: 190, h: 55, type: 'planter' },
      { x: 1250, y: 900, w: 180, h: 44, type: 'bench' },
      { x: 550, y: 900, w: 150, h: 75, type: 'kiosk' },
    ];
    this.documentPositions = [
      { x: 350, y: 300 },
      { x: 760, y: 650 },
      { x: 1390, y: 650 },
      { x: 1600, y: 330 },
      { x: 1020, y: 260 },
      { x: 520, y: 540 },
      { x: 1050, y: 900 },
      { x: 250, y: 880 },
    ];
    this.guardSpawns = [
      { x: 650, y: 560, patrol: [[650, 560], [1050, 560]] },
      { x: 1200, y: 300, patrol: [[1200, 300], [1450, 300], [1450, 610], [1200, 600]] },
      { x: 350, y: 850, patrol: [[350, 850], [740, 850], [740, 650]] },
      { x: 950, y: 950, patrol: [[750, 850], [1100, 850], [1100, 970], [750, 970]] },
      { x: 1550, y: 500, patrol: [[1550, 500], [1480, 520], [1480, 300], [1200, 300], [1200, 600], [1450, 610]] },
      { x: 750, y: 250, patrol: [[750, 250], [1100, 280], [1100, 560], [760, 560]] },
      { x: 1050, y: 650, patrol: [[1050, 650], [1100, 850], [1400, 870], [1400, 620]] },
    ];
    this.background = createBackground(this.world, this.obstacles);
    this.input = { x: 0, y: 0 };
    this.rain = Array.from({ length: 70 }, (_, index) => ({
      x: (index * 197) % WIDTH,
      y: (index * 83) % HEIGHT,
      speed: 240 + (index % 7) * 35,
      length: 6 + (index % 5) * 2,
    }));
    this.state = 'menu';
    this.time = 0;
    this.camera = { x: 220, y: 260 };
    this.reset('normal');
    this.state = 'menu';
  }

  reset(difficulty = 'normal', character = this.character || DEFAULT_CHARACTER) {
    this.difficulty = DIFFICULTIES[difficulty] ? difficulty : 'normal';
    this.config = DIFFICULTIES[this.difficulty];
    this.character = character;
    this.maxLives = this.config.lives + character.livesBonus;
    this.rng = createRng(13013);
    this.player = {
      x: 140, y: 850, r: 15, angle: 0,
      vx: 0, vy: 0, invulnerable: 0, dashing: 0,
      character,
    };
    this.lives = this.maxLives;
    this.timeLeft = this.config.time;
    this.score = 0;
    this.combo = 1;
    this.documents = 0;
    this.document = { ...this.documentPositions[0] };
    this.exit = { x: 1590, y: 235 };
    this.exitOpen = false;
    this.coffee = null;
    this.decoy = null;
    this.dashCooldown = 0;
    this.decoyCooldown = 0;
    this.alert = 0;
    this.lockdownCooldown = 0;
    this.seen = false;
    this.particles = [];
    this.shake = 0;
    this.guards = this.guardSpawns.slice(0, this.config.guards).map((spawn, index) => this.makeGuard(spawn, index));
    this.cameras = [
      { x: 510, y: 112, baseAngle: Math.PI / 2, angle: Math.PI / 2, phase: 0, vision: 285, fov: .72, speed: .72, arc: .85 },
      { x: 1150, y: 112, baseAngle: Math.PI / 2, angle: Math.PI / 2, phase: 2.1, vision: 300, fov: .72, speed: .6, arc: .9 },
      { x: 1740, y: 570, baseAngle: Math.PI, angle: Math.PI, phase: 4, vision: 270, fov: .8, speed: .8, arc: .7 },
    ];
    this.drones = [];
    this.camera = {
      x: clamp(this.player.x - WIDTH / 2, 0, this.world.w - WIDTH),
      y: clamp(this.player.y - HEIGHT / 2, 0, this.world.h - HEIGHT),
    };
    this.updateHud();
  }

  makeGuard(spawn, index = 0) {
    return {
      x: spawn.x, y: spawn.y, r: 16,
      patrol: spawn.patrol.map(([x, y]) => ({ x, y })),
      patrolIndex: index % spawn.patrol.length,
      angle: 0, vision: 275, fov: 1.12,
      state: 'patrol', sees: false, lost: 0,
      target: null, variant: index % 4,
    };
  }

  start(difficulty = this.difficulty, character = this.character) {
    this.reset(difficulty, character);
    this.state = 'playing';
    this.sound.startMusic();
    this.hooks.onStart?.();
    this.toast(`${this.character.shortName} EM CAMPO · RECUPERE O PRIMEIRO NÚCLEO`);
  }

  setInput(x, y) {
    const magnitude = Math.hypot(x, y);
    this.input.x = magnitude > 1 ? x / magnitude : x;
    this.input.y = magnitude > 1 ? y / magnitude : y;
  }

  triggerDash() {
    if (this.state !== 'playing' || this.dashCooldown > 0) return;
    if (Math.hypot(this.input.x, this.input.y) > .1) this.player.angle = Math.atan2(this.input.y, this.input.x);
    this.player.dashing = this.character.dashDuration;
    this.dashCooldown = 2.8 * this.character.dashCooldown;
    this.sound.sfx('dash');
    this.burst(this.player.x, this.player.y, '#f5bf45', 9, 100);
  }

  triggerDecoy() {
    if (this.state !== 'playing' || this.decoyCooldown > 0) return;
    this.decoy = {
      x: clamp(this.player.x + Math.cos(this.player.angle) * 85, 30, this.world.w - 30),
      y: clamp(this.player.y + Math.sin(this.player.angle) * 85, 110, this.world.h - 90),
      life: 4.5,
    };
    this.decoyCooldown = 9 * this.character.decoyCooldown;
    this.sound.sfx('decoy');
    this.toast('JORNAL LANÇADO · FAÇA SUA SAÍDA');
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.sound.stopMusic();
      this.hooks.onPause?.(true);
    } else if (this.state === 'paused') {
      this.state = 'playing';
      this.sound.startMusic();
      this.hooks.onPause?.(false);
    }
  }

  update(dt) {
    this.time += dt;
    if (this.state === 'menu') {
      this.camera.x = 230 + Math.sin(this.time * .11) * 160;
      this.camera.y = 170 + Math.cos(this.time * .09) * 80;
      return;
    }
    if (this.state !== 'playing') return;

    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.finish(false, 'time');
      return;
    }

    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.decoyCooldown = Math.max(0, this.decoyCooldown - dt);
    this.lockdownCooldown = Math.max(0, this.lockdownCooldown - dt);
    this.player.invulnerable = Math.max(0, this.player.invulnerable - dt);
    this.player.dashing = Math.max(0, this.player.dashing - dt);
    this.shake = Math.max(0, this.shake - dt * 34);

    const moving = Math.hypot(this.input.x, this.input.y) > .08;
    if (moving) this.player.angle = Math.atan2(this.input.y, this.input.x);
    const speed = (this.player.dashing > 0 ? 690 : 245) * this.character.speed;
    const targetVX = moving || this.player.dashing > 0 ? Math.cos(this.player.angle) * speed : 0;
    const targetVY = moving || this.player.dashing > 0 ? Math.sin(this.player.angle) * speed : 0;
    const response = this.player.dashing > 0 ? 28 : 15;
    this.player.vx = lerp(this.player.vx, targetVX, Math.min(1, dt * response));
    this.player.vy = lerp(this.player.vy, targetVY, Math.min(1, dt * response));
    const moved = moveWithCollisions(this.player, this.player.vx * dt, this.player.vy * dt, this.obstacles, this.world);
    this.player.x = moved.x;
    this.player.y = moved.y;

    if (this.player.dashing > 0 && this.rng() > .45) {
      this.particles.push({ x: this.player.x, y: this.player.y, vx: 0, vy: 0, life: .25, maxLife: .25, color: '#f5bf45', size: 7 });
    }

    if (this.decoy) {
      this.decoy.life -= dt;
      if (this.decoy.life <= 0) this.decoy = null;
    }

    this.updateGuards(dt);
    this.updateSecurity(dt);
    this.updatePickups();
    this.updateParticles(dt);

    const targetCameraX = clamp(this.player.x - WIDTH / 2, 0, this.world.w - WIDTH);
    const targetCameraY = clamp(this.player.y - HEIGHT / 2, 0, this.world.h - HEIGHT);
    this.camera.x = lerp(this.camera.x, targetCameraX, Math.min(1, dt * 5));
    this.camera.y = lerp(this.camera.y, targetCameraY, Math.min(1, dt * 5));
    this.sound.intensity = this.alert / 100;
    this.updateHud();
  }

  updateGuards(dt) {
    for (const guard of this.guards) {
      guard.sees = canSee(guard, this.player, this.obstacles);
      if (guard.sees) {
        guard.state = 'chase';
        guard.lost = 0;
      } else if (guard.state === 'chase') {
        guard.lost += dt;
        if (guard.lost > 2.1) guard.state = 'patrol';
      }

      if (this.decoy && guard.state !== 'chase' && distance(guard, this.decoy) < 490) {
        guard.state = 'investigate';
        guard.target = this.decoy;
      }

      let target;
      let speed = 78 * this.config.guardSpeed;
      if (guard.state === 'chase') {
        target = this.player;
        speed = (158 + this.documents * 7) * this.config.guardSpeed;
      } else if (guard.state === 'investigate' && guard.target) {
        target = guard.target;
        speed = 112 * this.config.guardSpeed;
        if (!this.decoy || distance(guard, target) < 26) {
          guard.state = 'patrol';
          guard.target = null;
        }
      } else {
        target = guard.patrol[guard.patrolIndex];
        if (distance(guard, target) < 24) {
          guard.patrolIndex = (guard.patrolIndex + 1) % guard.patrol.length;
          target = guard.patrol[guard.patrolIndex];
        }
      }

      if (target) {
        const desired = Math.atan2(target.y - guard.y, target.x - guard.x);
        guard.angle += angleDifference(desired, guard.angle) * Math.min(1, dt * 7);
        const moved = moveWithCollisions(guard, Math.cos(guard.angle) * speed * dt, Math.sin(guard.angle) * speed * dt, this.obstacles, this.world);
        guard.x = moved.x;
        guard.y = moved.y;
      }

      if (distance(guard, this.player) < 32 && this.player.invulnerable <= 0 && this.player.dashing <= 0) {
        this.hit(guard);
        if (this.state !== 'playing') return;
      }
    }
  }

  updateSecurity(dt) {
    let spotted = this.guards.some((guard) => guard.sees);
    for (const camera of this.cameras) {
      camera.angle = camera.baseAngle + Math.sin(this.time * camera.speed + camera.phase) * camera.arc;
      camera.sees = canSee(camera, this.player, this.obstacles);
      spotted ||= camera.sees;
    }

    for (const drone of this.drones) {
      drone.x = drone.centerX + Math.cos(this.time * drone.orbitSpeed + drone.phase) * drone.radiusX;
      drone.y = drone.centerY + Math.sin(this.time * drone.orbitSpeed + drone.phase) * drone.radiusY;
      drone.angle += dt * 1.1;
      drone.sees = canSee(drone, this.player, this.obstacles);
      spotted ||= drone.sees;
      if (distance(drone, this.player) < 29 && this.player.invulnerable <= 0 && this.player.dashing <= 0) this.hit(drone);
    }

    this.seen = spotted;
    const previousAlert = this.alert;
    this.alert = updateAlert(this.alert, spotted, dt, this.config.detection * this.character.stealth);
    if (previousAlert < 65 && this.alert >= 65) this.toast('VOCÊ ESTÁ NA MIRA · SAIA DO HOLOFOTE');
    if (this.alert >= 100 && this.lockdownCooldown <= 0) this.lockdown();
  }

  updatePickups() {
    if (this.document && distance(this.player, this.document) < 39) this.collectDocument();
    if (this.coffee && distance(this.player, this.coffee) < 36) {
      this.lives = Math.min(this.maxLives, this.lives + 1);
      this.score += 350;
      this.coffee = null;
      this.sound.sfx('coffee');
      this.toast('CAFEZINHO · SANGUE FRIO RECUPERADO');
      this.burst(this.player.x, this.player.y, '#80e6c3', 18, 140);
    }
    if (this.exitOpen && distance(this.player, this.exit) < 53) this.finish(true, 'escaped');
  }

  collectDocument() {
    this.burst(this.document.x, this.document.y, '#f5bf45', 26, 175);
    this.documents += 1;
    this.combo = Math.min(3, this.combo + .25);
    this.score += Math.round((1000 + this.timeLeft * 5) * this.combo * this.config.score);
    this.timeLeft += 4;
    this.sound.sfx('pickup');

    if (this.documents >= TOTAL_DOCUMENTS) {
      this.document = null;
      this.exitOpen = true;
      this.toast('TODOS OS NÚCLEOS · CORRA PARA O SHUTTLE');
      this.alert = Math.max(this.alert, 25);
      return;
    }

    this.document = { ...this.documentPositions[this.documents] };
      this.toast(`NÚCLEO ${this.documents}/${TOTAL_DOCUMENTS} · +4 SEGUNDOS`);
    if (this.documents === 2) {
      this.drones.push({ x: 900, y: 540, centerX: 900, centerY: 540, radiusX: 250, radiusY: 145, orbitSpeed: .42, phase: 0, angle: 0, vision: 230, fov: 1.5, sees: false });
      this.toast('DRONE DE SEGURANÇA ATIVADO');
    }
    if (this.documents === 3 && this.lives < this.maxLives) this.coffee = { x: 720, y: 490 };
    if (this.documents === 4 && this.guards.length < 7) {
      this.guards.push(this.makeGuard(this.guardSpawns[Math.min(5, this.guardSpawns.length - 1)]));
      this.toast('REFORÇO PETISTA CHEGOU · MUDE DE ROTA');
    }
  }

  lockdown() {
    this.alert = 42;
    this.lockdownCooldown = 14;
    this.score = Math.max(0, this.score - 250);
    this.sound.sfx('alert');
    this.toast('ALERTA MÁXIMO · MAIS PETISTAS A CAMINHO');
    this.shake = 8;
    if (this.guards.length < 7) {
      const spawn = this.guardSpawns[Math.min(this.guards.length, this.guardSpawns.length - 1)];
      const guard = this.makeGuard(spawn);
      guard.state = 'investigate';
      guard.target = { x: this.player.x, y: this.player.y };
      this.guards.push(guard);
    }
  }

  hit(source) {
    this.lives -= 1;
    this.combo = 1;
    this.score = Math.max(0, this.score - 400);
    this.player.invulnerable = 2;
    this.shake = 18;
    this.sound.sfx('hit');
    this.burst(this.player.x, this.player.y, '#ff665e', 24, 210);
    const angle = Math.atan2(this.player.y - source.y, this.player.x - source.x);
    const moved = moveWithCollisions(this.player, Math.cos(angle) * 65, Math.sin(angle) * 65, this.obstacles, this.world);
    this.player.x = moved.x;
    this.player.y = moved.y;
    if (this.lives <= 0) this.finish(false, 'caught');
    else this.toast(`UM PETISTA TE ALCANÇOU · ${this.lives} CHANCES RESTANTES`);
  }

  burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i += 1) {
      const angle = this.rng() * TAU;
      const velocity = speed * (.25 + this.rng() * .75);
      const life = .35 + this.rng() * .55;
      this.particles.push({ x, y, vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity, life, maxLife: life, color, size: 2 + this.rng() * 4 });
    }
  }

  updateParticles(dt) {
    for (const particle of this.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vx *= .96;
      particle.vy *= .96;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  finish(won, reason) {
    if (this.state !== 'playing') return;
    this.state = won ? 'won' : 'lost';
    this.sound.stopMusic();
    if (won) {
      this.score += Math.round((this.timeLeft * 50 + this.lives * 500) * this.config.score);
      this.sound.sfx('win');
    } else this.sound.sfx('lose');
    this.score = Math.round(this.score);
    this.hooks.onEnd?.({ won, reason, score: this.score, documents: this.documents, timeLeft: this.timeLeft, difficulty: this.difficulty });
  }

  updateHud() {
    this.hooks.onUpdate?.({
      lives: this.lives,
      maxLives: this.maxLives,
      documents: this.documents,
      totalDocuments: TOTAL_DOCUMENTS,
      timeLeft: this.timeLeft,
      score: Math.round(this.score),
      alert: this.alert,
      seen: this.seen,
      dashCooldown: this.dashCooldown,
      dashMax: 2.8 * this.character.dashCooldown,
      decoyCooldown: this.decoyCooldown,
      decoyMax: 9 * this.character.decoyCooldown,
      exitOpen: this.exitOpen,
    });
  }

  toast(message) {
    this.hooks.onToast?.(message);
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    const shakeX = this.shake ? (this.rng() - .5) * this.shake : 0;
    const shakeY = this.shake ? (this.rng() - .5) * this.shake : 0;
    ctx.save();
    ctx.translate(-this.camera.x + shakeX, -this.camera.y + shakeY);
    ctx.drawImage(this.background, 0, 0);

    drawExit(ctx, this.exit, this.exitOpen, this.time);
    for (const camera of this.cameras) drawVisionCone(ctx, camera, camera.sees);
    for (const drone of this.drones) drawVisionCone(ctx, drone, drone.sees);
    for (const guard of this.guards) drawVisionCone(ctx, guard, guard.state === 'chase');

    if (this.document) drawDocument(ctx, this.document, this.time);
    if (this.coffee) drawCoffee(ctx, this.coffee, this.time);
    if (this.decoy) drawDecoy(ctx, this.decoy, this.time);

    const people = [...this.guards.map((guard) => ({ type: 'guard', entity: guard })), { type: 'player', entity: this.player }]
      .sort((a, b) => a.entity.y - b.entity.y);
    for (const person of people) {
      if (person.type === 'player') drawPlayer(ctx, person.entity, this.time);
      else drawGuard(ctx, person.entity, this.time);
    }
    for (const camera of this.cameras) drawCamera(ctx, camera, this.time);
    for (const drone of this.drones) drawDrone(ctx, drone, this.time);

    for (const particle of this.particles) {
      ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
      ctx.fillStyle = particle.color;
      ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    this.renderRain(ctx);
    if (this.state !== 'menu') {
      const target = this.document || this.exit;
      drawObjectiveArrow(ctx, target, this.player, this.camera, WIDTH, HEIGHT, this.time);
      drawMinimap(ctx, this, WIDTH, HEIGHT);
    }

    if (this.alert > 55 && this.state === 'playing') {
      const alpha = (this.alert - 55) / 45 * (.12 + Math.sin(this.time * 7) * .04);
      const gradient = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, HEIGHT * .25, WIDTH / 2, HEIGHT / 2, HEIGHT * .78);
      gradient.addColorStop(0, 'rgba(255,70,55,0)');
      gradient.addColorStop(1, `rgba(255,70,55,${alpha})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
  }

  renderRain(ctx) {
    ctx.save();
    ctx.strokeStyle = '#b9d5dc16';
    ctx.lineWidth = 1;
    for (const drop of this.rain) {
      const y = (drop.y + this.time * drop.speed) % (HEIGHT + 40) - 20;
      const x = (drop.x + this.time * 32) % (WIDTH + 30) - 15;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 4, y + drop.length);
      ctx.stroke();
    }
    ctx.restore();
  }
}
