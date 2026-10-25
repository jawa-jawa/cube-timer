// Sticker geometry: yellow U, white D, green F, blue B, orange R, red L.
export const faceInfo={
 U:{name:'上 U',color:'#f4d83b',letter:'黄',n:[0,1,0],right:[1,0,0],down:[0,0,1]},
 L:{name:'左 L',color:'#df4b49',letter:'赤',n:[-1,0,0],right:[0,0,1],down:[0,-1,0]},
 F:{name:'前 F',color:'#32ac70',letter:'緑',n:[0,0,1],right:[1,0,0],down:[0,-1,0]},
 R:{name:'右 R',color:'#f49136',letter:'橙',n:[1,0,0],right:[0,0,-1],down:[0,-1,0]},
 B:{name:'後 B',color:'#4489e0',letter:'青',n:[0,0,-1],right:[-1,0,0],down:[0,-1,0]},
 D:{name:'下 D',color:'#f4f5f7',letter:'白',n:[0,-1,0],right:[1,0,0],down:[0,0,-1]}
};
export function tokens(alg){
 const parts=alg.trim()?alg.trim().split(/\s+/):[];
 if(parts.some(m=>!/^[UDLRFB]['2]?$/.test(m)))throw Error('対応していない手順です');
 return parts;
}
export function inverse(alg){return tokens(alg).reverse().map(m=>m.endsWith('2')?m:m.endsWith("'")?m[0]:m+"'").join(' ')}
function rotate(v,a,s){const [x,y,z]=v;return a===0?(s===1?[x,-z,y]:[x,z,-y]):a===1?(s===1?[z,y,-x]:[-z,y,x]):s===1?[-y,x,z]:[y,-x,z]}
export function stickersAfter(alg){
 const stickers=[];
 for(const [face,f] of Object.entries(faceInfo))for(let row=0;row<3;row++)for(let col=0;col<3;col++){
  stickers.push({face,n:[...f.n],p:f.n.map((n,i)=>n+(col-1)*f.right[i]+(row-1)*f.down[i])});
 }
 for(const move of tokens(alg)){
  const normal=faceInfo[move[0]].n,a=normal.findIndex(x=>x!==0),side=normal[a];
  const turns=move.endsWith('2')?2:move.endsWith("'")?3:1;
  for(const s of stickers)if(s.p[a]===side)for(let k=0;k<turns;k++){s.p=rotate(s.p,a,-side);s.n=rotate(s.n,a,-side)}
 }
 return stickers;
}
export function faceGrid(alg){
 const stickers=stickersAfter(alg),result={};
 for(const [face,f] of Object.entries(faceInfo)){
  const grid=Array(9);
  for(const s of stickers)if(s.n.every((n,i)=>n===f.n[i])){
   const dot=v=>s.p.reduce((sum,p,i)=>sum+p*v[i],0);
   grid[(dot(f.down)+1)*3+dot(f.right)+1]=s.face;
  }
  result[face]=grid;
 }
 return result;
}
