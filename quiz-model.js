import {faceInfo} from './practice-cube.js?v=1.1';
// Looking down on yellow: front -> right -> back -> left.
export const cycle=['F','R','B','L'];
export const names={F:'緑',R:'オレンジ',B:'青',L:'赤'};
export const color=face=>faceInfo[face].color;
export function layout(front){const i=cycle.indexOf(front);if(i<0)throw Error('Invalid front');return {left:cycle[(i+3)%4],front,right:cycle[(i+1)%4]};}
export function isCorrect(front,side,answer){return ['left','right'].includes(side)&&layout(front)[side]===answer;}
export function questionDeck(){const deck=cycle.flatMap(front=>['left','right'].map(side=>({front,side})));for(let i=deck.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[deck[i],deck[j]]=[deck[j],deck[i]];}return deck;}
