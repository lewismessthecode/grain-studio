'use strict';
const $=id=>document.getElementById(id);
const initial=()=>({colors:[...palettes[0].colors],preset:0,mode:'mist',grain:38,size:18,softness:40,angle:0,brightness:0,chroma:45,contrast:8,seed:17,ratio:1.6,resolution:5120});
let state=initial(),frame=0,exporting=false,lastRemix=null,statusKey='ready',statusValues={};
const colorElements=[],rangeKeys=['grain','size','softness','angle','brightness','chroma','contrast'];
const ratioNames={'1.6':'16:10','1.7777777778':'16:9','2.3333333333':'21:9','0.4615384615':'6:13','1':'1:1'};
function setStatus(key,values={}){statusKey=key;statusValues=values;$('status').textContent=t(key,values);}
function localize(){
 document.documentElement.lang=language==='zh'?'zh-CN':'en';document.title=t('title');document.querySelector('meta[name=description]').content=t('description');
 document.querySelectorAll('[data-i18n]').forEach(el=>el.textContent=t(el.dataset.i18n));
 document.querySelectorAll('[data-lang]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.lang===language));
 document.querySelectorAll('.palette').forEach((b,i)=>{b.setAttribute('aria-label',paletteName(i));b.querySelector('.name').textContent=paletteName(i);});
 colorElements.forEach((e,i)=>{e.color.setAttribute('aria-label',t('color',{n:i+1}));e.hex.setAttribute('aria-label',t('hex',{n:i+1}));});
 $('undo').setAttribute('aria-label',t('undo'));$('undo').title=t('undo');$('preview').setAttribute('aria-label',t('preview'));document.querySelector('.work-surface').setAttribute('aria-label',t('preview'));document.querySelector('.segmented').setAttribute('aria-label',t('styles'));
 $('downloadText').textContent=t(exporting?'downloading':'download');setStatus(statusKey,statusValues);refresh();
}
function refresh(){
 $('currentName').textContent=paletteName(state.preset);const [w,h]=dimensions(state);$('dimensions').textContent=`${w} × ${h} · PNG`;$('canvasRatio').textContent=ratioNames[String(state.ratio)];
 const wrap=$('canvasWrap');wrap.style.aspectRatio=state.ratio;wrap.style.width=state.ratio<1?`${Math.round(460*state.ratio)}px`:'100%';
 for(const key of rangeKeys){const input=$(key);input.value=state[key];input.style.setProperty('--fill',`${(state[key]-Number(input.min))/(Number(input.max)-Number(input.min))*100}%`);$(key+'Value').textContent=key==='size'?(state[key]/10).toFixed(1):key==='angle'?state[key]+'°':['brightness','contrast'].includes(key)?(state[key]>0?'+':'')+state[key]:state[key]+'%';}
 $('ratio').value=state.ratio;$('resolution').value=state.resolution;$('undo').disabled=lastRemix===null;
 document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.mode===state.mode));document.querySelectorAll('.palette').forEach((b,i)=>b.setAttribute('aria-pressed',i===state.preset));
 colorElements.forEach((e,i)=>{e.color.value=state.colors[i];if(document.activeElement!==e.hex)e.hex.value=state.colors[i].toUpperCase();});
 cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const width=Math.max(180,Math.min(1400,Math.round(wrap.clientWidth*Math.min(window.devicePixelRatio||1,2))));render($('preview'),state,width,Math.round(width/state.ratio));});
}
function setPreset(i){state.colors=[...palettes[i].colors];state.preset=i;refresh();}
function applyColor(i,value){if(!/^#[0-9a-f]{6}$/i.test(value))return false;state.colors[i]=value;state.preset=-1;refresh();return true;}
function remix(){lastRemix={seed:state.seed,angle:state.angle};let next;do{next=Math.floor(Math.random()*100000)+1;}while(next===state.seed);state.seed=next;if(state.mode==='linear')state.angle=(state.angle+45+Math.floor(Math.random()*180))%360;refresh();const button=$('shuffle');button.classList.remove('rolling');void button.offsetWidth;button.classList.add('rolling');if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches&&$('preview').animate)$('preview').animate([{opacity:.65},{opacity:1}],{duration:380,easing:'ease-out'});}
palettes.forEach((p,i)=>{const b=document.createElement('button');b.className='palette';b.type='button';const cv=document.createElement('canvas');cv.className='swatch';cv.setAttribute('aria-hidden','true');render(cv,{...initial(),colors:p.colors},180,100);const label=document.createElement('span');label.className='name';b.append(cv,label);b.addEventListener('click',()=>setPreset(i));$('palettes').append(b);});
state.colors.forEach((v,i)=>{const div=document.createElement('div');div.className='color-item';const color=document.createElement('input');color.type='color';color.value=v;const hex=document.createElement('input');hex.className='hex';hex.value=v.toUpperCase();hex.maxLength=7;hex.spellcheck=false;color.addEventListener('input',()=>applyColor(i,color.value));hex.addEventListener('change',()=>{if(!applyColor(i,hex.value.trim())){hex.value=state.colors[i].toUpperCase();setStatus('invalidColor');}});div.append(color,hex);$('colors').append(div);colorElements.push({color,hex});});
for(const key of rangeKeys)$(key).addEventListener('input',()=>{state[key]=Number($(key).value);refresh();});
document.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{state.mode=b.dataset.mode;refresh();}));
for(const key of ['ratio','resolution'])$(key).addEventListener('change',()=>{state[key]=Number($(key).value);refresh();});
document.querySelectorAll('[data-lang]').forEach(b=>b.addEventListener('click',()=>{language=b.dataset.lang;try{localStorage.setItem('grain-language',language);}catch{}localize();}));
$('shuffle').addEventListener('click',remix);$('shuffle').addEventListener('animationend',()=>$('shuffle').classList.remove('rolling'));
$('undo').addEventListener('click',()=>{if(!lastRemix)return;state.seed=lastRemix.seed;state.angle=lastRemix.angle;lastRemix=null;refresh();});
$('reset').addEventListener('click',()=>{state=initial();lastRemix=null;setStatus('ready');refresh();});
document.addEventListener('keydown',event=>{if(event.code==='Space'&&!event.repeat&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&!event.shiftKey&&(event.target===document.body||event.target===document.documentElement)){event.preventDefault();remix();}});
$('download').addEventListener('click',async()=>{
 if(exporting)return;exporting=true;const button=$('download'),snapshot=structuredClone(state),filename=snapshot.preset<0?'Custom':palettes[snapshot.preset].name.replace(/ /g,'-');button.disabled=true;button.classList.add('busy');$('downloadText').textContent=t('downloading');setStatus('generating');let cv;
 try{await new Promise(resolve=>setTimeout(resolve,70));const [w,h]=dimensions(snapshot);cv=document.createElement('canvas');render(cv,snapshot,w,h);setStatus('encoding');const blob=await new Promise((resolve,reject)=>cv.toBlob(b=>b?resolve(b):reject(Error('PNG encoding failed')),'image/png'));const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`Grain-${filename}-${w}x${h}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);setStatus('done',{w,h});}catch(error){setStatus('error');console.error(error);}finally{if(cv){cv.width=1;cv.height=1;}exporting=false;button.disabled=false;button.classList.remove('busy');$('downloadText').textContent=t('download');}
});
new ResizeObserver(()=>refresh()).observe($('canvasWrap'));localize();
const context=document.modelContext;
if(context?.registerTool){const lifetime=new AbortController();try{Promise.resolve(context.registerTool({name:'configure_wallpaper',title:'Configure wallpaper',description:'Choose a palette and grain intensity. Updates the preview without downloading a file.',inputSchema:{type:'object',properties:{palette:{type:'string',enum:palettes.map(p=>p.name)},grain:{type:'number',minimum:0,maximum:100}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},async execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['palette','grain'].includes(k)))throw Error('Invalid input');const idx=input.palette===undefined?-1:palettes.findIndex(p=>p.name===input.palette);if(input.palette!==undefined&&idx<0)throw Error('Unknown palette');if(input.grain!==undefined&&(typeof input.grain!=='number'||!Number.isFinite(input.grain)||input.grain<0||input.grain>100))throw Error('Invalid grain');if(idx>=0){state.colors=[...palettes[idx].colors];state.preset=idx;}if(input.grain!==undefined)state.grain=input.grain;refresh();await new Promise(requestAnimationFrame);return {palette:state.preset<0?'Custom':palettes[state.preset].name,grain:state.grain};}},{signal:lifetime.signal})).catch(()=>{});}catch{}window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});}
