import { randomScrambleForEvent } from './vendor/cubing/scramble/index.js';
import { puzzles } from './vendor/cubing/puzzles/index.js';

let solved, excluded;
async function init() {
  if (excluded) return;
  const puzzle = await puzzles['3x3x3'].kpuzzle();
  solved = puzzle.defaultPattern();
  excluded = [solved];
  for (const face of ['R','L','U','D','F','B']) {
    for (const suffix of ['', "'", '2']) excluded.push(solved.applyAlg(face + suffix));
  }
}
export async function allowedScramble(alg) {
  await init();
  const pattern = solved.applyAlg(alg);
  return !excluded.some(p => p.isIdentical(pattern));
}
// Custom length is a practice random-move sequence, not random-state sampling.
export function generateMoveScramble(count) {
  if (!Number.isInteger(count) || count < 1 || count > 100) throw new RangeError('手数は1〜100の整数です。');
  const axes = [['R','L'], ['U','D'], ['F','B']];
  const suffixes = ['', "'", '2'];
  const pick = n => {
    const values = new Uint32Array(1), limit = Math.floor(4294967296 / n) * n;
    do { crypto.getRandomValues(values); } while (values[0] >= limit);
    return values[0] % n;
  };
  let previous = -1;
  const moves = [];
  for (let i = 0; i < count; i++) {
    const choices = [0,1,2].filter(axis => axis !== previous);
    const axis = choices[pick(choices.length)];
    moves.push(axes[axis][pick(2)] + suffixes[pick(3)]);
    previous = axis;
  }
  return moves.join(' ');
}
export async function generateScramble(count = null) {
  if (count !== null) return generateMoveScramble(count);
  await init();
  for (let attempt = 0; attempt < 100; attempt++) {
    const alg = await randomScrambleForEvent('333');
    if (await allowedScramble(alg)) return alg.toString();
  }
  throw new Error('スクランブルを生成できませんでした。');
}
