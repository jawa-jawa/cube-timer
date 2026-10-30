import {generateCrossProblem} from './cross-problems.js';
import {solveWhiteCross} from './cross-solver.js';
import {faceGrid,faceInfo,tokens} from './practice-cube.js?v=1.1';
import {setupCubeViewer} from './cube-viewer.js';
const $=id=>document.getElementById(id);
const KEY='cube-time.cross-practice-count.v1';
let busy=false,current=null;
const DIFFICULTY_KEY='cube-time.cross-difficulty.v1';
try{const d=Number(localStorage.getItem(DIFFICULTY_KEY));if([3,4,5,6].includes(d))$('difficulty').value=String(d)}catch{}
const viewer=setupCubeViewer($('cubeStage'),$('cube'),$('cubeReset'),$('cubeBottom'));
try{const n=Number(localStorage.getItem(KEY));if(Number.isInteger(n)&&n>=1&&n<=100){$('mode').value='custom';$('count').value=n}}catch{}
function syncMode(){
 const minimum=Number($('difficulty').value);
 $('countLabel').hidden=$('mode').value==='standard';$('count').disabled=$('mode').value==='standard';
 $('count').min=String(minimum);
}
$('difficulty').onchange=()=>{if(Number($('count').value)<Number($('difficulty').value))$('count').value=$('difficulty').value;syncMode()};
if(Number($('count').value)<Number($('difficulty').value))$('count').value=$('difficulty').value;
syncMode();$('mode').onchange=syncMode;
function draw(alg){
 const grid=faceGrid(alg,true),net=$('cube');net.replaceChildren();
 for(const [face,f] of Object.entries(faceInfo)){
  const box=document.createElement('div');box.className='face face-'+face;
  box.setAttribute('aria-label',f.name);
  const tiles=document.createElement('div');tiles.className='tiles';
  grid[face].forEach((color,i)=>{const tile=document.createElement('span');tile.className='tile';if(color){tile.style.background=faceInfo[color].color;tile.setAttribute('aria-label',f.name+' '+(Math.floor(i/3)+1)+'行'+(i%3+1)+'列 '+faceInfo[color].letter)}else{tile.className+=' tile-masked';tile.setAttribute('aria-hidden','true')}tiles.append(tile)});
  box.append(tiles);net.append(box);
 }
 viewer.reset();
}
async function generate(e,restart=false){
 e?.preventDefault();if(busy)return;
 const difficulty=Number($('difficulty').value),count=$('mode').value==='standard'?20:Number($('count').value);
 if(!Number.isInteger(count)||count<difficulty||count>100){$('error').textContent='この難易度では混ぜる手数を'+difficulty+'〜100手にしてください。';return}
 if(restart&&!confirm('実物を6面完成状態に戻してから始めてください。新しく問題を作りますか？'))return;
 const base=restart||!current?'':current.afterCross;
 busy=true;
 for(const id of ['generate','mode','count','difficulty','restartPractice'])$(id).disabled=true;
 $('error').textContent='';$('status').textContent='選んだ難易度の問題を生成しています…';
 try{
  const {scramble,cross}=await generateCrossProblem(count,difficulty);
  const mixed=[base,scramble].filter(Boolean).join(' ');
  const afterCross=[mixed,...cross.moves].join(' ');
  // Cross state must remain solved at every question boundary.
  if(solveWhiteCross(afterCross).steps!==0)throw Error('白十字の状態を確認できませんでした。');
  current={mixed,afterCross};
  $('scramble').textContent=scramble;$('scrambleSteps').textContent=tokens(scramble).length+'手 ／ 難易度：最短'+cross.steps+'手';
  $('cross').textContent=cross.notation;$('crossSteps').textContent=cross.steps+'手';
  draw(mixed);$('results').hidden=false;
  $('generate').textContent='白十字をそろえて次の問題';
  $('status').textContent=(base?'前の問題の②で白十字をそろえた状態':'白十字がそろった状態')+'から、今回の①を実行してください。';
  try{localStorage.setItem(KEY,String($('mode').value==='standard'?0:count));localStorage.setItem(DIFFICULTY_KEY,String(difficulty))}catch{$('status').textContent+=' 設定は保存できませんでした。'}
 }catch(error){$('error').textContent=error.message||'問題を生成できませんでした。';$('status').textContent='現在の問題を残しています。条件を確認して再試行してください。'}
 finally{busy=false;for(const id of ['generate','mode','count','difficulty','restartPractice'])$(id).disabled=false;syncMode()}
}
$('generateForm').onsubmit=generate;
$('restartPractice').onclick=e=>generate(e,true);
generate();
