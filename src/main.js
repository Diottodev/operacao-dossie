import { Game } from './game.js';
import { SoundSystem } from './audio.js';
import { clamp, formatTime } from './logic.js';
import { CHARACTERS, DEFAULT_CHARACTER } from './characters.js';
import { drawPlayer } from './art.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const canvas = $('#game');
const sound = new SoundSystem();
const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
const screens = {
  menu: $('#menu-screen'),
  how: $('#how-screen'),
  character: $('#character-screen'),
  pause: $('#pause-screen'),
  result: $('#result-screen'),
};
const hud = $('#hud');
const statusBar = $('#status-bar');
const touchControls = $('#touch-controls');
const pauseButton = $('#pause-button');
const locationTag = $('#location-tag');
const scoreFormatter = (score) => String(Math.max(0, Math.round(score))).padStart(6, '0');

let selectedDifficulty = 'normal';
let selectedCharacter = DEFAULT_CHARACTER;
let toastTimeout;
let bestScore = 0;
try { bestScore = Number(localStorage.getItem('operacao-dossie.best') || 0); } catch { /* armazenamento pode estar indisponível */ }
$('#best-score').textContent = `MELHOR PONTUAÇÃO · ${scoreFormatter(bestScore)}`;

try { sound.muted = localStorage.getItem('operacao-dossie.muted') === 'true'; } catch { /* sem persistência */ }

function hideScreens() {
  Object.values(screens).forEach((screen) => screen.classList.add('hidden'));
}

function showGameUi(show) {
  hud.classList.toggle('hidden', !show);
  statusBar.classList.toggle('hidden', !show);
  pauseButton.classList.toggle('hidden', !show);
  touchControls.classList.toggle('hidden', !show || !coarsePointer);
}

function toast(message) {
  const element = $('#toast');
  window.clearTimeout(toastTimeout);
  element.textContent = message;
  element.classList.add('show');
  toastTimeout = window.setTimeout(() => element.classList.remove('show'), 2400);
}

function updateHud(data) {
  $('#doc-count').textContent = data.documents;
  $('#timer').textContent = formatTime(data.timeLeft);
  $('#timer').classList.toggle('danger', data.timeLeft <= 15);
  $('#score').textContent = scoreFormatter(data.score);
  $('#objective').textContent = data.exitOpen ? 'ALCANCE O AVIÃO' : 'LOCALIZE O DOSSIÊ';

  const track = $('#document-track');
  if (!track.children.length) {
    for (let i = 0; i < data.totalDocuments; i += 1) track.append(document.createElement('i'));
  }
  [...track.children].forEach((item, index) => item.classList.toggle('found', index < data.documents));

  const hearts = $('#hearts');
  if (hearts.children.length !== data.maxLives) {
    hearts.replaceChildren();
    for (let i = 0; i < data.maxLives; i += 1) {
      const heart = document.createElement('span');
      heart.className = 'heart';
      hearts.append(heart);
    }
  }
  [...hearts.children].forEach((heart, index) => heart.classList.toggle('lost', index >= data.lives));

  $('#alert-fill').style.width = `${data.alert}%`;
  const alertColor = data.alert > 65 ? '#ff665e' : data.alert > 30 ? '#f5bf45' : '#80e6c3';
  $('#alert-fill').style.background = alertColor;
  $('#alert-label').style.color = alertColor;
  $('#alert-label').textContent = data.seen ? 'DETECTADO' : data.alert > 65 ? 'QUASE LÁ' : data.alert > 30 ? 'SUSPEITO' : 'DISCRETO';

  const dashReady = 1 - clamp(data.dashCooldown / data.dashMax, 0, 1);
  const decoyReady = 1 - clamp(data.decoyCooldown / data.decoyMax, 0, 1);
  $('#dash-ability i').style.width = `${dashReady * 100}%`;
  $('#decoy-ability i').style.width = `${decoyReady * 100}%`;
  $('#dash-ability').classList.toggle('cooling', data.dashCooldown > 0);
  $('#decoy-ability').classList.toggle('cooling', data.decoyCooldown > 0);
}

function updateCharacterSelection() {
  $$('.character-card').forEach((card) => {
    const selected = card.dataset.character === selectedCharacter.id;
    card.classList.toggle('selected', selected);
    card.setAttribute('aria-checked', String(selected));
  });
  $('#selected-character-perk').textContent = `${selectedCharacter.shortName} · ${selectedCharacter.perk}`.toUpperCase();
}

