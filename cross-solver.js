// White cross, viewed with yellow=U, green=F, and white=D.
// A state tracks where the white-colored sticker of each of DF, DR, DB, DL is.
// 24 possibilities per sticker (12 physical edge positions x 2 face orientations).
// Reverse BFS guarantees the minimum number of face turns (HTM: R2 = 1 turn).
const FACES = ['U','D','F','B','R','L'];
const NORMAL = {U:[0,1,0], D:[0,-1,0], F:[0,0,1], B:[0,0,-1], R:[1,0,0], L:[-1,0,0]};
const EDGES = [
  ['U','F'],['U','R'],['U','B'],['U','L'],
  ['D','F'],['D','R'],['D','B'],['D','L'],
  ['F','R'],['F','L'],['B','R'],['B','L']
];
const coords = [], locations = new Map();
for (const edge of EDGES) {
  const p = [0,1,2].map(i=>NORMAL[edge[0]][i]+NORMAL[edge[1]][i]);
  for (const side of edge) {
    const n = NORMAL[side];
    const idx = coords.length;
    coords.push({p,n,edge:edge.join('')});
    locations.set([...p,...n].join(','),idx);
  }
}
const STRIDES = [1,24,576,13824];
const SOLVED = [8,10,12,14].reduce((sum,position,i)=>sum+position*STRIDES[i],0);
const STATES = 24*24*24*24;
const MOVE_NAMES=[];
const STEP_MAP=[];
const inverseIndex=[];
const AXES = {U:1,D:1,F:2,B:2,R:0,L:0};
const SIGNS = {U:1,D:-1,F:1,B:-1,R:1,L:-1};
function rot(v,axis,sign) {
  const [x,y,z]=v;
  // +90 degrees about a positive axis is right-handed. Clockwise looking
  // at an outward-pointing face is -90 about its outward normal.
  if(axis===0)return sign===1?[x,-z,y]:[x,z,-y];
  if(axis===1)return sign===1?[z,y,-x]:[-z,y,x];
  return sign===1?[-y,x,z]:[y,-x,z];
}
for(const face of FACES) {
  const axis=AXES[face],side=SIGNS[face];
  const clockwise = coords.map(({p,n},i)=>{
    if(p[axis]!==side)return i;
    const newP=rot(p,axis,-side),newN=rot(n,axis,-side);
    const result=locations.get([...newP,...newN].join(','));
    if(result===undefined)throw Error('無効なキューブの回転データ');
    return result;
  });
  for(const suffix of ['',"'",'2']) {
    const times=suffix==='2'?2:suffix==="'"?3:1;
    const mapping=Array.from({length:24},(_,i)=>{
      for(let step=0;step<times;step++)i=clockwise[i];
      return i;
    });
    MOVE_NAMES.push(face+suffix);
    STEP_MAP.push(mapping);
  }
}
for(let i=0;i<MOVE_NAMES.length;i++){
  const name=MOVE_NAMES[i];
  inverseIndex.push(MOVE_NAMES.indexOf(name.endsWith('2')?name:name.endsWith("'")?name[0]:name+"'"));
}
function nextState(state,map) {
  return map[state%24]
    +24*map[Math.floor(state/24)%24]
    +576*map[Math.floor(state/576)%24]
    +13824*map[Math.floor(state/13824)%24];
}
let parents=null, parentMoves=null;
function buildLookup() {
  if(parents)return;
  const parent=new Int32Array(STATES);parent.fill(-1);
  const via=new Int8Array(STATES); // move number from parent to child
  const queue=new Int32Array(190080);
  parent[SOLVED]=SOLVED;queue[0]=SOLVED;
  let head=0,tail=1;
  while(head<tail){
    const state=queue[head++];
    for(let move=0;move<18;move++){
      const next=nextState(state,STEP_MAP[move]);
      if(parent[next]!==-1)continue;
      parent[next]=state;
      via[next]=move;
      queue[tail++]=next;
    }
  }
  if(tail!==190080)throw Error('白十字の探索データを生成できませんでした。'+tail);
  parents=parent;parentMoves=via;
}
function parse(scramble){
  if(typeof scramble!=='string'||!scramble.trim())throw Error('スクランブル手順がありません。');
  const tokens=scramble.trim().replace(/\u2019|\u2032/g,"'").split(/\s+/);
  if(tokens.some(token=>!MOVE_NAMES.includes(token)))throw Error('対応していない回転記号が含まれています。');
  return tokens;
}
export function solveWhiteCross(scramble){
  const tokens=parse(scramble);
  let state=SOLVED;
  for(const token of tokens)state=nextState(state,STEP_MAP[MOVE_NAMES.indexOf(token)]);
  buildLookup();
  const moves=[];
  while(state!==SOLVED){
    const last=parentMoves[state];
    moves.push(MOVE_NAMES[inverseIndex[last]]);
    state=parents[state];
    if(state<0)throw Error('白十字の計算に失敗しました。');
  }
  return {moves,steps:moves.length,notation:moves.length?moves.join(' '):'完成しています'};
}
// Exposed for independent validation, not needed by the application UI.
export const _crossValidation={EDGES,coords,STEP_MAP,MOVE_NAMES,SOLVED,nextState};
