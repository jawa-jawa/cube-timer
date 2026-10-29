// View-only rotation. Sticker state is never modified.
export function setupCubeViewer(stage,cube,resetButton,bottomButton){
 let pitch=-25,yaw=-35,drag=null;
 const paint=()=>{cube.style.transform='rotateX('+pitch+'deg) rotateY('+yaw+'deg)'};
 const release=()=>{
  if(!drag)return;
  const id=drag.id;drag=null;stage.classList.remove('dragging');
  if(stage.hasPointerCapture(id))stage.releasePointerCapture(id);
 };
 const reset=()=>{release();pitch=-25;yaw=-35;paint()};
 stage.addEventListener('pointerdown',e=>{
  if(drag||!e.isPrimary||(e.pointerType==='mouse'&&e.button!==0))return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY};
  stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');
  stage.focus({preventScroll:true});e.preventDefault();
 });
 stage.addEventListener('pointermove',e=>{
  if(!drag||drag.id!==e.pointerId)return;
  yaw=(yaw+(e.clientX-drag.x)*0.55)%360;
  pitch=(pitch-(e.clientY-drag.y)*0.55)%360;
  drag.x=e.clientX;drag.y=e.clientY;paint();e.preventDefault();
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture']){
  stage.addEventListener(type,e=>{if(drag?.id===e.pointerId)release()});
 }
 stage.addEventListener('keydown',e=>{
  const moves={ArrowLeft:[0,-15],ArrowRight:[0,15],ArrowUp:[15,0],ArrowDown:[-15,0]};
  if(e.key==='Home'){e.preventDefault();reset();return}
  if(!moves[e.key])return;
  e.preventDefault();const [x,y]=moves[e.key];pitch=(pitch+x)%360;yaw=(yaw+y)%360;paint();
 });
 resetButton.onclick=reset;
 bottomButton.onclick=()=>{release();pitch=90;yaw=0;paint()};
 paint();
 return {reset};
}