function buildCharacterCards() {
  const grid = $('#character-grid');
  for (const character of CHARACTERS) {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'character-card';
    card.dataset.character = character.id;
    card.setAttribute('role', 'radio');
    card.setAttribute('aria-label', `${character.name}: ${character.perk}`);

    const portrait = document.createElement('canvas');
    portrait.width = 140;
    portrait.height = 130;
    portrait.setAttribute('aria-hidden', 'true');
    drawPlayer(portrait.getContext('2d'), {
      x: 70, y: 88, angle: 0, vx: 0, vy: 0,
      invulnerable: 0, dashing: 0, character,
    }, 0);

    const copy = document.createElement('span');
    copy.className = 'character-card-copy';
    const name = document.createElement('strong');
    name.textContent = character.name;
    const role = document.createElement('span');
    role.className = 'character-role';
    role.textContent = character.role;
    const perk = document.createElement('span');
    perk.className = 'character-perk';
    perk.textContent = character.perk;
    copy.append(name, role, perk);
    card.append(portrait, copy);
    card.addEventListener('click', () => {
      selectedCharacter = character;
      updateCharacterSelection();
      sound.sfx('click');
    });
    grid.append(card);
  }
  updateCharacterSelection();
}

function openCharacterSelection() {
  sound.sfx('click');
  hideScreens();
  updateCharacterSelection();
  screens.character.classList.remove('hidden');
}

function startGame() {
  sound.sfx('click');
  resetInput();
  hideScreens();
  showGameUi(true);
  locationTag.classList.remove('hidden');
  locationTag.style.animation = 'none';
  void locationTag.offsetWidth;
  locationTag.style.animation = '';
  game.start(selectedDifficulty, selectedCharacter);
  canvas.focus();
}

function returnToMenu() {
  sound.stopMusic();
  sound.sfx('click');
  hideScreens();
  screens.menu.classList.remove('hidden');
  showGameUi(false);
  locationTag.classList.add('hidden');
  game.reset(selectedDifficulty, selectedCharacter);
  game.state = 'menu';
  resetInput();
}

const game = new Game(canvas, sound, {
  onUpdate: updateHud,
  onToast: toast,
  onStart: () => showGameUi(true),
  onPause: (paused) => {
    screens.pause.classList.toggle('hidden', !paused);
    touchControls.classList.toggle('hidden', paused || !coarsePointer);
    resetInput();
  },
  onEnd: (result) => {
    showGameUi(false);
    screens.result.classList.remove('hidden');
    const isRecord = result.score > bestScore;
    if (isRecord) {
      bestScore = result.score;
      try { localStorage.setItem('operacao-dossie.best', String(bestScore)); } catch { /* sem persistência */ }
      $('#best-score').textContent = `MELHOR PONTUAÇÃO · ${scoreFormatter(bestScore)}`;
    }
    $('#new-record').classList.toggle('hidden', !isRecord || result.score === 0);
    $('#result-score').textContent = scoreFormatter(result.score);
    $('#result-docs').textContent = `${result.documents} / 6`;
    $('#result-time').textContent = formatTime(result.timeLeft);

    if (result.won) {
      $('#result-eyebrow').textContent = 'MISSÃO CUMPRIDA';
      $('#result-title').textContent = 'Nada a declarar.';
      $('#result-message').textContent = 'Os papéis embarcaram. As explicações ficaram para o próximo voo.';
    } else {
      $('#result-eyebrow').textContent = result.reason === 'time' ? 'VOO PERDIDO' : 'FIM DA LINHA';
      $('#result-title').textContent = result.reason === 'time' ? 'Atraso justificado?' : 'Pego no flagra.';
      $('#result-message').textContent = result.reason === 'time'
        ? 'O avião partiu sem os dossiês. Da próxima vez, menos reunião e mais arranque.'
        : 'Os petistas pediram uma explicação. O plano não sobreviveu ao primeiro questionário.';
    }
  },
});

buildCharacterCards();

