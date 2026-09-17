'use strict';
// Seeded color fields + additive luminance/chromatic noise. No external assets.
function rgb(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));}
function random(seed){let a=seed>>>0;return ()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
function anchors(s){if(s.seed===17)return [[.10,.08],[.88,.34],[.03,1.05],[1.18,1.25]];const r=random(s.seed);return [[r()*.4,r()*.4],[.6+r()*.4,r()*.4],[r()*.4,.6+r()*.4],[.6+r()*.4,.6+r()*.4]];}
function baseImage(s,width,height){
 const cv=document.createElement('canvas');cv.width=width;cv.height=height;const ctx=cv.getContext('2d');const img=ctx.createImageData(width,height),p=img.data,cols=s.colors.map(rgb),pts=anchors(s),a=s.angle*Math.PI/180,cs=Math.cos(a),sn=Math.sin(a),spread=.048+s.softness*.0039,phase=(s.seed%100)*.1;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const nx=x/(width-1)-.5,ny=y/(height-1)-.5;let u=nx*cs-ny*sn+.5,v=nx*sn+ny*cs+.5;let out=[0,0,0];
  if(s.mode==='linear'){
   const t=Math.max(0,Math.min(.99999,(u+v)*.5)),idx=Math.floor(t*3),f=t*3-idx,sm=f*f*(3-2*f),mix=f*(s.softness/100)+sm*(1-s.softness/100);
   for(let k=0;k<3;k++)out[k]=cols[idx][k]*(1-mix)+cols[idx+1][k]*mix;
  }else{
   if(s.mode==='flow'){u+=Math.sin(v*5+phase)*.24;v+=Math.cos(u*4-phase)*.18;}
   else{u+=Math.sin(v*4+phase)*.055;v+=Math.sin(u*5+phase)*.045;}
   let total=0;const ws=pts.map((pt,i)=>{const dx=u-pt[0],dy=v-pt[1];const d=dx*dx+dy*dy*(i%2?.85:1.15);const w=Math.exp(-d/spread);total+=w;return w;});
   for(let k=0;k<3;k++)out[k]=ws.reduce((sum,w,i)=>sum+w*cols[i][k],0)/total;
  }
  const i=(y*width+x)*4;for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,(out[k]-127.5)*(1+s.contrast/100)+127.5+s.brightness*2.1));p[i+3]=255;
 }
 ctx.putImageData(img,0,0);return cv;
}
function noiseImage(s,width,height){const cv=document.createElement('canvas');cv.width=width;cv.height=height;const ctx=cv.getContext('2d'),im=ctx.createImageData(width,height),p=im.data,r=random(s.seed+7919),chroma=s.chroma/100;
 for(let i=0;i<p.length;i+=4){const common=(r()+r()+r()-1.5)*85;for(let k=0;k<3;k++)p[i+k]=128+common*(1-chroma)+(r()+r()-1)*105*chroma;p[i+3]=255;}
 ctx.putImageData(im,0,0);return cv;}
function render(target,s,width,height){
 target.width=width;target.height=height;const ctx=target.getContext('2d');ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';const long=Math.max(width,height);const scale=320/long;const base=baseImage(s,Math.max(2,Math.round(width*scale)),Math.max(2,Math.round(height*scale)));ctx.drawImage(base,0,0,width,height);
 if(s.grain>0){const grainCell=(s.size/10)*(long/1800);const nw=Math.max(2,Math.round(width/grainCell)),nh=Math.max(2,Math.round(height/grainCell));const noise=noiseImage(s,nw,nh);const layer=document.createElement('canvas');layer.width=width;layer.height=height;const nc=layer.getContext('2d',{willReadFrequently:true});nc.imageSmoothingEnabled=true;nc.imageSmoothingQuality='high';nc.drawImage(noise,0,0,width,height);const amount=s.grain/100*1.6;
 for(let row=0;row<height;row+=128){const rows=Math.min(128,height-row),pixels=ctx.getImageData(0,row,width,rows),n=nc.getImageData(0,row,width,rows).data,p=pixels.data;for(let i=0;i<p.length;i+=4)for(let k=0;k<3;k++)p[i+k]=Math.max(0,Math.min(255,p[i+k]+(n[i+k]-128)*amount));ctx.putImageData(pixels,0,row);}
 noise.width=1;noise.height=1;layer.width=1;layer.height=1;}
 base.width=1;base.height=1;
}
function dimensions(s){const long=s.resolution;return s.ratio>=1?[long,Math.round(long/s.ratio)]:[Math.round(long*s.ratio),long];}
