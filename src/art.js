import { createRng, TAU } from './logic.js';

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fillStyle = color;
  ctx.fill();
}

function text(ctx, value, x, y, size, color, align = 'left', weight = '400') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px "Courier New", monospace`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function drawPlane(ctx) {
  ctx.save();
  ctx.translate(1480, 140);
  ctx.rotate(-0.06);
  ctx.shadowColor = '#0009';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = '#d9e1df';
  ctx.beginPath();
  ctx.moveTo(-170, -14);
  ctx.bezierCurveTo(-95, -28, 120, -27, 196, -4);
  ctx.bezierCurveTo(212, 2, 207, 15, 186, 20);
  ctx.bezierCurveTo(80, 39, -102, 29, -174, 13);
  ctx.closePath();
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#aebfc2';
  ctx.beginPath();
  ctx.moveTo(-35, -14);
  ctx.lineTo(52, -113);
  ctx.lineTo(91, -110);
  ctx.lineTo(45, -10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-28, 20);
  ctx.lineTo(54, 105);
  ctx.lineTo(90, 101);
  ctx.lineTo(45, 18);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#e9efea';
  ctx.beginPath();
  ctx.moveTo(-132, -13);
  ctx.lineTo(-176, -74);
  ctx.lineTo(-145, -73);
  ctx.lineTo(-80, -13);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#245784';
  ctx.fillRect(-154, -4, 335, 9);
  ctx.fillStyle = '#e7b93e';
  ctx.fillRect(-155, 5, 327, 4);
  for (let x = -105; x < 145; x += 20) ellipse(ctx, x, -13, 4.5, 3, '#263d4c');
  ctx.fillStyle = '#203746';
  ctx.beginPath();
  ctx.moveTo(160, -11); ctx.lineTo(190, -4); ctx.lineTo(172, 4); ctx.closePath(); ctx.fill();
  ctx.restore();

  ctx.strokeStyle = '#c7d5d2';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(1540, 163); ctx.lineTo(1540, 224); ctx.lineTo(1595, 240);
  ctx.stroke();
  ctx.fillStyle = '#263748';
  ctx.fillRect(1527, 202, 34, 8);
  ctx.fillRect(1580, 226, 28, 8);
}

function drawObstacle(ctx, obstacle) {
  const { x, y, w, h, type } = obstacle;
  ctx.save();
  ctx.shadowColor = '#0008';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 8;
  if (type === 'planter') {
    roundedRect(ctx, x, y, w, h, 8);
    ctx.fillStyle = '#384047'; ctx.fill();
    ctx.shadowColor = 'transparent';
    roundedRect(ctx, x + 5, y + 4, w - 10, h - 9, 5);
    ctx.fillStyle = '#182b28'; ctx.fill();
    const rng = createRng(Math.floor(x * 17 + y));
    for (let i = 0; i < Math.floor(w / 22); i += 1) {
      const px = x + 12 + rng() * (w - 24);
      const py = y + 8 + rng() * (h - 16);
      ellipse(ctx, px, py, 12 + rng() * 9, 7 + rng() * 6, rng() > .5 ? '#275848' : '#34705a');
      ctx.fillStyle = '#6b967055';
      ctx.fillRect(px - 1, py - 8, 2, 8);
    }
  } else if (type === 'bench') {
    roundedRect(ctx, x, y, w, h, 5);
    ctx.fillStyle = '#182631'; ctx.fill();
    ctx.shadowColor = 'transparent';
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = i % 2 ? '#926c43' : '#a67a49';
      ctx.fillRect(x + 5, y + 5 + i * ((h - 10) / 4), w - 10, (h - 15) / 4);
    }
    ctx.fillStyle = '#111b22';
    ctx.fillRect(x + 13, y + h - 2, 7, 8);
    ctx.fillRect(x + w - 20, y + h - 2, 7, 8);
  } else if (type === 'luggage') {
    const colors = ['#9c493f', '#34576c', '#b59146', '#443e59'];
    const cols = Math.max(1, Math.floor(w / 55));
    for (let i = 0; i < cols; i += 1) {
      const bw = Math.min(43, w / cols - 8);
      const bx = x + 8 + i * (w / cols);
      const by = y + (i % 2) * 8;
      roundedRect(ctx, bx, by, bw, h - 10, 5);
      ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#ffffff22'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#111a22'; ctx.fillRect(bx + 8, by + 7, bw - 16, 3);
      ctx.fillRect(bx + bw / 2 - 6, by - 4, 12, 5);
    }
  } else if (type === 'kiosk') {
    roundedRect(ctx, x, y, w, h, 4);
    ctx.fillStyle = '#172736'; ctx.fill();
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#233c4d'; ctx.fillRect(x + 7, y + 7, w - 14, h - 14);
    ctx.fillStyle = '#f5bf45'; ctx.fillRect(x + 7, y + 7, w - 14, 12);
    text(ctx, 'CAFE / JORNAIS', x + w / 2, y + 13, 9, '#17202a', 'center', '700');
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = i % 2 ? '#d8d4c6' : '#7d9ca3';
      ctx.fillRect(x + 13 + i * ((w - 32) / 4), y + 29, (w - 42) / 4, h - 40);
    }
  }
  ctx.restore();
}

export function createBackground(world, obstacles) {
  const canvas = document.createElement('canvas');
  canvas.width = world.w;
  canvas.height = world.h;
  const ctx = canvas.getContext('2d');
  const rng = createRng(13022026);

  const ground = ctx.createLinearGradient(0, 0, world.w, world.h);
  ground.addColorStop(0, '#172734');
  ground.addColorStop(.48, '#101e2b');
  ground.addColorStop(1, '#0b1824');
  ctx.fillStyle = ground;
  ctx.fillRect(0, 0, world.w, world.h);

  ctx.strokeStyle = '#a5c2c609';
  ctx.lineWidth = 1;
  for (let x = 0; x < world.w; x += 80) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, world.h); ctx.stroke();
  }
  for (let y = 0; y < world.h; y += 80) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(world.w, y); ctx.stroke();
  }

  for (let i = 0; i < 1700; i += 1) {
    const alpha = rng() * .08;
    ctx.fillStyle = rng() > .5 ? `rgba(215,232,226,${alpha})` : `rgba(0,0,0,${alpha + .03})`;
    const size = rng() * 2 + .5;
    ctx.fillRect(rng() * world.w, rng() * world.h, size, size);
  }

  for (let i = 0; i < 14; i += 1) {
    const x = 100 + rng() * (world.w - 200);
    const y = 140 + rng() * (world.h - 230);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.8 + rng() * 2.2, .5 + rng() * .4);
    const puddle = ctx.createRadialGradient(0, 0, 2, 0, 0, 35);
    puddle.addColorStop(0, '#87b7c218');
    puddle.addColorStop(1, '#87b7c200');
    ctx.fillStyle = puddle;
    ctx.beginPath(); ctx.arc(0, 0, 35, 0, TAU); ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = '#d7c26810';
  ctx.fillRect(0, 458, world.w, 3);
  ctx.fillRect(0, 622, world.w, 3);
  ctx.setLineDash([30, 26]);
  ctx.strokeStyle = '#e7d48233';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(0, 540); ctx.lineTo(world.w, 540); ctx.stroke();
  ctx.setLineDash([]);

  ctx.save();
  ctx.translate(80, 520);
  ctx.rotate(-Math.PI / 2);
  text(ctx, 'NADA A DECLARAR  →', 0, 0, 22, '#d7c26835', 'left', '700');
  ctx.restore();
  text(ctx, 'SETOR B · EMBARQUE', 1130, 1000, 17, '#c6d8d21c', 'center', '700');
  text(ctx, '13', 110, 925, 130, '#d7c26813', 'center', '700');

  ctx.fillStyle = '#0a121d';
  ctx.fillRect(0, 0, world.w, 92);
  const terminal = ctx.createLinearGradient(0, 0, 0, 92);
  terminal.addColorStop(0, '#243949');
  terminal.addColorStop(1, '#111f2c');
  ctx.fillStyle = terminal;
  ctx.fillRect(0, 0, world.w, 76);
  ctx.fillStyle = '#080e17';
  ctx.fillRect(0, 76, world.w, 16);
  for (let x = 15; x < world.w - 20; x += 86) {
    ctx.fillStyle = '#2e5260';
    ctx.fillRect(x, 9, 68, 49);
    ctx.fillStyle = '#78a4a522';
    ctx.fillRect(x + 4, 13, 26, 41);
    ctx.fillStyle = '#e7bc5933';
    ctx.fillRect(x + 5, 13, 2, 40);
  }
  ctx.fillStyle = '#e7b943';
  ctx.fillRect(54, 65, 240, 4);
  text(ctx, 'AEROPORTO INTERNACIONAL · TERMINAL 13', 60, 40, 16, '#a9c0bd', 'left', '700');

  ctx.fillStyle = '#0b151e';
  ctx.fillRect(0, 1012, world.w, 68);
  ctx.fillStyle = '#263945';
  ctx.fillRect(0, 1012, world.w, 7);
  for (let x = 20; x < world.w; x += 75) {
    ellipse(ctx, x, 1025, 3, 3, '#eac361');
    const glow = ctx.createRadialGradient(x, 1025, 0, x, 1025, 20);
    glow.addColorStop(0, '#eac36133'); glow.addColorStop(1, '#eac36100');
    ctx.fillStyle = glow; ctx.fillRect(x - 20, 1005, 40, 40);
  }

  for (let y = 190; y < 960; y += 165) {
    ctx.fillStyle = '#e7c45b';
    ctx.fillRect(26, y, 4, 18);
    ctx.fillRect(world.w - 30, y, 4, 18);
    ellipse(ctx, 28, y - 4, 3, 3, '#ffdc78');
    ellipse(ctx, world.w - 28, y - 4, 3, 3, '#ffdc78');
  }

  drawPlane(ctx);
  obstacles.forEach((obstacle) => drawObstacle(ctx, obstacle));
  return canvas;
}

export function drawVisionCone(ctx, observer, alert = false) {
  const range = observer.vision ?? 280;
  const fov = observer.fov ?? Math.PI / 3;
  const color = alert ? '255,92,79' : '244,205,112';
  const gradient = ctx.createRadialGradient(observer.x, observer.y, 4, observer.x, observer.y, range);
  gradient.addColorStop(0, `rgba(${color},.22)`);
  gradient.addColorStop(.65, `rgba(${color},.10)`);
  gradient.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(observer.x, observer.y);
  ctx.arc(observer.x, observer.y, range, observer.angle - fov / 2, observer.angle + fov / 2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = `rgba(${color},.09)`;
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawShadow(ctx, width = 21) {
  ellipse(ctx, 1, 17, width, 7, '#00000065');
}

export function drawPlayer(ctx, player, time) {
  const character = player.character || {};
  const skin = character.skin || '#dbad89';
  const skinShadow = character.skinShadow || '#bd8b6d';
  const hair = character.hair || '#e6b94c';
  const hairLight = character.hairLight || '#f7d776';
  const suit = character.suit || '#1a2e4b';
  const suitLight = character.suitLight || '#223b5d';
  const moving = Math.hypot(player.vx || 0, player.vy || 0) > 10;
  const step = moving ? Math.sin(time * 15) : 0;
  const bob = moving ? Math.abs(Math.sin(time * 15)) * 2 : Math.sin(time * 3) * .6;
  ctx.save();
  ctx.translate(player.x, player.y - bob);
  ctx.scale(character.broad || 1, 1);
  if (player.invulnerable > 0 && Math.floor(time * 14) % 2) ctx.globalAlpha = .35;
  if (player.dashing > 0) {
    ctx.shadowColor = '#f5bf45';
    ctx.shadowBlur = 18;
  }
  drawShadow(ctx);

  ctx.fillStyle = '#111927';
  ctx.fillRect(-12, 7 + step * 2, 9, 15 - step * 2);
  ctx.fillRect(3, 7 - step * 2, 9, 15 + step * 2);
  ellipse(ctx, -8, 22, 7, 3, '#080d14');
  ellipse(ctx, 8, 22, 7, 3, '#080d14');

  ctx.fillStyle = suit;
  roundedRect(ctx, -18, -15, 36, 31, 8); ctx.fill();
  ctx.fillStyle = suitLight;
  ctx.beginPath(); ctx.moveTo(-17,-11); ctx.lineTo(-5,-14); ctx.lineTo(-2,12); ctx.lineTo(-16,9); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#e4e2d8';
  ctx.beginPath(); ctx.moveTo(-6,-14); ctx.lineTo(0,-4); ctx.lineTo(6,-14); ctx.closePath(); ctx.fill();
  if (character.tie) {
    ctx.fillStyle = character.tie;
    ctx.beginPath(); ctx.moveTo(-2,-8); ctx.lineTo(2,-8); ctx.lineTo(4,8); ctx.lineTo(0,12); ctx.lineTo(-3,8); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = '#d6b65b';
    ctx.beginPath(); ctx.moveTo(-5,-12); ctx.lineTo(0,-5); ctx.lineTo(5,-12); ctx.lineTo(0,-8); ctx.closePath(); ctx.fill();
  }

  ctx.fillStyle = suit;
  roundedRect(ctx, -24, -11 + step, 8, 25, 4); ctx.fill();
  roundedRect(ctx, 16, -11 - step, 8, 25, 4); ctx.fill();
  ellipse(ctx, -20, 13 + step, 5, 5, skin);
  ellipse(ctx, 20, 13 - step, 5, 5, skin);

  ctx.fillStyle = '#6d482e';
  roundedRect(ctx, 17, 9 - step, 20, 17, 2); ctx.fill();
  ctx.strokeStyle = '#bc8d52'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#d3ac5a'; ctx.fillRect(24, 15 - step, 5, 3);

  if (character.hairStyle === 'long') {
    ctx.fillStyle = hair;
    roundedRect(ctx, -17, -39, 34, 39, 13); ctx.fill();
    ctx.fillStyle = hairLight;
    ctx.fillRect(-15, -27, 3, 22);
    ctx.fillRect(12, -27, 3, 22);
  }
  ellipse(ctx, -13, -23, 4, 6, skin);
  ellipse(ctx, 13, -23, 4, 6, skin);
  ellipse(ctx, 0, -24, 14, 16, skin);
  ctx.fillStyle = skinShadow;
  ctx.beginPath(); ctx.ellipse(5,-22,7,13,0,-Math.PI/2,Math.PI/2); ctx.fill();

  if (character.beard === 'full') {
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-12, -22); ctx.quadraticCurveTo(-12, -7, 0, -7);
    ctx.quadraticCurveTo(12, -7, 12, -22); ctx.lineTo(8, -17);
    ctx.quadraticCurveTo(0, -11, -8, -17); ctx.closePath(); ctx.fill();
    ctx.fillStyle = hairLight;
    ctx.fillRect(-8, -14, 2, 4); ctx.fillRect(6, -14, 2, 4);
  } else if (character.beard === 'stubble') {
    ctx.fillStyle = `${hair}99`;
    for (let i = 0; i < 7; i += 1) ctx.fillRect(-8 + i * 2.5, -13 - Math.abs(3 - i), 1.3, 1.3);
  }

  if (character.hairStyle === 'swoop') {
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-15, -26);
    ctx.bezierCurveTo(-20, -43, 4, -47, 14, -37);
    ctx.lineTo(18, -28); ctx.lineTo(10, -32);
    ctx.bezierCurveTo(3, -36, -3, -32, -12, -29);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = hairLight;
    ctx.beginPath(); ctx.moveTo(-12,-35); ctx.quadraticCurveTo(1,-43,13,-34); ctx.lineTo(10,-31); ctx.quadraticCurveTo(0,-37,-11,-30); ctx.closePath(); ctx.fill();
  } else if (character.hairStyle === 'short' || character.hairStyle === 'long') {
    ctx.fillStyle = hair;
    ctx.beginPath();
    ctx.moveTo(-14,-27); ctx.quadraticCurveTo(-13,-43,0,-43);
    ctx.quadraticCurveTo(14,-43,15,-27); ctx.lineTo(10,-32);
    ctx.quadraticCurveTo(0,-37,-11,-30); ctx.closePath(); ctx.fill();
    ctx.fillRect(-14,-29,3,9); ctx.fillRect(11,-29,3,9);
    ctx.fillStyle = hairLight;
    ctx.beginPath(); ctx.moveTo(-9,-36); ctx.quadraticCurveTo(0,-41,9,-35); ctx.lineTo(7,-33); ctx.quadraticCurveTo(0,-37,-8,-32); ctx.closePath(); ctx.fill();
  } else {
    ctx.fillStyle = hair;
    ctx.fillRect(-14,-28,3,8); ctx.fillRect(11,-28,3,8);
    ctx.strokeStyle = skinShadow; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0,-28,9,Math.PI*1.1,Math.PI*1.9); ctx.stroke();
  }

  const look = Math.cos(player.angle || 0) * 1.3;
  ellipse(ctx, -5 + look, -24, 2.2, 1.7, '#f4eee1');
  ellipse(ctx, 5 + look, -24, 2.2, 1.7, '#f4eee1');
  ellipse(ctx, -5 + look, -24, 1.1, 1.2, '#14202a');
  ellipse(ctx, 5 + look, -24, 1.1, 1.2, '#14202a');
  ctx.strokeStyle = '#6f4a37'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-8,-28); ctx.lineTo(-3,-28); ctx.moveTo(3,-28); ctx.lineTo(8,-28); ctx.stroke();
  if (character.glasses) {
    ctx.strokeStyle = '#1a2026'; ctx.lineWidth = 1.5;
    ctx.strokeRect(-10,-28,9,7); ctx.strokeRect(1,-28,9,7);
    ctx.beginPath(); ctx.moveTo(-1,-25); ctx.lineTo(1,-25); ctx.stroke();
    ctx.fillStyle = '#ffffff55'; ctx.fillRect(-8,-27,3,1); ctx.fillRect(3,-27,3,1);
  }
  if (character.hairStyle === 'long') {
    ellipse(ctx, -14, -19, 1.8, 2.5, '#e7bd53');
    ellipse(ctx, 14, -19, 1.8, 2.5, '#e7bd53');
  }
  ctx.strokeStyle = character.beard === 'full' ? '#d9b196' : '#6f4a37';
  ctx.beginPath(); ctx.arc(look, -18, 3.5, .25, Math.PI - .25); ctx.stroke();
  ctx.restore();
}

export function drawGuard(ctx, guard, time) {
  const chasing = guard.state === 'chase';
  const variant = guard.variant || 0;
  const skins = ['#b98a6a', '#8f624c', '#d0a07e', '#a8785e'];
  const skin = skins[variant % skins.length];
  const shirt = chasing ? '#c84c43' : ['#a93c38', '#98342f', '#b7453e', '#8f3533'][variant % 4];
  const step = Math.sin(time * (chasing ? 18 : 10) + guard.x) * 2;
  ctx.save();
  ctx.translate(guard.x, guard.y);

  if (variant === 3) {
    ctx.strokeStyle = '#604a36'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(23,14); ctx.lineTo(23,-53); ctx.stroke();
    ctx.fillStyle = '#b83e38';
    ctx.beginPath(); ctx.moveTo(24,-52); ctx.quadraticCurveTo(38,-57,49,-50); ctx.lineTo(47,-34); ctx.quadraticCurveTo(36,-40,24,-35); ctx.closePath(); ctx.fill();
    text(ctx, 'PT', 35, -45, 7, '#f4e5d3', 'center', '700');
  }

  drawShadow(ctx, 22);
  if (chasing) { ctx.shadowColor = '#ff665e'; ctx.shadowBlur = 12; }
  ctx.fillStyle = '#171c26';
  ctx.fillRect(-12, 8 + step, 9, 14 - step);
  ctx.fillRect(3, 8 - step, 9, 14 + step);
  ellipse(ctx, -8, 22, 7, 3, '#080b11');
  ellipse(ctx, 8, 22, 7, 3, '#080b11');
  ctx.fillStyle = shirt;
  roundedRect(ctx, -19, -15, 38, 31, 7); ctx.fill();
  ctx.fillStyle = '#d85b5055';
  ctx.fillRect(-17, -10, 6, 22);
  ctx.fillStyle = '#211b1b'; ctx.fillRect(-19, 8, 38, 5);
  ctx.fillStyle = '#d2b154'; ctx.fillRect(-3, 8, 6, 5);

  ctx.fillStyle = '#f1e7d5';
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + i * Math.PI / 5;
    const radius = i % 2 ? 2 : 4.5;
    const x = -9 + Math.cos(angle) * radius;
    const y = -5 + Math.sin(angle) * radius;
    if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
  }
  ctx.closePath(); ctx.fill();
  text(ctx, 'PT', 7, -3, 7, '#f1e7d5', 'center', '700');
  ctx.fillStyle = shirt;
  roundedRect(ctx, -24, -10 - step, 8, 24, 4); ctx.fill();
  roundedRect(ctx, 16, -10 + step, 8, 24, 4); ctx.fill();
  ellipse(ctx, -20, 13 - step, 5, 5, skin);
  ellipse(ctx, 20, 13 + step, 5, 5, skin);

  ellipse(ctx, 0, -24, 14, 15, skin);
  ctx.fillStyle = '#00000018';
  ctx.beginPath(); ctx.ellipse(5,-22,7,12,0,-Math.PI/2,Math.PI/2); ctx.fill();
  if (variant === 1) {
    ctx.fillStyle = '#2c211d';
    ctx.beginPath(); ctx.moveTo(-11,-20); ctx.quadraticCurveTo(-8,-8,0,-8); ctx.quadraticCurveTo(9,-8,11,-20); ctx.lineTo(7,-15); ctx.quadraticCurveTo(0,-10,-7,-15); ctx.closePath(); ctx.fill();
  }

  if (variant % 2 === 0) {
    ctx.fillStyle = '#a93c38';
    ctx.beginPath(); ctx.moveTo(-16,-26); ctx.quadraticCurveTo(-14,-43,0,-43); ctx.quadraticCurveTo(15,-43,16,-26); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c94c43';
    roundedRect(ctx, -17, -29, 34, 7, 3); ctx.fill();
    ctx.fillStyle = '#f1e7d5';
    ctx.beginPath(); ctx.arc(0,-35,3,0,TAU); ctx.fill();
  } else {
    ctx.fillStyle = variant === 1 ? '#2c211d' : '#584334';
    ctx.beginPath(); ctx.moveTo(-14,-27); ctx.quadraticCurveTo(-13,-42,0,-42); ctx.quadraticCurveTo(14,-42,14,-27); ctx.lineTo(9,-32); ctx.quadraticCurveTo(0,-36,-10,-30); ctx.closePath(); ctx.fill();
  }

  if (variant === 0 || variant === 2) {
    ctx.fillStyle = '#171419';
    roundedRect(ctx, -11, -27, 22, 6, 2); ctx.fill();
    ctx.fillStyle = '#ffffff55'; ctx.fillRect(-8,-26,6,1); ctx.fillRect(2,-26,5,1);
  } else {
    ellipse(ctx, -5, -24, 1.6, 1.5, '#171419');
    ellipse(ctx, 5, -24, 1.6, 1.5, '#171419');
  }
  ctx.strokeStyle = variant === 1 ? '#b98a6a' : '#593e32'; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-3,-17); ctx.lineTo(3,-17); ctx.stroke();
  if (chasing) text(ctx, '!', 0, -58, 22, '#ff665e', 'center', '700');
  else if (guard.state === 'investigate') text(ctx, '?', 0, -56, 19, '#f5bf45', 'center', '700');
  ctx.restore();
}

export function drawCamera(ctx, camera, time) {
  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.fillStyle = '#0a1119';
  ctx.fillRect(-5, -12, 10, 19);
  ctx.rotate(camera.angle);
  ctx.shadowColor = '#0008'; ctx.shadowBlur = 8;
  ctx.fillStyle = '#b9c5c1';
  roundedRect(ctx, -5, -8, 29, 16, 5); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#31434b'; ctx.fillRect(13, -6, 8, 12);
  ellipse(ctx, 20, 0, 4, 5, '#09131b');
  ellipse(ctx, 21, 0, 2, 2.5, camera.sees ? '#ff665e' : '#f5bf45');
  ctx.restore();
  if (Math.sin(time * 4) > 0) ellipse(ctx, camera.x - 7, camera.y - 10, 2, 2, '#ff665e');
}

export function drawDrone(ctx, drone, time) {
  ctx.save();
  ctx.translate(drone.x, drone.y + Math.sin(time * 4 + drone.x) * 4);
  drawShadow(ctx, 17);
  ctx.strokeStyle = '#6f8187'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-17,-12); ctx.lineTo(17,12); ctx.moveTo(17,-12); ctx.lineTo(-17,12); ctx.stroke();
  for (const [x, y] of [[-18,-13],[18,-13],[-18,13],[18,13]]) {
    ellipse(ctx, x, y, 10, 3, '#91a2a544');
    ellipse(ctx, x, y, 3, 3, '#182a36');
  }
  ellipse(ctx, 0, 0, 13, 11, '#314a5b');
  ellipse(ctx, 0, 2, 6, 5, '#0c151e');
  ellipse(ctx, 0, 3, 2.5, 2.5, drone.sees ? '#ff665e' : '#f5bf45');
  ctx.restore();
}

export function drawDocument(ctx, document, time) {
  const bob = Math.sin(time * 3.5) * 7;
  ctx.save();
  ctx.translate(document.x, document.y + bob);
  const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 58);
  glow.addColorStop(0, '#f5bf4540'); glow.addColorStop(1, '#f5bf4500');
  ctx.fillStyle = glow; ctx.fillRect(-60,-60,120,120);
  ellipse(ctx, 0, 24 - bob, 21, 6, '#00000055');
  ctx.rotate(Math.sin(time * 2) * .07);
  ctx.fillStyle = '#c68e2e';
  ctx.fillRect(-17, -19, 36, 43);
  ctx.fillStyle = '#f4e7bd';
  ctx.fillRect(-20, -24, 36, 42);
  ctx.fillStyle = '#fff6da';
  ctx.beginPath(); ctx.moveTo(-20,-24); ctx.lineTo(7,-24); ctx.lineTo(16,-15); ctx.lineTo(16,18); ctx.lineTo(-20,18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#d5c799';
  ctx.beginPath(); ctx.moveTo(7,-24); ctx.lineTo(7,-15); ctx.lineTo(16,-15); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b34b3f';
  ctx.fillRect(-13, -12, 20, 4);
  ctx.fillStyle = '#77715d';
  ctx.fillRect(-13, -3, 23, 2); ctx.fillRect(-13, 3, 23, 2); ctx.fillRect(-13, 9, 15, 2);
  ctx.restore();
}

export function drawDecoy(ctx, decoy, time) {
  ctx.save();
  ctx.translate(decoy.x, decoy.y);
  ctx.rotate(Math.sin(time * 8) * .12);
  ctx.fillStyle = '#ddd9c9';
  ctx.fillRect(-18, -13, 36, 26);
  ctx.strokeStyle = '#22303a'; ctx.lineWidth = 1;
  ctx.strokeRect(-18, -13, 36, 26);
  text(ctx, 'FATO?', 0, -6, 7, '#9b4037', 'center', '700');
  ctx.fillStyle = '#596168'; ctx.fillRect(-13, 0, 11, 8); ctx.fillRect(3, 0, 11, 2); ctx.fillRect(3, 5, 11, 2); ctx.fillRect(3, 10, 11, 2);
  ctx.restore();
  const pulse = (time * 70) % 55;
  ctx.strokeStyle = `rgba(245,191,69,${1 - pulse / 55})`;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(decoy.x, decoy.y, 18 + pulse, 0, TAU); ctx.stroke();
}

export function drawCoffee(ctx, coffee, time) {
  ctx.save();
  ctx.translate(coffee.x, coffee.y + Math.sin(time * 4) * 4);
  const glow = ctx.createRadialGradient(0,0,0,0,0,40);
  glow.addColorStop(0,'#80e6c333'); glow.addColorStop(1,'#80e6c300');
  ctx.fillStyle = glow; ctx.fillRect(-40,-40,80,80);
  ctx.fillStyle = '#e8e1ce';
  roundedRect(ctx,-10,-10,20,22,3); ctx.fill();
  ctx.strokeStyle = '#e8e1ce'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(12,0,7,-Math.PI/2,Math.PI/2); ctx.stroke();
  ctx.fillStyle = '#5e3928'; ctx.fillRect(-7,-7,14,4);
  ctx.strokeStyle = '#80e6c3'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-4,-15); ctx.quadraticCurveTo(-8,-22,-3,-27); ctx.moveTo(4,-15); ctx.quadraticCurveTo(0,-22,5,-27); ctx.stroke();
  ctx.restore();
}

export function drawExit(ctx, exit, active, time) {
  ctx.save();
  ctx.translate(exit.x, exit.y);
  const pulse = 1 + Math.sin(time * 4) * .08;
  ctx.scale(pulse, pulse);
  ctx.strokeStyle = active ? '#80e6c3' : '#77858a55';
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 7]);
  ctx.beginPath(); ctx.arc(0, 0, 42, 0, TAU); ctx.stroke();
  ctx.setLineDash([]);
  if (active) {
    const glow = ctx.createRadialGradient(0,0,0,0,0,75);
    glow.addColorStop(0,'#80e6c329'); glow.addColorStop(1,'#80e6c300');
    ctx.fillStyle = glow; ctx.fillRect(-75,-75,150,150);
  }
  text(ctx, active ? 'EMBARQUE' : 'BLOQUEADO', 0, 0, 9, active ? '#80e6c3' : '#77858a', 'center', '700');
  ctx.restore();
}

export function drawObjectiveArrow(ctx, target, player, camera, width, height, time) {
  const sx = target.x - camera.x;
  const sy = target.y - camera.y;
  if (sx > 60 && sx < width - 60 && sy > 90 && sy < height - 70) return;
  const centerX = width / 2;
  const centerY = height / 2;
  const angle = Math.atan2(sy - centerY, sx - centerX);
  const radiusX = width / 2 - 55;
  const radiusY = height / 2 - 75;
  const scale = Math.min(Math.abs(radiusX / (Math.cos(angle) || .001)), Math.abs(radiusY / (Math.sin(angle) || .001)));
  const x = centerX + Math.cos(angle) * scale;
  const y = centerY + Math.sin(angle) * scale;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalAlpha = .75 + Math.sin(time * 5) * .2;
  ctx.fillStyle = target.active === false ? '#80e6c3' : '#f5bf45';
  ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(-10,-9); ctx.lineTo(-5,0); ctx.lineTo(-10,9); ctx.closePath(); ctx.fill();
  ctx.restore();
}

export function drawMinimap(ctx, game, width, height) {
  const w = 172;
  const h = 104;
  const x = width - w - 25;
  const y = height - h - 78;
  const scaleX = w / game.world.w;
  const scaleY = h / game.world.h;
  ctx.save();
  ctx.globalAlpha = .88;
  ctx.fillStyle = '#07101bdd';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#a9bfbd33'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = '#ffffff0c';
  game.obstacles.forEach((o) => ctx.fillRect(x + o.x * scaleX, y + o.y * scaleY, Math.max(1,o.w * scaleX), Math.max(1,o.h * scaleY)));
  const dot = (entity, color, radius) => {
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x + entity.x * scaleX, y + entity.y * scaleY, radius, 0, TAU); ctx.fill();
  };
  game.guards.forEach((guard) => dot(guard, '#ff665e', 1.7));
  if (game.document) dot(game.document, '#f5bf45', 3);
  if (game.exitOpen) dot(game.exit, '#80e6c3', 3);
  dot(game.player, '#f4eee1', 2.7);
  text(ctx, 'MAPA TÁTICO', x + 7, y + 9, 7, '#a9bfbd77');
  ctx.restore();
}