$$('[data-difficulty]').forEach((button) => {
  button.addEventListener('click', () => {
    selectedDifficulty = button.dataset.difficulty;
    $$('[data-difficulty]').forEach((item) => {
      const selected = item === button;
      item.classList.toggle('selected', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    sound.sfx('click');
  });
});

$('#start-button').addEventListener('click', openCharacterSelection);
$('#how-start-button').addEventListener('click', openCharacterSelection);
$('#confirm-character-button').addEventListener('click', startGame);
$('#character-back-button').addEventListener('click', () => {
  sound.sfx('click');
  hideScreens();
  screens.menu.classList.remove('hidden');
});
$('#how-button').addEventListener('click', () => {
  sound.sfx('click');
  hideScreens();
  screens.how.classList.remove('hidden');
});
$('#how-back-button').addEventListener('click', () => {
  sound.sfx('click');
  hideScreens();
  screens.menu.classList.remove('hidden');
});
$('#resume-button').addEventListener('click', () => game.togglePause());
$('#restart-button').addEventListener('click', startGame);
$('#retry-button').addEventListener('click', startGame);
$('#pause-menu-button').addEventListener('click', returnToMenu);
$('#result-menu-button').addEventListener('click', returnToMenu);
pauseButton.addEventListener('click', () => game.togglePause());

function updateSoundButton() {
  $('#sound-button').textContent = sound.muted ? 'MUDO' : 'SOM';
  $('#sound-button').setAttribute('aria-label', sound.muted ? 'Ativar som' : 'Desativar som');
}
function toggleSound() {
  sound.setMuted(!sound.muted);
  try { localStorage.setItem('operacao-dossie.muted', String(sound.muted)); } catch { /* sem persistência */ }
  updateSoundButton();
  if (!sound.muted) sound.sfx('click');
}
$('#sound-button').addEventListener('click', toggleSound);
updateSoundButton();

const keys = new Set();
const touchVector = { x: 0, y: 0 };
function resetInput() {
  keys.clear();
  touchVector.x = 0;
  touchVector.y = 0;
  game.setInput(0, 0);
  $('#joystick-knob').style.transform = 'translate(-50%, -50%)';
}
function updateInput() {
  const keyboardX = Number(keys.has('arrowright') || keys.has('d')) - Number(keys.has('arrowleft') || keys.has('a'));
  const keyboardY = Number(keys.has('arrowdown') || keys.has('s')) - Number(keys.has('arrowup') || keys.has('w'));
  game.setInput(keyboardX + touchVector.x, keyboardY + touchVector.y);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'w', 'a', 's', 'd'].includes(key)) event.preventDefault();
  if (key === 'm' && !event.repeat) { toggleSound(); return; }
  if ((key === 'escape' || key === 'p') && !event.repeat && ['playing', 'paused'].includes(game.state)) { game.togglePause(); return; }
  if (key === ' ' && !event.repeat) game.triggerDash();
  if (key === 'e' && !event.repeat) game.triggerDecoy();
  if (key === 'enter' && !event.repeat && !screens.menu.classList.contains('hidden')) openCharacterSelection();
  keys.add(key);
  updateInput();
});
window.addEventListener('keyup', (event) => {
  keys.delete(event.key.toLowerCase());
  updateInput();
});
window.addEventListener('blur', resetInput);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && game.state === 'playing') game.togglePause();
});

const joystickZone = $('#joystick-zone');
const joystickBase = $('#joystick-base');
const joystickKnob = $('#joystick-knob');
let joystickPointer = null;
let joystickOrigin = { x: 0, y: 0 };

function moveJoystick(event) {
  const dx = event.clientX - joystickOrigin.x;
  const dy = event.clientY - joystickOrigin.y;
  const maxDistance = 43;
  const magnitude = Math.hypot(dx, dy);
  const scale = magnitude > maxDistance ? maxDistance / magnitude : 1;
  const x = dx * scale;
  const y = dy * scale;
  joystickKnob.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
  touchVector.x = x / maxDistance;
  touchVector.y = y / maxDistance;
  updateInput();
}

joystickZone.addEventListener('pointerdown', (event) => {
  if (game.state !== 'playing') return;
  joystickPointer = event.pointerId;
  joystickZone.setPointerCapture(event.pointerId);
  const rect = joystickZone.getBoundingClientRect();
  joystickOrigin = { x: event.clientX, y: event.clientY };
  joystickBase.style.left = `${event.clientX - rect.left}px`;
  joystickBase.style.top = `${event.clientY - rect.top}px`;
  joystickBase.style.bottom = 'auto';
  joystickBase.style.transform = 'translate(-50%, -50%)';
  moveJoystick(event);
});
joystickZone.addEventListener('pointermove', (event) => {
  if (event.pointerId === joystickPointer) moveJoystick(event);
});
function releaseJoystick(event) {
  if (event.pointerId !== joystickPointer) return;
  joystickPointer = null;
  touchVector.x = 0;
  touchVector.y = 0;
  joystickKnob.style.transform = 'translate(-50%, -50%)';
  updateInput();
}
joystickZone.addEventListener('pointerup', releaseJoystick);
joystickZone.addEventListener('pointercancel', releaseJoystick);
$('#touch-dash').addEventListener('pointerdown', (event) => { event.preventDefault(); game.triggerDash(); });
$('#touch-decoy').addEventListener('pointerdown', (event) => { event.preventDefault(); game.triggerDecoy(); });

let previousTime = performance.now();
function frame(now) {
  const dt = Math.min(.05, (now - previousTime) / 1000);
  previousTime = now;
  game.update(dt);
  game.render();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
