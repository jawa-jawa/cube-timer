import {faceInfo} from './practice-cube.js?v=1.1';
// Looking down on yellow: front -> right -> back -> left.
export const cycle=['F','R','B','L'];
export const names={F:'緑',R:'オレンジ',B:'青',L:'赤'};
export const color=face=>faceInfo[face].color;
export function layout(front){const i=cycle.indexOf(front);if(i<0)throw Error('Invalid front');return {left:cycle[(i+3)%4],front,right:cycle[(i+1)%4]};}
export function isCorrect(front,left,right){const expected=layout(front);return left===expected.left&&right===expected.right;}
export function newRound(previous){const remaining=cycle.filter(f=>f!==previous);return remaining[Math.floor(Math.random()*remaining.length)];}
