import {generateMoveScramble} from './scrambler.js';
import {solveWhiteCross} from './cross-solver.js';
export function matchesDifficulty(steps,difficulty){
 return difficulty===6?steps>=6:steps===difficulty;
}
export async function generateCrossProblem(count,difficulty){
 if(![3,4,5,6].includes(difficulty))throw Error('難易度を選んでください。');
 if(!Number.isInteger(count)||count<difficulty||count>100)throw Error('この難易度では混ぜる手数を'+difficulty+'〜100手にしてください。');
 // Check exact cross distance using the exhaustive reverse BFS solver.
 // The four cross edges start solved; other pieces do not affect this distance.
 for(let attempt=0;attempt<20000;attempt++){
  if(attempt%100===0)await new Promise(resolve=>setTimeout(resolve,0));
  const scramble=generateMoveScramble(count),cross=solveWhiteCross(scramble);
  if(matchesDifficulty(cross.steps,difficulty))return {scramble,cross};
 }
 throw Error('条件に合う問題を生成できませんでした。再試行するか混ぜる手数を変更してください。');
}
