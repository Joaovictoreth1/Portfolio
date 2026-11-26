import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createReplay } from './terminal-replay.mjs';

function harness() {
    const outputs = [];
    const callbacks = new Map();
    let key = 0;
    const replay = createReplay('Olá 🧑 — código', {
        show: text => outputs.push(text),
        complete: () => outputs.push('finished'),
        schedule: callback => {
            callbacks.set(++key, callback);
            return key;
        },
        cancel: id => callbacks.delete(id),
    });
    return {
        replay, outputs, callbacks,
        finish() {
            for (const [id, callback] of callbacks) {
                callbacks.delete(id);
                callback();
            }
        },
    };
}

test('replays whole Unicode characters and stops after completion', () => {
    const { replay, outputs, finish } = harness();
    replay.start();
    replay.start();
    assert.deepEqual(outputs, ['Olá 🧑']);
    finish();
    assert.equal(outputs.at(-1), 'finished');
    assert.equal(replay.active, false);
});

test('lets the reader skip the animation and replay from the start later', () => {
    const { replay, callbacks, outputs, finish } = harness();
    replay.start();
    replay.stop();
    assert.equal(callbacks.size, 0);
    assert.deepEqual(outputs, ['Olá 🧑', 'finished']);
    replay.start();
    assert.equal(outputs.at(-1), 'Olá 🧑');
    finish();
    assert.equal(replay.active, false);
});
