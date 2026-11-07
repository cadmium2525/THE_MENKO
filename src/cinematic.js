import {clamp,outline,random} from './model.js';
import {windPresentation} from './effects.js';

let yard=null;
export function setCinematicBackground(image){yard=image;}
if(typeof Image!=='undefined'){
 const image=new Image();
 image.onload=()=>setCinematicBackground(image);
 image.src=globalThis.__MENKO_BACKGROUND__||new URL('assets/environment/yard.jpg',document.baseURI).href;
}
const cinemaPalette=['#db492f','#1d6159','#dfad4f','#4c7a9c','#77507b'];
const sceneCardCache=new Map();
const playerCardCache=new WeakMap();
function contour(ctx,points,r,offset=0){ctx.beginPath();points.forEach((p,i)=>ctx[i?'lineTo':'moveTo'](p.x*r,p.y*r+offset));ctx.closePath();}
function cardArt(d,side,drawMenko,key){
 const store=key?sceneCardCache:playerCardCache;
 const cached=store.get(key||d);
 if(cached?.[side])return cached[side];
 const entry=cached||{},canvas=document.createElement('canvas');canvas.width=canvas.height=320;
 drawMenko(canvas.getContext('2d'),{...d,thickness:1},160,157,143,0,side,1,false);
 entry[side]=canvas;store.set(key||d,entry);return canvas;
}
function thickCard(ctx,d,x,y,r,angle,tilt,side,drawMenko,key){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 const depth=clamp(r*.09+d.thickness*.7,3,18),scale=Math.max(.075,Math.abs(tilt));
 ctx.scale(1,scale);
 const physicalDepth=depth/scale;
 for(let n=physicalDepth;n>=0;n-=Math.max(1,physicalDepth/6)){
  contour(ctx,d.points,r,n);ctx.fillStyle=Math.round(n)%2?'#b58e55':'#c9a46a';ctx.fill();
  ctx.strokeStyle='#72543380';ctx.lineWidth=.8;ctx.stroke();
 }
 const art=cardArt(d,side,drawMenko,key);
 ctx.drawImage(art,-r*160/143,-r*157/143,r*320/143,r*320/143);
 ctx.restore();
}
function cover(ctx,image,w,h){const scale=Math.max(w/image.width,h/image.height);ctx.drawImage(image,(w-image.width*scale)/2,(h-image.height*scale)/2,image.width*scale,image.height*scale);}
function fallbackYard(ctx,w,h){
 const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#7cb5df');sky.addColorStop(.44,'#d8e6dc');sky.addColorStop(.46,'#c49c5f');sky.addColorStop(1,'#9b703f');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#365d4c88';ctx.lineWidth=3;for(let i=0;i<12;i++){ctx.beginPath();ctx.moveTo(i*w/11,h*.3);ctx.lineTo(i*w/11,h*.46);ctx.stroke();}
}
function glow(ctx,x,y,r,alpha){
 const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,255,228,${alpha})`);g.addColorStop(.2,`rgba(255,228,153,${alpha*.9})`);g.addColorStop(.6,`rgba(250,179,61,${alpha*.25})`);g.addColorStop(1,'rgba(246,148,40,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);
}
function shock(ctx,w,h,x,y,t,wind){
 const age=Math.max(0,t),strength=.8+clamp(wind/100,0,1)*.5;
 if(age<1300){
  ctx.save();ctx.globalCompositeOperation='screen';glow(ctx,x,y,w*(.33+age*.0002),Math.max(0,.9-age/1500));
  const radius=30+age*.48;
  ctx.strokeStyle=`rgba(255,241,181,${Math.max(0,1-age/1250)})`;ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(x,y,radius,radius*.27,0,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle=`rgba(255,255,237,${Math.max(0,.8-age/1000)})`;ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,radius*1.18,radius*.32,0,0,Math.PI*2);ctx.stroke();ctx.restore();
 }
 const rng=random(193);
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let i=0;i<60;i++){
  const a=rng()*Math.PI*2,v=.14+rng()*.48,life=450+rng()*900;if(age>life)continue;
  const travel=(18+age*v)*strength,dx=Math.cos(a),dy=Math.sin(a)*.58;
  const px=x+dx*travel,py=y+dy*travel-age*.08;
  ctx.globalAlpha=Math.max(0,1-age/life);ctx.strokeStyle=i%3?'#fff4c3':'#ffe3a1';ctx.lineWidth=.8+rng()*2;
  ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-dx*(15+age*.025),py-dy*(15+age*.025));ctx.stroke();
 }
 ctx.restore();
}
function dust(ctx,w,h,x,y,t,foreground=false){
 const rng=random(foreground?315:811),count=foreground?14:22;
 for(let i=0;i<count;i++){
  const a=rng()*Math.PI*2,v=.025+rng()*.1,life=850+rng()*700;
  const progress=clamp(t/life,0,1);if(progress>=1)continue;
  const px=x+Math.cos(a)*(18+t*v)*2.3,py=y+Math.sin(a)*(18+t*v)*.45-progress*h*.08;
  const size=w*(.03+progress*.12)*(foreground?1.5:1),opacity=Math.sin(progress*Math.PI)*.24;
  const g=ctx.createRadialGradient(px,py,0,px,py,size);g.addColorStop(0,`rgba(218,182,126,${opacity})`);g.addColorStop(1,'rgba(191,149,86,0)');ctx.fillStyle=g;ctx.fillRect(px-size,py-size,size*2,size*2);
 }
 const stones=random(77);ctx.fillStyle='#745033';
 for(let i=0;i<26;i++){
  const a=stones()*Math.PI*2,v=.06+stones()*.15,p=clamp(t/1300,0,1),distance=t*v;
  ctx.save();ctx.globalAlpha=1-p;ctx.translate(x+Math.cos(a)*distance,y+Math.sin(a)*distance*.4-Math.sin(p*Math.PI)*(35+stones()*80));ctx.rotate(p*8+i);ctx.fillRect(0,0,2+stones()*3,2+stones()*3);ctx.restore();
 }
}
function windReactions(ctx,w,h,t,wind){
 if(t<170||t>5000)return;
 const tier=windPresentation(wind).tier,p=clamp((t-170)/1700,0,1);
 // Four cumulative reactions, distinct from the shared impact sequence.
 for(let i=0;i<7;i++){
  const x=w*(.08+i*.14)+Math.sin(p*5+i)*w*.1,y=h*(.64-p*.55)-i*11;
  ctx.save();ctx.translate(x,y);ctx.rotate(p*3+i);ctx.strokeStyle='#fffce6';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,17);ctx.stroke();
  for(let n=0;n<8;n++){const a=n*Math.PI*2/8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*9,Math.sin(a)*9);ctx.stroke();}ctx.restore();
 }
 if(tier>=1){
  ctx.save();ctx.translate(w*(.9-p*1.05),h*(.4-p*.28));ctx.rotate(-p*6);ctx.fillStyle='#cf3c27';ctx.beginPath();ctx.moveTo(-31,0);ctx.quadraticCurveTo(0,p>.25?31:-37,31,0);ctx.lineTo(0,12);ctx.closePath();ctx.fill();ctx.strokeStyle='#332c23';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,37);ctx.arc(6,37,6,Math.PI,0,true);ctx.stroke();ctx.restore();
 }
 if(tier>=2){
  ctx.save();ctx.translate(w*.25,h*.39);ctx.fillStyle='#d5a65d';ctx.fillRect(-15,15,30,38);ctx.fillStyle='#edbc8b';ctx.beginPath();ctx.ellipse(0,0,19,23,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#29251f';ctx.fillRect(-9,-3,4,4);ctx.fillRect(5,-3,4,4);ctx.beginPath();ctx.ellipse(0,10,5,7,0,0,Math.PI*2);ctx.fill();ctx.restore();
  ctx.save();ctx.translate(w*(.25+p*.45),h*(.35-Math.sin(p*Math.PI)*.2));ctx.rotate(p*9);ctx.fillStyle='#3c2c22';ctx.beginPath();ctx.ellipse(0,0,21,12,0,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 if(tier>=3){
  const split=Math.sin(p*Math.PI)*w*.28;
  for(const direction of [-1,1]){ctx.save();ctx.translate(w*.5+direction*(split+w*.1),h*.22);ctx.fillStyle='#fffef5e8';for(let i=0;i<4;i++){ctx.beginPath();ctx.ellipse(direction*i*26,Math.sin(i)*10,34,18,0,0,Math.PI*2);ctx.fill();}ctx.restore();}
  ctx.save();ctx.globalCompositeOperation='screen';glow(ctx,w*.5,h*.22,split+12,(1-p)*.5);ctx.restore();
 }
 if(tier>=4&&t>2700){
  ctx.fillStyle='#819642';for(let i=0;i<24;i++){const a=t*.004+i*2.4;ctx.save();ctx.translate(w*.5+Math.cos(a)*w*.4,h*.5+Math.sin(a*.6)*h*.3);ctx.rotate(a);ctx.fillRect(-5,-2,10,4);ctx.restore();}
 }
 if(tier>=5&&t>3400){
  ctx.strokeStyle='#fff4cd';ctx.lineWidth=3;const grow=clamp((t-3400)/800,0,1);
  for(let i=0;i<12;i++){ctx.beginPath();ctx.ellipse(w*.5,h*(.18+i*.018),w*(.28-i*.017)*grow,8,t*.002+i*.05,0,Math.PI*1.85);ctx.stroke();}
 }
}

export function cinematicImpact(ctx,w,h,{board,design,shot,timing,duel},drawMenko){
 const elapsed=timing.simulation,origin={x:w*.5,y:h*.76};
 const duelOffset=duel?{x:(duel.target.x-shot.origin.x)*w*1.45,y:(duel.target.y-shot.origin.y)*(shot.aspect||1.35)*w*1.45*.5}:null;
 if(duel){origin.x-=duelOffset.x/2;origin.y=h*.7-duelOffset.y/2;}
 ctx.save();
 if(timing.landed&&elapsed<420){const strength=7*(1-elapsed/420);ctx.translate(Math.sin(elapsed*.18)*strength,Math.cos(elapsed*.14)*strength*.65);}
 if(yard)cover(ctx,yard,w,h);else fallbackYard(ctx,w,h);
 if(timing.phase==='slow'){ctx.fillStyle='#271f181a';ctx.fillRect(0,0,w,h);}
 const hits=new Map(shot.cards.map(c=>[c.id,c]));
 let cards=duel?[{id:1,x:duel.target.x,y:duel.target.y,angle:.1,color:0}]:board.cards;
 // Keep bounded even on the 640-card wave; selection is tied to actual hits.
 const stride=Math.max(1,Math.ceil(cards.length/72));cards=cards.filter((c,i)=>i%stride===0||hits.has(c.id)&&i%3===0);
 const projected=cards.map(card=>{
  const depth=clamp(1.5+(shot.origin.y-card.y)*2.3,.65,2.8),scale=1.2/depth;
  const hit=duel?(shot.flipped?{delay:0}:null):hits.get(card.id);
  const p=hit?clamp((elapsed-hit.delay*.6)/1250,0,1):0,air=Math.sin(p*Math.PI);
  if(duel)return{card,hit,p,air,scale:1,depth:1,x:origin.x+duelOffset.x,y:origin.y+duelOffset.y-air*h*.3,r:w*.16*.115/.11*duel.defender.size/.8};
  return{card,hit,p,air,scale,depth,x:origin.x+(card.x-shot.origin.x)*w*1.7*scale+(card.x<shot.origin.x?-1:1)*air*w*.22,y:h*.43+h*.38/depth-air*h*(.28+(card.id%5)*.045),r:w*.046*scale*(1+air*(card.id%4===0?2.1:.6))};
 }).sort((a,b)=>b.depth-a.depth);
 if(timing.landed){dust(ctx,w,h,origin.x,origin.y,elapsed);shock(ctx,w,h,origin.x,origin.y,elapsed,shot.wind);}
 for(const item of projected){
  const{card,air,p,x,y,r}=item;
  const d=duel?duel.defender:{points:outline(card.id%7===0?'square':'circle'),thickness:3,front:{color:cinemaPalette[card.color],pattern:card.id%5,strokes:[]},back:{color:'#d4be8d',pattern:2,strokes:[]}};
  ctx.save();ctx.globalAlpha=(1-air*.8)*.26;ctx.fillStyle='#332519';ctx.beginPath();ctx.ellipse(x,y+air*h*.3+8,r*1.06,r*.26,card.angle,0,Math.PI*2);ctx.fill();ctx.restore();
  const spin=Math.cos(p*Math.PI*(3+(card.id%3)*2)),tilt=air>.01?spin*(.55+air*.4):.39;
  thickCard(ctx,d,x,y,r,card.angle+p*(card.id%2?2:-2),tilt,spin<0?'back':'front',drawMenko,duel?null:`${card.color}-${card.id%5}-${card.id%7===0}`);
 }
 // The player's actual hand-cut silhouette and drawing are the hero of the shot.
 const flight=timing.flight,r=w*((duel?.16*design.size/.8:.26)+(1-flight)*.12),heroY=origin.y-(1-flight)*h*.66;
 ctx.save();ctx.fillStyle='#251b164d';ctx.beginPath();ctx.ellipse(origin.x+8,origin.y+18,r*1.08,r*.32,.08,0,Math.PI*2);ctx.fill();ctx.restore();
 thickCard(ctx,design,origin.x,heroY,r,-.14+(1-flight)*.5,.48+(1-flight)*.3,'front',drawMenko,null);
 if(timing.landed){
  ctx.save();ctx.globalCompositeOperation='screen';glow(ctx,origin.x-r*.75,origin.y+3,w*.2,Math.max(0,.75-elapsed/900));glow(ctx,origin.x+r*.65,origin.y+8,w*.18,Math.max(0,.65-elapsed/1000));ctx.restore();
  dust(ctx,w,h,origin.x,origin.y+20,elapsed,true);windReactions(ctx,w,h,elapsed,shot.wind);
 }
 const vignette=ctx.createRadialGradient(w*.5,h*.52,w*.2,w*.5,h*.52,h*.8);vignette.addColorStop(0,'#171c1800');vignette.addColorStop(1,'#171c1855');ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
 ctx.restore();
}
