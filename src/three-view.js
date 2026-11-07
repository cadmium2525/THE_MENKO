// Three.js is bundled locally. Rules and scores remain in model.js.
import {createDesign,outline,clamp,random} from './model.js';
import {drawMenko,fit,hero,thumbnail,workshop,arena} from './render.js';
import {impactFrame,windPresentation} from './effects.js';
const T=globalThis.MENKO_THREE;
let view3=null,unavailable3=false,lost3=false;
const palette3=['#dd5136','#287669','#f1bb47','#427fab','#855085'];
const homeDesign3=[createDesign(),{...createDesign('star'),front:{color:'#e4ad3e',pattern:3,strokes:[]}},{...createDesign('square'),front:{color:'#277567',pattern:2,strokes:[]}}];
function renderer3(){
 if(!T||unavailable3||lost3)return null;
 if(view3)return view3;
 try{
  const gl=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance',preserveDrawingBuffer:true});
  gl.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,1.5));gl.shadowMap.enabled=true;gl.shadowMap.type=T.PCFSoftShadowMap;
  gl.outputColorSpace=T.SRGBColorSpace;gl.toneMapping=T.ACESFilmicToneMapping;gl.toneMappingExposure=1.05;
  gl.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost3=true;});
  gl.domElement.addEventListener('webglcontextrestored',()=>{lost3=false;if(view3)view3.key=null;});
  view3={gl,key:null,scene:null,resources:new Set(),materials:new Map(),textures:new Map(),cardTemplates:new Map()};
  // Read-only performance information and a loss/recovery hook for browser QA.
  globalThis.__MENKO_3D__={get info(){return {calls:gl.info.render.calls,triangles:gl.info.render.triangles,geometries:gl.info.memory.geometries,textures:gl.info.memory.textures,lost:lost3};},lose:()=>gl.forceContextLoss(),restore:()=>gl.forceContextRestore()};
  return view3;
 }catch{unavailable3=true;return null;}
}
function resource3(v,o){v.resources.add(o);return o;}
function material3(v,color,roughness=.85){const key=color+roughness;if(!v.materials.has(key))v.materials.set(key,resource3(v,new T.MeshStandardMaterial({color,roughness})));return v.materials.get(key);}
function mesh3(v,geometry,color,x=0,y=0,z=0,parent=v.scene){const m=new T.Mesh(resource3(v,geometry),material3(v,color));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;parent.add(m);return m;}
function box3(v,color,x,y,z,sx,sy,sz,parent=v.scene){return mesh3(v,new T.BoxGeometry(sx,sy,sz),color,x,y,z,parent);}
function ball3(v,color,x,y,z,sx,sy=sx,sz=sx,parent=v.scene){const m=mesh3(v,new T.SphereGeometry(1,14,10),color,x,y,z,parent);m.scale.set(sx,sy,sz);return m;}
function texture3(v,canvas){const tex=resource3(v,new T.CanvasTexture(canvas));tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;return tex;}
function groundTexture3(v,wood=false){const c=document.createElement('canvas');c.width=c.height=256;const g=c.getContext('2d'),rng=random(299);g.fillStyle=wood?'#ab7446':'#b99b69';g.fillRect(0,0,256,256);for(let i=0;i<10000;i++){g.fillStyle=wood?`rgba(54,26,8,${rng()*.16})`:`rgba(${rng()>.5?'255,235,186':'64,46,20'},${rng()*.28})`;g.fillRect(rng()*256,rng()*256,wood?30+rng()*60:1+rng()*3,wood?1:1+rng()*3);}const tex=texture3(v,c);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(wood?3:40,wood?3:40);return tex;}
function reset3(v,key,studio=false){
 for(const r of v.resources)r.dispose();v.resources.clear();v.materials.clear();v.textures.clear();v.cardTemplates.clear();v.key=key;
 v.scene=new T.Scene();v.scene.background=new T.Color(studio?'#d5e4d5':'#86c4e7');v.scene.fog=new T.Fog(studio?'#d5e4d5':'#a3cce1',studio?23:30,studio?50:85);
 v.scene.add(new T.HemisphereLight('#e4f5ff','#8e6536',1.7));
 const sun=new T.DirectionalLight('#fff0cc',3);sun.position.set(-8,14,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:60});sun.shadow.normalBias=.035;sun.shadow.bias=-.0003;v.scene.add(sun);
 v.camera=new T.PerspectiveCamera(48,1,.1,100);v.top=new T.OrthographicCamera(-6,6,9,-9,.1,100);v.top.position.set(0,28,0);v.top.up.set(0,0,-1);v.top.lookAt(0,0,0);
 const floor=new T.Mesh(resource3(v,new T.PlaneGeometry(160,160)),resource3(v,new T.MeshStandardMaterial({map:groundTexture3(v,studio),roughness:1})));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;v.scene.add(floor);
 v.cards=[];v.particles=[];v.effects=new T.Group();v.scene.add(v.effects);v.stage=new T.Group();v.scene.add(v.stage);
 if(!studio)yard3(v);else{
  box3(v,'#35665b',0,-.02,0,8,.05,6);for(let i=-4;i<=4;i++){box3(v,'#659886',i,.015,0,.012,.006,6);box3(v,'#659886',0,.015,i*.7,8,.006,.012);}
 }
}
function yard3(v){
 const rng=random(12);
 for(let i=-5;i<=5;i++){box3(v,'#cdbb8d',i*3,1.4,-15,.16,2.8,.16);box3(v,'#447769',i*3,1.1,-15,2.9,.13,.13);box3(v,'#447769',i*3,2.2,-15,2.9,.13,.13);}
 v.trees=[];
 for(let i=0;i<11;i++){
  const tree=new T.Group();v.scene.add(tree);v.trees.push(tree);
  tree.position.set(i<2?(i?-7:7):(i<6?-1:1)*(10+rng()*8),0,i<2?-13:-9-rng()*15);
  mesh3(v,new T.CylinderGeometry(.18,.32,4,7),'#795437',0,2,0,tree);
  for(let j=0;j<3;j++){const m=mesh3(v,new T.IcosahedronGeometry(1.8+rng(),1),['#527b36','#709640','#8ba64a'][j],(j-1)*.9,4+j*.6,0,tree);m.scale.y=.85;}
 }
 v.vortex=new T.Group();v.vortex.position.set(0,0,-13);v.scene.add(v.vortex);v.vortex.visible=false;v.vortexBands=[];
 for(let i=0;i<12;i++){
  const points=[];for(let n=0;n<=90;n++){const a=n/90*Math.PI*1.85,r=1.2+i*.25;points.push(new T.Vector3(Math.cos(a)*r,4+i*.4+Math.sin(a)*.15,Math.sin(a)*r));}
  const band=new T.Mesh(resource3(v,new T.TubeGeometry(new T.CatmullRomCurve3(points),90,.065,5,false)),resource3(v,new T.MeshBasicMaterial({color:i%3?'#fff5cf':'#ffd068',transparent:true,opacity:.8})));v.vortex.add(band);v.vortexBands.push(band);
 }
 const mist=new T.InstancedMesh(resource3(v,new T.SphereGeometry(1,8,6)),resource3(v,new T.MeshStandardMaterial({color:'#e7f3ff',transparent:true,opacity:.3,depthWrite:false,roughness:1})),120),wisp=new T.Object3D();
 for(let i=0;i<120;i++){const height=i/120*4.5,a=i*.48,r=1.15+height*.62;wisp.position.set(Math.cos(a)*r,4+height,Math.sin(a)*r);wisp.scale.set(.3+height*.05,.16+height*.025,.32);wisp.rotation.y=-a;wisp.updateMatrix();mist.setMatrixAt(i,wisp.matrix);}v.vortex.add(mist);
 v.leaves=[];for(let i=0;i<28;i++){const leaf=mesh3(v,new T.OctahedronGeometry(.13,0),i%2?'#bd933a':'#74943b');leaf.scale.set(1,.22,1.6);leaf.visible=false;v.leaves.push(leaf);}
 for(let i=0;i<4;i++){const x=-13+i*9,z=-23-rng()*5;box3(v,i%2?'#ecdfbc':'#bed3cc',x,2.4,z,5,4.8,4);const roof=mesh3(v,new T.ConeGeometry(4.2,2,4),'#4e6975',x,5.5,z);roof.rotation.y=Math.PI/4;box3(v,'#55818d',x,2.5,z+2.02,2,1.5,.04);}
 // Small stones are instanced so terrain detail costs one draw call.
 const pebble=new T.InstancedMesh(resource3(v,new T.IcosahedronGeometry(1,0)),material3(v,'#8c7958'),180),dummy=new T.Object3D();
 for(let i=0;i<180;i++){dummy.position.set((rng()-.5)*30,.035,(rng()-.5)*30);dummy.scale.setScalar(.025+rng()*.07);dummy.rotation.set(rng(),rng(),rng());dummy.updateMatrix();pebble.setMatrixAt(i,dummy.matrix);}pebble.receiveShadow=true;v.scene.add(pebble);
 v.clouds=[];for(const sign of [-1,1]){const group=new T.Group();group.position.set(sign*1.4,7,-17);v.scene.add(group);for(let i=0;i<5;i++)ball3(v,'#fffbed',i*sign*1.25,Math.sin(i)*.3,0,1.7,1,1,group);v.clouds.push(group);}
 v.man=oldMan3(v);v.umbrella=new T.Group();v.stage.add(v.umbrella);v.umbrella.position.set(-3,0,0);
 mesh3(v,new T.CylinderGeometry(.035,.035,2.6,7),'#dad9cc',0,1.3,0,v.umbrella);
 v.canopy=mesh3(v,new T.ConeGeometry(1.25,.7,10,1,true),'#dc553d',0,2.8,0,v.umbrella);v.canopy.material=resource3(v,new T.MeshStandardMaterial({color:'#d74935',side:T.DoubleSide,roughness:.75}));
 for(let i=0;i<8;i++){const a=i*Math.PI/4;const rib=box3(v,'#f2d5a5',Math.cos(a)*.6,2.56,Math.sin(a)*.6,.025,.025,1.2,v.umbrella);rib.rotation.y=-a+Math.PI/2;}
}
function oldMan3(v){
 const man=new T.Group();v.stage.add(man);man.position.set(2,0,0);
 // A deliberately theatrical miniature spectator, with a separate removable wig.
 box3(v,'#3a536b',-.24,.42,0,.36,.84,.42,man);box3(v,'#3a536b',.24,.42,0,.36,.84,.42,man);
 box3(v,'#392f27',-.24,.13,.13,.4,.25,.68,man);box3(v,'#392f27',.24,.13,.13,.4,.25,.68,man);
 ball3(v,'#e1a257',0,1.2,0,.64,.72,.43,man);box3(v,'#fff0c9',0,1.35,.38,.18,.7,.04,man);
 const head=ball3(v,'#efbf8f',0,2.18,.03,.53,.58,.47,man);
 for(const sign of [-1,1]){ball3(v,'#efbf8f',sign*.51,2.17,.04,.14,.19,.12,man);ball3(v,'#252a2b',sign*.21,2.26,.46,.08,.08,.035,man);box3(v,'#35322d',sign*.21,2.39,.45,.22,.045,.035,man);}
 ball3(v,'#d79667',0,2.12,.53,.12,.14,.11,man);ball3(v,'#51423a',-.08,2.015,.49,.12,.045,.035,man);ball3(v,'#51423a',.08,2.015,.49,.12,.045,.035,man);v.mouth=ball3(v,'#5b3025',0,1.94,.46,.14,.045,.025,man);
 const wig=new T.Group();man.add(wig);wig.position.set(0,2.53,0);ball3(v,'#382d28',0,0,0,.55,.27,.48,wig);for(let i=0;i<6;i++){const curl=ball3(v,'#4b352a',-.42+i*.16,.13,.08,.14,.12,.39,wig);curl.rotation.z=-.3;}
 v.wig=wig;v.arms=[];for(const sign of [-1,1]){const arm=new T.Group();arm.position.set(sign*.52,1.5,0);man.add(arm);mesh3(v,new T.CylinderGeometry(.13,.16,.65,8),'#f3d8a7',0,-.29,0,arm);ball3(v,'#efbf8f',0,-.67,0,.16,.19,.15,arm);arm.rotation.z=sign*.2;v.arms.push(arm);}
 return man;
}
function faceTexture3(v,d,side){const key=JSON.stringify([d.points,d[side]]);if(v.textures.has(key))return v.textures.get(key);const c=document.createElement('canvas');c.width=c.height=256;drawMenko(c.getContext('2d'),{...d,thickness:1},128,128,256/2.8,0,side,1,false);const tex=texture3(v,c);v.textures.set(key,tex);return tex;}
function card3(v,d,r=1,detailed=true){
 const key=JSON.stringify([d.points,d.thickness,d.front,d.back,detailed]);let template=v.cardTemplates.get(key);
 if(!template){
  template=new T.Group();const shape=new T.Shape();d.points.forEach((p,i)=>shape[i?'lineTo':'moveTo'](p.x,-p.y));shape.closePath();
  const depth=.035+d.thickness*.012;
  const body=new T.Mesh(resource3(v,new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.012,bevelThickness:.008,bevelSegments:1,steps:1})),material3(v,'#bc925c'));
  body.castShadow=body.receiveShadow=true;template.add(body);
  for(const side of ['front','back']){
   const geometry=resource3(v,new T.ShapeGeometry(shape)),pos=geometry.attributes.position,uv=geometry.attributes.uv;
   for(let i=0;i<uv.count;i++)uv.setXY(i,pos.getX(i)/2.8+.5,pos.getY(i)/2.8+.5);
   const face=new T.Mesh(geometry,resource3(v,new T.MeshStandardMaterial({map:faceTexture3(v,d,side),roughness:.78,side:T.DoubleSide})));
   face.position.z=side==='front'?depth+.012:-.012;face.castShadow=face.receiveShadow=true;template.add(face);
  }
  // Thin paper layers on the cut edge, following the hand-drawn outline.
  for(let layer=1;detailed&&layer<4;layer++){const points=d.points.map(p=>new T.Vector3(p.x,-p.y,depth*layer/4));points.push(points[0]);template.add(new T.Line(resource3(v,new T.BufferGeometry().setFromPoints(points)),resource3(v,new T.LineBasicMaterial({color:'#e6c48c'}))));}
  template.rotation.x=-Math.PI/2;v.cardTemplates.set(key,template);
 }
 const outer=new T.Group();outer.add(template.clone(true));outer.scale.setScalar(r);v.scene.add(outer);return outer;
}
function renderCanvas3(v,canvas,camera){
 const {ctx,w,h}=fit(canvas);v.gl.setSize(Math.round(w),Math.round(h),false);camera.aspect=w/h;if(camera.isPerspectiveCamera)camera.updateProjectionMatrix();v.gl.render(v.scene,camera);ctx.clearRect(0,0,w,h);ctx.drawImage(v.gl.domElement,0,0,w,h);canvas.dataset.renderer='three';
}
function sceneParticles3(v){
 const rng=random(71);for(let i=0;i<90;i++){
  const spark=mesh3(v,new T.SphereGeometry(1,5,3),'#ffe8a2',0,-30,0,v.effects);spark.material=resource3(v,new T.MeshBasicMaterial({color:i%3?'#fff1b6':'#ffb13c'}));spark.castShadow=false;spark.scale.set(.025,.025,.24);
  v.particles.push({mesh:spark,a:rng()*Math.PI*2,speed:3+rng()*7,lift:2+rng()*5,life:.5+rng()*.65});
 }
 const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),gradient=g.createRadialGradient(32,32,0,32,32,32);gradient.addColorStop(0,'#ead1a4aa');gradient.addColorStop(.5,'#d7b88655');gradient.addColorStop(1,'#bd985b00');g.fillStyle=gradient;g.fillRect(0,0,64,64);const tex=texture3(v,c);v.dust=[];
 for(let i=0;i<22;i++){const m=resource3(v,new T.SpriteMaterial({map:tex,transparent:true,depthWrite:false,opacity:0}));const sprite=new T.Sprite(m);v.effects.add(sprite);v.dust.push({mesh:sprite,a:i*2.399,speed:1+rng()*4});}
 v.rings=[];for(let i=0;i<2;i++){const ring=new T.Mesh(resource3(v,new T.RingGeometry(.94,1,72)),resource3(v,new T.MeshBasicMaterial({color:i?'#ffc763':'#fff5cc',side:T.DoubleSide,transparent:true,depthWrite:false})));ring.rotation.x=-Math.PI/2;v.effects.add(ring);v.rings.push(ring);}
 v.flash=new T.PointLight('#ffe7a2',0,16,2);v.scene.add(v.flash);
 v.seeds=[];for(let i=0;i<12;i++){const seed=new T.Group();v.stage.add(seed);ball3(v,'#ffffe1',0,0,0,.065,.065,.065,seed);const stem=box3(v,'#c9ab6b',0,-.12,0,.012,.25,.012,seed);for(let j=0;j<5;j++){const fluff=box3(v,'#fff9dd',0,.04,0,.23,.008,.008,seed);fluff.rotation.z=j*Math.PI/5;}v.seeds.push(seed);}
}
function boardPoint3(p,aspect){return new T.Vector3((p.x-.5)*12,0,(p.y-.5)*12*aspect);}
function buildBattle3(v,data,aspect){
 reset3(v,'battle');v.board=data.board;v.design=data.design;v.duel=data.duel?.defender;v.aspect=aspect;v.targetSignature=JSON.stringify(data.duel?.target);v.shot=null;
 const cards=data.duel?[{id:-1,...data.duel.target,angle:0,color:0}]:data.board.cards;
 for(const card of cards){const d=data.duel?data.duel.defender:{...homeDesign3[0],points:outline(card.id%7===0?'square':'circle'),thickness:3,front:{color:palette3[card.color],pattern:card.id%5,strokes:[]},back:{color:'#bba174',pattern:2,strokes:[]}};const m=card3(v,d,data.duel?12*.115*d.size/.8:(data.board.total>200?.27:.4),!!data.duel);const base=boardPoint3(card,aspect);m.position.copy(base);m.position.y=.025;m.scale.y*=1+Math.log2(card.weight||1)*.18;m.rotation.y=card.angle;v.cards.push({card,mesh:m,base});}
 v.player=card3(v,data.design,data.duel?12*.11*data.design.size/.8:1.45*data.design.size/.8);v.player.visible=false;
 v.aim=new T.Mesh(resource3(v,new T.RingGeometry(1.05,1.12,64)),resource3(v,new T.MeshBasicMaterial({color:'#ffecaa',transparent:true,opacity:.95,side:T.DoubleSide})));v.aim.rotation.x=-Math.PI/2;v.scene.add(v.aim);
 sceneParticles3(v);
}
function animateWind3(v,t,wind,reduced){
 const tier=windPresentation(wind).tier,p=clamp((t-500)/1700,0,1),gag=clamp((t-1100)/1600,0,1);
 v.canopy.scale.y=tier>=1&&p>.12?-1:1;v.umbrella.rotation.z=tier>=1?Math.sin(p*Math.PI)*1.1:0;
 v.umbrella.position.y=tier>=1?Math.sin(p*Math.PI)*1.6:0;
 for(let i=0;i<v.seeds.length;i++){const s=v.seeds[i];s.visible=t>100;s.position.set(-4+i*.65+p*5,1+Math.sin(i)*.4+p*3,-.3+Math.cos(i)*.7);s.rotation.z=p*5+i;}
 const gale=tier>=4?clamp((t-2700)/650,0,1):0;
 v.trees.forEach((tree,i)=>{tree.rotation.z=gale*(.3+Math.sin(t*.008+i)*.1)*(tree.position.x<0?-1:1);});
 v.leaves.forEach((leaf,i)=>{leaf.visible=gale>0;const a=t*.004+i*2.4;leaf.position.set(Math.cos(a)*(3+i%5),1+(i*.31+t*.002)%7,-9+Math.sin(a)*(2+i%4));leaf.rotation.set(a,a*2,i);});
 const vortex=tier>=5?clamp((t-3400)/800,0,1):0;v.vortex.visible=vortex>0;v.vortex.scale.setScalar(.4+vortex*.6);v.scene.background.set('#86c4e7').lerp(new T.Color('#536b9b'),vortex*.7);v.scene.fog.color.copy(v.scene.background);v.vortexBands.forEach((band,i)=>{band.rotation.y=t*.0015*(1+i*.07);});
 const blown=tier>=2&&t>1100;
 v.wig.position.set(blown?-gag*3:0,2.53+(blown?Math.sin(gag*Math.PI*.8)*2.2:0),blown?gag*.4:0);
 v.wig.rotation.set(blown?gag*7:0,blown?gag*8:0,blown?gag*3:0);
 v.man.rotation.z=blown?Math.sin(gag*9)*.12:0;
 v.arms.forEach((a,i)=>a.rotation.z=(i?1:-1)*(blown?2.4:.2));v.mouth.scale.y=.045*(blown?3:1);
 for(let i=0;i<2;i++)v.clouds[i].position.x=(i?1:-1)*(1.4+(tier>=3?clamp((t-1700)/1300,0,1)*6:0));
}
export function arena3D(canvas,data){
 const v=renderer3();if(!v){arena(canvas,data);return;}
 const rect=canvas.getBoundingClientRect(),aspect=rect.height/rect.width;
 if(v.key!=='battle'||v.board!==data.board||v.design!==data.design||v.duel!==data.duel?.defender||Math.abs(v.aspect-aspect)>.01||v.targetSignature!==JSON.stringify(data.duel?.target))buildBattle3(v,data,aspect);
 const timing=impactFrame(data.shot?data.time-data.start:0,data.reduced),t=timing.simulation;
 const origin=boardPoint3(data.shot?.origin||data.aim,aspect);
 v.stage.position.set(-1,0,-6);
 v.top.left=-6;v.top.right=6;v.top.top=6*aspect;v.top.bottom=-6*aspect;v.top.updateProjectionMatrix();
 v.aim.visible=!data.shot;v.aim.position.copy(origin);v.aim.position.y=.04;
 if(data.shot!==v.shot){
  for(const item of v.cards.filter(item=>item.card.offscreen))v.scene.remove(item.mesh);
  v.cards=v.cards.filter(item=>!item.card.offscreen);
  v.shot=data.shot;v.hits=new Map((data.shot?.cards||[]).map(c=>[c.id,c]));
  for(const card of (data.shot?.cards||[]).filter(c=>c.offscreen).slice(0,48)){
   const d={...homeDesign3[0],thickness:3,front:{color:palette3[card.color],pattern:card.id%5,strokes:[]},back:{color:'#bba174',pattern:2,strokes:[]}},m=card3(v,d,.27,false),base=boardPoint3(card,aspect);m.scale.y*=1+Math.log2(card.weight)*.18;v.cards.push({card,mesh:m,base});
  }
 }
 v.player.visible=!!data.shot;
 for(const item of v.cards){
  const hit=data.duel?(data.shot?.flipped?{delay:0}:null):v.hits?.get(item.card.id);
  const p=hit&&timing.landed?clamp((t-hit.delay*.7)/1500,0,1):0;
  const lift=data.reduced?0:Math.sin(p*Math.PI)*(2.3+(item.card.id%5)*.6);
  item.mesh.position.copy(item.base);item.mesh.position.y=.04+lift;
  if(!data.reduced&&p>0){const direction=item.base.clone().sub(origin).normalize();item.mesh.position.addScaledVector(direction,Math.sin(p*Math.PI)*2.2);}
  item.mesh.rotation.set(p*Math.PI*(data.reduced?1:3+(Math.abs(item.card.id)%3)*2),item.card.angle||0,p>0&&!data.reduced?Math.sin(p*Math.PI)*.5:0);
 }
 v.effects.visible=!!data.shot&&timing.landed;v.flash.intensity=0;
 if(data.shot){
  v.player.position.copy(origin);v.player.position.y=.06+(1-timing.flight)*9;v.player.rotation.set((1-timing.flight)*.7,-.2,0);
  const seconds=t/1000;
  for(const p of v.particles){p.mesh.visible=seconds<p.life&&!data.reduced;p.mesh.position.set(origin.x+Math.cos(p.a)*(1.4+p.speed*seconds),.08+p.lift*seconds-3*seconds*seconds,origin.z+Math.sin(p.a)*(1.4+p.speed*seconds));p.mesh.rotation.set(p.a,seconds*6,p.a);}
  for(const p of v.dust){p.mesh.position.set(origin.x+Math.cos(p.a)*seconds*p.speed,.15+seconds*.7,origin.z+Math.sin(p.a)*seconds*p.speed);p.mesh.scale.setScalar(.3+seconds*2);p.mesh.material.opacity=data.reduced?0:Math.max(0,Math.sin(clamp(seconds/2.4,0,1)*Math.PI)*.65);}
  for(const [i,ring]of v.rings.entries()){ring.position.copy(origin);ring.position.y=.07;ring.scale.setScalar(1.4+seconds*(9+i*3));ring.material.opacity=Math.max(0,1-seconds/1.3);}
  v.flash.position.copy(origin);v.flash.position.y=.5;v.flash.intensity=timing.landed&&!data.reduced?Math.max(0,48-t*.09):0;
 }
 animateWind3(v,data.shot&&!data.reduced?t:0,data.shot?.wind||0,data.reduced);
 let camera=v.top;
 if(data.shot&&!data.reduced){
  camera=v.camera;
  const follow=origin.clone();follow.y=.25;
  camera.position.set(origin.x+.6,3.4,origin.z+7.4);camera.lookAt(follow.x,.25,follow.z-.7);
  // The same continuous scene reveals the spectator reacting to the pressure wave.
  const cut=clamp((t-1250)/450,0,1),reaction=windPresentation(data.shot.wind).tier;
  if(cut>0&&reaction>=1){const center=new T.Vector3(v.stage.position.x+(reaction>=2?1.2:-1),reaction>=2?2.1:1.7,v.stage.position.z);camera.position.lerp(new T.Vector3(center.x+.6,3.9,center.z+9),cut);follow.lerp(center,cut);if(reaction>=3){const sky=clamp((t-2200)/800,0,1);follow.y+=sky*2.2;camera.position.y+=sky*.7;}camera.lookAt(follow);}
  if(reaction>=4&&t>2900){const pan=clamp((t-2900)/650,0,1);camera.position.lerp(new T.Vector3(0,5.5,7),pan);const target=new T.Vector3(0,reaction>=5&&t>3400?6:3.8,-13);follow.lerp(target,pan);camera.lookAt(follow);}
  if(timing.landed&&t<300){camera.position.x+=Math.sin(t*.15)*.11*(1-t/300);camera.position.y+=Math.cos(t*.12)*.07*(1-t/300);}
 }
 renderCanvas3(v,canvas,camera);
}
function previewScene3(v,key,d){reset3(v,key,true);v.preview=card3(v,d,1.8*d.size/.8);v.preview.position.y=.3;v.camera.position.set(0,6,7);v.camera.lookAt(0,0,0);}
export function preview3D(canvas,d,time=0,reduced=false){
 const v=renderer3();if(!v){thumbnail(canvas,d);return;}
 const key='preview'+JSON.stringify(d);if(v.key!==key)previewScene3(v,key,d);
 v.preview.rotation.y=reduced?-.25:time*.00022;v.preview.rotation.z=.08;renderCanvas3(v,canvas,v.camera);
}
export function hero3D(canvas,time=0,reduced=false){
 const v=renderer3();if(!v){hero(canvas,time,reduced);return;}
 if(v.key!=='home'){reset3(v,'home',true);v.heroes=homeDesign3.map((d,i)=>{const m=card3(v,d,i?1.05:1.6);m.position.set(i===1?-2.4:i===2?2.5:0,.5,i?-.6:.9);return m;});}
 v.heroes.forEach((m,i)=>{m.position.y=.6+(reduced?0:Math.sin(time*.001+i)*.16);m.rotation.y=i*.5+(reduced?0:time*.00016);m.rotation.x=.1;});v.camera.position.set(0,4.6,7);v.camera.lookAt(0,.3,0);renderCanvas3(v,canvas,v.camera);
}
export function workshop3D(canvas,d,step,side,freePoints,time,cutProgress,reduced,eraserPoint,brushWidth){
 if(step!==0){workshop(canvas,d,step,side,freePoints,time,cutProgress,reduced,eraserPoint,brushWidth);return;}
 const v=renderer3();if(!v){workshop(canvas,d,step,side,freePoints,time,cutProgress,reduced,eraserPoint,brushWidth);return;}
 const key='work'+d.thickness;
 if(v.key!==key){
  reset3(v,key,true);v.paper=[];for(let i=0;i<9;i++)v.paper.push(box3(v,i%2?'#dbc498':'#eddbb3',0,.12+i*.17,0,3.6,.15,2.7));
  v.saw=new T.Group();v.scene.add(v.saw);box3(v,'#a8bec4',.5,0,0,3.7,.38,.04,v.saw);for(let i=0;i<24;i++){const tooth=mesh3(v,new T.ConeGeometry(.095,.15,3),'#a8bec4',-1.25+i*.145,-.25,0,v.saw);tooth.rotation.z=Math.PI;}
  box3(v,'#8d4428',-2,0,0,.9,.7,.16,v.saw);box3(v,'#dba35d',-2,0,.09,.55,.35,.025,v.saw);
 }
 const p=cutProgress??0,cutHeight=.15+d.thickness*.12;
 v.saw.position.set(Math.sin(p*70)*.35,cutHeight,.9-p*2);v.saw.rotation.z=-.08;
 v.paper.forEach((m,i)=>{m.position.x=p>.7&&i*.17>cutHeight?(p-.7)*4:0;m.position.y=.12+i*.17;});
 v.camera.position.set(5,4.8,7);v.camera.lookAt(0,.6,0);renderCanvas3(v,canvas,v.camera);
}
