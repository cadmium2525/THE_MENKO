import test from 'node:test';
import assert from 'node:assert/strict';
import {impactFrame,paintInk,SAW_DURATION,windPresentation} from '../src/effects.js';
import {MAX_WAVES,WAVE_COUNTS,makeBoard,createDesign,isDesign} from '../src/model.js';

test('five waves end at 640 cards; no sixth wave can be created',()=>{
 assert.equal(MAX_WAVES,5);assert.deepEqual(WAVE_COUNTS,[64,128,240,400,640]);
 assert.equal(makeBoard(6).wave,5);assert.equal(makeBoard(6).total,640);
 assert.ok(SAW_DURATION>=800&&SAW_DURATION<1500);
});
test('four wind reactions use consistent thresholds and labels',()=>{
 assert.deepEqual([0,40,65,85].map(w=>windPresentation(w).reaction),['綿毛','傘','帽子','雲']);
 assert.deepEqual([39,64,84,100].map(w=>windPresentation(w).tier),[0,1,2,3]);
});
test('descent slows before impact; the scene clock freezes during hit-stop',()=>{
 const fast=(impactFrame(140).flight-impactFrame(40).flight)/100;
 const slow=(impactFrame(400).flight-impactFrame(200).flight)/200;
 assert.ok(slow<fast/4);assert.equal(impactFrame(469).landed,false);
 for(const ms of [470,500,599]){assert.equal(impactFrame(ms).phase,'stop');assert.equal(impactFrame(ms).simulation,0);assert.equal(impactFrame(ms).flight,1);}
 assert.equal(impactFrame(800).simulation,60);assert.equal(impactFrame(1000).simulation,120);
 assert.ok(impactFrame(1200).simulation>320);
});
test('presentation clock is continuous and reduced mode bypasses slowdown and hit-stop',()=>{
 let last=0;for(let ms=0;ms<4000;ms++){const frame=impactFrame(ms);assert.ok(frame.simulation>=last);assert.ok(frame.flight>=0&&frame.flight<=1);last=frame.simulation;}
 assert.equal(impactFrame(200,true).phase,'release');assert.equal(impactFrame(200,true).simulation,60);
});
test('eraser composites only its path at the selected width; all pen paths stay intact',()=>{
 const strokes=[{color:'#000000',width:.1,points:[{x:-.8,y:0},{x:.8,y:0}]},{tool:'eraser',color:'#000000',width:.03,points:[{x:0,y:-.1},{x:0,y:.1}]},{color:'#ff0000',width:.06,points:[{x:.5,y:.5}]}];
 const before=JSON.stringify(strokes),calls=[];
 const ctx={beginPath(){},moveTo(){},lineTo(){},stroke(){calls.push({operation:this.globalCompositeOperation,width:this.lineWidth});}};
 paintInk(ctx,strokes);
 assert.deepEqual(calls,[{operation:'source-over',width:.1},{operation:'destination-out',width:.03},{operation:'source-over',width:.06}]);
 assert.equal(JSON.stringify(strokes),before);assert.equal(ctx.globalCompositeOperation,'source-over');
 const d=createDesign();d.front.strokes=strokes;assert.equal(isDesign(d),true);
 d.front.strokes[1].tool='unknown';assert.equal(isDesign(d),false);
});
