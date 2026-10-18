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
export async function generateScramble() {
  await init();
  for (let attempt = 0; attempt < 100; attempt++) {
    const alg = await randomScrambleForEvent('333');
    if (await allowedScramble(alg)) return alg.toString();
  }
  throw new Error('スクランブルを生成できませんでした。');
}
