export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function random(seed){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296;};}
export function outline(kind='circle') {const n=kind==='square'?4:kind==='star'?10:48;return Array.from({length:n},(_,i)=>{const a=i/n*Math.PI*2-Math.PI/2+(kind==='square'?Math.PI/4:0);const r=kind==='star'?(i%2?0.48:1):kind==='wild'?0.74+0.22*Math.sin(i*0.8)+0.12*Math.cos(i*1.3):1;return {x:Math.cos(a)*r,y:Math.sin(a)*r};});}
export function createDesign(kind='circle'){return {id:globalThis.crypto?.randomUUID?.()||String(Date.now()),name:'はじめの一枚',thickness:4,size:0.8,kind,points:outline(kind),front:{color:'#e34b32',pattern:0,strokes:[]},back:{color:'#215954',pattern:2,strokes:[]}};}
export function polygonArea(points){return Math.abs(points.reduce((a,p,i)=>{const q=points[(i+1)%points.length];return a+p.x*q.y-q.x*p.y;},0)/2);}
function cross(a,b,c){return(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
export function sanitizeOutline(raw){let p=raw.filter(v=>Number.isFinite(v.x)&&Number.isFinite(v.y)).filter((v,i,a)=>!i||Math.hypot(v.x-a[i-1].x,v.y-a[i-1].y)>.025).filter((_,i,a)=>i%Math.max(1,Math.ceil(a.length/100))===0).map(v=>({x:clamp(v.x,-1.15,1.15),y:clamp(v.y,-1.15,1.15)}));if(p.length<3||polygonArea(p)<.15)return {points:outline(),corrected:true,message:'小さすぎる形を、丸に整えました'};for(let i=0;i<p.length;i++)for(let j=i+2;j<p.length;j++){if(i===0&&j===p.length-1)continue;const a=p[i],b=p[(i+1)%p.length],c=p[j],d=p[(j+1)%p.length];if(cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0)return {points:outline(),corrected:true,message:'交差する線を、丸に整えました'};}const xs=p.map(v=>v.x),ys=p.map(v=>v.y);if(Math.min(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys))<.18)return{points:outline(),corrected:true,message:'細すぎる形を、丸に整えました'};return {points:p,corrected:false};}
export function stats(d){const area=polygonArea(d.points)*d.size*d.size/Math.PI;const radii=d.points.map(p=>Math.hypot(p.x,p.y));const avg=radii.reduce((a,b)=>a+b,0)/radii.length;const variance=radii.reduce((a,b)=>a+(b-avg)**2,0)/radii.length;const cx=d.points.reduce((a,p)=>a+p.x,0)/d.points.length,cy=d.points.reduce((a,p)=>a+p.y,0)/d.points.length;const wild=clamp(Math.sqrt(variance)*2.8+Math.hypot(cx,cy),0,1);return {area,hit:clamp(24+d.thickness*6+(1-d.size)*38,0,100),wind:clamp(25+area*77-d.thickness*4,10,100),precision:clamp(106-d.size*20-wild*45,10,100),chain:clamp(25+wild*65+(10-d.thickness)*2,10,100),wild};}
export const fields=[{name:'ひだまり広場',hint:'風が広がる、やわらかな紙',type:'breeze',color:'#dcba75'},{name:'石畳の路地',hint:'厚い一撃で、かたい紙を返せ',type:'heavy',color:'#b6b5a4'},{name:'すき間の庭',hint:'小さな一枚で、すき間を狙え',type:'precision',color:'#b9c4a3'},{name:'ぐるぐる横丁',hint:'いびつな形で、回転をつなげ',type:'chaos',color:'#c8b5a0'}];
export function affinity(d,type){const s=stats(d);return type==='breeze'?s.wind/80:type==='heavy'?s.hit/85:type==='precision'?(1.35-d.size)*1.3+s.precision/240:0.4+s.chain/85;}
export const MAX_WAVES = 5;
export function freshBoardSeed(){const bytes=new Uint32Array(1);if(globalThis.crypto?.getRandomValues){globalThis.crypto.getRandomValues(bytes);return bytes[0];}return Math.floor(Math.random()*4294967296);}
export function makeBoard(wave=1,fieldIndex=0,seed=freshBoardSeed()){
 wave=clamp(Number.isFinite(wave)?Math.trunc(wave):1,1,MAX_WAVES);
 const rng=random(seed),total=Math.max(48,Math.round((55+wave*35)*Math.pow(1.55,wave-1)*(.65-Math.log(Math.max(Number.EPSILON,1-rng()))*.75))),n=Math.min(total,176);
 // Unequal islands and open ground: the best landing point comes from the layout.
 const hubs=[];for(let i=0;i<2+Math.floor(rng()*3);i++){
  let hub;for(let attempt=0;attempt<40;attempt++){
   hub={x:.14+rng()*.72,y:.32+rng()*.48,spread:.065+rng()*.075};
   if(hubs.every(h=>Math.hypot(h.x-hub.x,(h.y-hub.y)*1.35)>.25))break;
  }hubs.push(hub);
 }
 const cards=Array.from({length:n},(_,i)=>{
  const hub=hubs[rng()<.6?0:1+Math.floor(rng()*(hubs.length-1))],a=rng()*Math.PI*2,r=Math.sqrt(rng())*hub.spread;
  const scattered=rng()<.12;
  return{id:i,x:scattered?.09+rng()*.82:clamp(hub.x+Math.cos(a)*r,.07,.93),y:scattered?.28+rng()*.56:clamp(hub.y+Math.sin(a)*r*.75,.27,.87),angle:rng()*Math.PI*2,color:i%5,weight:Math.floor(total/n)+(i<total%n?1:0),resistance:.52+rng()*.42,flipped:false};
 });
 return{wave,fieldIndex,total,cards,seed,hubs};
}
// The world continues beyond the viewport. Cells are generated only when a
// live pressure chain reaches them; energy decay, not a score quota, ends it.
export function outsideCell(board,tx,ty){
 const zig=n=>n>=0?n*2:-n*2-1,a=zig(tx),b=zig(ty),cell=(a+b)*(a+b+1)/2+b;
 const rng=random((board.seed^Math.imul(tx,73856093)^Math.imul(ty,19349663))>>>0);
 const mean=Math.max(1,board.total/176)*(1+board.wave*.75);
 return Array.from({length:64},(_,i)=>{let x=tx+.01+rng()*.98,y=ty+.01+rng()*.98;if(i<16&&ty===0&&Math.abs(tx)===1){x=tx<0?-.02:1.02;y=(i+.5)/16;}if(i<16&&tx===0&&Math.abs(ty)===1){y=ty<0?-.02:1.02;x=(i+.5)/16;}return{id:1000+cell*64+i,x,y,angle:rng()*Math.PI*2,color:i%5,weight:Math.max(1,Math.round(mean*(.4-Math.log(Math.max(Number.EPSILON,1-rng()))))),resistance:.52+rng()*.42,offscreen:true};});
}
export function simulateShot(board,design,aim){
 const s=stats(design),rng=random(board.seed+Math.round(aim.x*1000)+Math.round(aim.y*1000)),factor=affinity(design,fields[board.fieldIndex].type),radius=.14+factor*.13+s.area*.015;
 const origin={x:clamp(aim.x+(rng()-.5)*s.wild*.06,.03,.97),y:clamp(aim.y+(rng()-.5)*s.wild*.06,.12,.94)};
 const result=[],energies=new Map(),cells=new Map(),seen=new Set();
 const accept=(card,energy,delay,depth)=>{seen.add(card.id);energies.set(card.id,energy);result.push({...card,delay,depth});};
 for(const card of board.cards){const dist=Math.hypot(card.x-origin.x,(card.y-origin.y)*1.35),energy=Math.max(0,1-dist/radius)*(1.05+factor*.9)+(dist<.065?s.hit/65:0);if(energy>card.resistance)accept(card,energy,dist*1100,1);}
 const reach=.10+s.chain/2000,decay=Math.min(.9,.57+factor*.16+s.chain/1200);
 let cursor=0;
 while(cursor<result.length){
  const source=result[cursor++],energy=energies.get(source.id)*decay;
  if(energy<=.52*.72)continue;
  const candidates=[...board.cards];
  for(let x=Math.floor(source.x-reach);x<=Math.floor(source.x+reach);x++)for(let y=Math.floor(source.y-reach/1.3);y<=Math.floor(source.y+reach/1.3);y++){
   if(x===0&&y===0)continue;const key=x+':'+y;if(!cells.has(key))cells.set(key,outsideCell(board,x,y));candidates.push(...cells.get(key));
  }
  for(const card of candidates){if(seen.has(card.id))continue;const dist=Math.hypot(card.x-source.x,(card.y-source.y)*1.3);if(dist<reach&&energy>card.resistance*.72)accept(card,energy,source.delay+105+dist*800,source.depth+1);}
 }
 result.sort((a,b)=>a.delay-b.delay);
 const visibleCount=result.filter(c=>!c.offscreen).reduce((a,c)=>a+c.weight,0),offscreenCount=result.filter(c=>c.offscreen).reduce((a,c)=>a+c.weight,0);
 return{cards:result,count:visibleCount+offscreenCount,visibleCount,offscreenCount,chain:Math.max(0,...result.map(c=>c.depth)),wind:s.wind*(.55+factor*.45),origin};
}
// Conservative outline footprints: overlapping paper pins the opponent down.
export function duelSpacing(attacker,defender){return .11*attacker.size/.8*Math.max(...attacker.points.map(p=>Math.hypot(p.x,p.y)))+.115*defender.size/.8*Math.max(...defender.points.map(p=>Math.hypot(p.x,p.y)));}
export function duelShot(attacker,defender,aim,target,fieldIndex=0,aspect=1.35){
 const a=stats(attacker),d=stats(defender),distance=Math.hypot(aim.x-target.x,(aim.y-target.y)*aspect);
 const gap=distance-duelSpacing(attacker,defender),blocked=gap<0;
 const edge=blocked?0:Math.max(0,1-Math.abs(gap-.025)/.11);
 const impulse=edge*(a.wind/95+a.hit/180+a.chain/300)*(.82+affinity(attacker,fields[fieldIndex].type)*.24);
 const threshold=.48+defender.thickness*.025+d.precision*.0012;
 return {flipped:!blocked&&impulse>threshold,impulse,threshold,distance,gap,blocked,aspect};
}
export function cpuAim(target,difficulty,attacker,defender=createDesign(),aspect=1.35,rng=Math.random){
 const spread=[.15,.075,.025][difficulty],offset=duelSpacing(attacker,defender)+.025;
 const direction=target.x>.5?-1:1;
 return {x:clamp(target.x+direction*offset+(rng()-.5)*spread*2,.05,.95),y:clamp(target.y+(rng()-.5)*spread*2/aspect,.25,.85)};
}
export function isDesign(d){return !!d&&typeof d.id==='string'&&typeof d.name==='string'&&Number.isFinite(d.thickness)&&d.thickness>=1&&d.thickness<=10&&Number.isFinite(d.size)&&d.size>=.45&&d.size<=1&&Array.isArray(d.points)&&d.points.length>=3&&d.points.length<=110&&d.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<=1.2&&Math.abs(p.y)<=1.2)&&['front','back'].every(k=>d[k]&&/^#[0-9a-f]{6}$/i.test(d[k].color)&&Number.isInteger(d[k].pattern)&&Array.isArray(d[k].strokes)&&d[k].strokes.length<=400&&d[k].strokes.every(s=>(s.tool===undefined||s.tool==='pen'||s.tool==='eraser')&&/^#[0-9a-f]{6}$/i.test(s.color)&&Number.isFinite(s.width)&&s.width>0&&s.width<.3&&Array.isArray(s.points)&&s.points.length<=800&&s.points.every(p=>Number.isFinite(p.x)&&Number.isFinite(p.y)&&Math.abs(p.x)<=2&&Math.abs(p.y)<=2)));}
