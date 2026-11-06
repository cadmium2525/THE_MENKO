import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {workshop,arena} from '../src/render.js';
import {createDesign,makeBoard,simulateShot,fields} from '../src/model.js';
import {paintInk} from '../src/effects.js';
import {setCinematicBackground} from '../src/cinematic.js';
const require=createRequire(process.env.CANVAS_PACKAGE_JSON||import.meta.url);
const {createCanvas,loadImage}=require('@napi-rs/canvas');
setCinematicBackground(await loadImage('assets/environment/yard.jpg'));
globalThis.devicePixelRatio=1;
globalThis.document={createElement:()=>createCanvas(512,512)};
await mkdir('test-results',{recursive:true});
function surface(w,h){const c=createCanvas(w,h);c.getBoundingClientRect=()=>({width:w,height:h});return c;}
const d=createDesign(),board=makeBoard(1),shot=simulateShot(board,d,{x:.5,y:.55});
const output=surface(390*3,420*2),ctx=output.getContext('2d');ctx.fillStyle='#f4efdf';ctx.fillRect(0,0,output.width,output.height);
for(const [i,progress]of [.15,.55,.91].entries()){
 const c=surface(342,280),g=c.getContext('2d');g.fillStyle='#244f49';g.fillRect(0,0,342,280);
 workshop(c,d,0,'front',null,0,progress);ctx.fillStyle='#244f49';ctx.fillRect(i*390+24,50,342,280);ctx.drawImage(c,i*390+24,50);ctx.fillStyle='#282b27';ctx.font='22px sans-serif';ctx.fillText('SAW '+Math.round(progress*100)+'%',i*390+24,30);
}
for(const [i,ms]of [300,520,1150].entries()){
 const c=surface(342,340);arena(c,{board,design:d,field:fields[0],shot,start:100,time:100+ms});ctx.drawImage(c,i*390+24,460);ctx.fillStyle='#282b27';ctx.fillText(['SLOW DESCENT','HIT STOP','CHAIN RELEASE'][i],i*390+24,440);
}
await writeFile('test-results/revision-effects.png',output.toBuffer('image/png'));
for(const wind of [20,45,70,95]){
 const c=surface(390,573);arena(c,{board,design:d,field:fields[0],shot:{...shot,wind},start:100,time:1400});
 await writeFile(`test-results/wind-${wind}.png`,c.toBuffer('image/png'));
}
// Verify the real raster compositing: center disappears; both ends remain.
const ink=surface(200,200),ic=ink.getContext('2d');ic.setTransform(100,0,0,100,100,100);
paintInk(ic,[{color:'#000000',width:.12,points:[{x:-.8,y:0},{x:.8,y:0}]},{tool:'eraser',color:'#000000',width:.08,points:[{x:0,y:-.2},{x:0,y:.2}]}]);
assert.equal(ic.getImageData(100,100,1,1).data[3],0);
assert.equal(ic.getImageData(30,100,1,1).data[3],255);
assert.equal(ic.getImageData(170,100,1,1).data[3],255);
console.log('Saw/impact render snapshots and real pixel eraser checks passed.');

