import {generateScramble} from './scrambler.js';
import {solveWhiteCross} from './cross-solver.js';
import {faceGrid,faceInfo,inverse,tokens} from './practice-cube.js';
import {setupCubeViewer} from './cube-viewer.js';
const $=id=>document.getElementById(id);
const KEY='cube-time.cross-practice-count.v1';
let busy=false,request=0;
const viewer=setupCubeViewer($('cubeStage'),$('cube'),$('cubeReset'),$('cubeBottom'));
try{const n=Number(localStorage.getItem(KEY));if(Number.isInteger(n)&&n>=1&&n<=100){$('mode').value='custom';$('count').value=n}}catch{}
function syncMode(){$('countLabel').hidden=$('mode').value==='standard';$('count').disabled=$('mode').value==='standard'}
syncMode();$('mode').onchange=syncMode;
function draw(alg){
 const grid=faceGrid(alg),net=$('cube');net.replaceChildren();
 for(const [face,f] of Object.entries(faceInfo)){
  const box=document.createElement('div');box.className='face face-'+face;
  box.setAttribute('aria-label',f.name);
  const tiles=document.createElement('div');tiles.className='tiles';
  grid[face].forEach((color,i)=>{const tile=document.createElement('span');tile.className='tile';tile.style.background=faceInfo[color].color;tile.textContent=faceInfo[color].letter;tile.setAttribute('aria-label',f.name+' '+(Math.floor(i/3)+1)+'行'+(i%3+1)+'列 '+faceInfo[color].letter);tiles.append(tile)});
  box.append(tiles);net.append(box);
 }
 viewer.reset();
}
async function generate(e){
 e?.preventDefault();if(busy)return;
 const count=$('mode').value==='standard'?null:Number($('count').value);
 if(count!==null&&(!Number.isInteger(count)||count<1||count>100)){$('error').textContent='手数は1〜100の整数で入力してください。';return}
 busy=true;const id=++request;
 $('generate').disabled=true;$('mode').disabled=true;$('count').disabled=true;
 $('results').hidden=true;$('error').textContent='';$('status').textContent='手順と白十字の最短解を準備しています…';
 let timeout;
 try{
  const scramble=await Promise.race([generateScramble(count),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(Error('生成が時間内に完了しませんでした。再試行してください。')),45000)})]);
  await new Promise(resolve=>setTimeout(resolve,0));
  if(id!==request)return;
  const cross=solveWhiteCross(scramble);
  $('scramble').textContent=scramble;$('scrambleSteps').textContent=tokens(scramble).length+'手';
  $('cross').textContent=cross.notation;$('crossSteps').textContent=cross.steps+'手';
  $('undoScramble').textContent=inverse(scramble);
  $('undoCross').textContent=inverse([scramble,...cross.moves].join(' '))||'すでに完成しています';
  draw(scramble);$('results').hidden=false;
  $('status').textContent='完成状態から①を実行してください。';
  try{localStorage.setItem(KEY,String(count??0))}catch{$('status').textContent+=' 手数設定は保存できませんでした。'}
 }catch(error){$('error').textContent=error.message||'手順を生成できませんでした。';$('status').textContent='再試行してください。'}
 finally{clearTimeout(timeout);busy=false;$('generate').disabled=false;$('mode').disabled=false;syncMode()}
}
$('generateForm').onsubmit=generate;
generate();
