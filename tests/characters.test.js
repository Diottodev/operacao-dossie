import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS, DEFAULT_CHARACTER } from '../src/characters.js';

test('elenco contém os seis personagens jogáveis com identidades únicas', () => {
  assert.equal(CHARACTERS.length, 6);
  assert.equal(new Set(CHARACTERS.map((character) => character.id)).size, 6);
  for (const id of ['flavio', 'jair', 'eduardo', 'carlos', 'michelle', 'pavanato']) {
    assert.ok(CHARACTERS.some((character) => character.id === id));
  }
  assert.equal(DEFAULT_CHARACTER.id, 'flavio');
});

test('todos os personagens têm arte e atributos válidos', () => {
  for (const character of CHARACTERS) {
    assert.ok(character.name.length > 0);
    assert.ok(character.perk.length > 0);
    assert.match(character.skin, /^#[0-9a-f]{6}$/i);
    assert.match(character.suit, /^#[0-9a-f]{6}$/i);
    assert.ok(character.speed > 0);
    assert.ok(character.stealth > 0);
    assert.ok(character.dashCooldown > 0);
    assert.ok(character.decoyCooldown > 0);
    assert.ok(character.dashDuration > 0);
    assert.ok(Number.isInteger(character.livesBonus));
  }
});

test('vantagens especiais alteram os atributos esperados', () => {
  assert.equal(CHARACTERS.find((character) => character.id === 'flavio').livesBonus, 1);
  assert.ok(CHARACTERS.find((character) => character.id === 'jair').speed > 1);
  assert.ok(CHARACTERS.find((character) => character.id === 'eduardo').stealth < 1);
  assert.ok(CHARACTERS.find((character) => character.id === 'carlos').decoyCooldown < 1);
  assert.ok(CHARACTERS.find((character) => character.id === 'pavanato').dashCooldown < 1);
});
