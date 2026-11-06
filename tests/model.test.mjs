import test from 'node:test';import assert from 'node:assert/strict';
import {createDesign,outline,makeBoard,simulateShot,sanitizeOutline,isDesign,affinity,duelShot,cpuAim,duelSpacing} from '../src/model.js';
test('rounds grow beyond 500 while drawing stays bounded and weights sum exactly',()=>{for(const wave of [1,4,6,12,20]){const board=makeBoard(wave);assert.equal(board.cards.reduce((s,c)=>s+c.weight,0),board.total);assert.ok(board.cards.length<=176);if(wave>=6)assert.ok(board.total>500);}});
test('shot is repeatable and every physical card scores at most once',()=>{const board=makeBoard(8),d=createDesign(),aim={x:.5,y:.55};const a=simulateShot(board,d,aim),b=simulateShot(board,d,aim);assert.deepEqual(a,b);assert.equal(new Set(a.cards.map(c=>c.id)).size,a.cards.length);assert.ok(a.count<=board.total);assert.ok(a.count>0);});
test('invalid and crossed outlines are repaired; custom contours are retained',()=>{assert.ok(sanitizeOutline([{x:0,y:0}]).corrected);assert.ok(sanitizeOutline([{x:-1,y:-1},{x:1,y:1},{x:-1,y:1},{x:1,y:-1}]).corrected);assert.equal(sanitizeOutline(outline('star')).corrected,false);assert.ok(isDesign(createDesign()));assert.equal(isDesign({...createDesign(),thickness:Infinity}),false);});
test('four archetypes each have a favored board; thick large does not dominate',()=>{const thin={...createDesign(),thickness:1,size:1},thick={...createDesign(),thickness:10,size:.65},small={...createDesign(),thickness:4,size:.45},wild={...createDesign('star'),thickness:2,size:.8};const ds=[thin,thick,small,wild];for(const [i,f]of ['breeze','heavy','precision','chaos'].entries()){const a=ds.map(d=>affinity(d,f));assert.equal(a.indexOf(Math.max(...a)),i,`${f}: ${a}`);}});
test('duel hit and miss depend on aim',()=>{const d={...createDesign(),thickness:7},op=createDesign(),target={x:.5,y:.5};assert.equal(duelShot(d,op,target,target).flipped,false);assert.ok(duelShot(d,op,{x:.75,y:.5},target).flipped);assert.equal(duelShot(d,op,{x:.05,y:.9},target).flipped,false);});
test('each archetype wins a real same-aim score comparison on its home field',()=>{const ds=[{...createDesign(),thickness:1,size:1},{...createDesign(),thickness:10,size:.65},{...createDesign(),thickness:4,size:.45},{...createDesign('star'),thickness:2,size:.8}];for(let f=0;f<4;f++){const scores=ds.map(d=>simulateShot(makeBoard(1,f),d,{x:.5,y:.55}).count);assert.equal(scores.indexOf(Math.max(...scores)),f,JSON.stringify(scores));}});
test('artwork does not affect game performance',()=>{const d=createDesign(),other=structuredClone(d);other.front.color='#000000';other.front.pattern=4;assert.deepEqual(simulateShot(makeBoard(),d,{x:.5,y:.5}),simulateShot(makeBoard(),other,{x:.5,y:.5}));});
test('the starting menko can beat the default CPU with a well-placed shot',()=>{const target={x:.52,y:.51};assert.ok(duelShot(createDesign(),{...createDesign(),thickness:6},{x:.77,y:.51},target,0).flipped);});

test('overlap cannot flip even with maximum power; nearby ground can',()=>{
 const target={x:.5,y:.5};
 for(const thickness of [1,4,10])for(const kind of ['circle','square','star']){
  const a={...createDesign(kind),thickness,size:1},d=createDesign();
  for(const distance of [0,.08,duelSpacing(a,d)-.001])assert.equal(duelShot(a,d,{x:.5+distance,y:.5},target).flipped,false);
 }
 const a=createDesign(),d=createDesign();
 assert.ok(duelShot(a,d,{x:.75,y:.5},target).flipped);
 assert.ok(duelShot(a,d,{x:.5,y:.5+.25/2},target,0,2).flipped);
 assert.equal(duelShot(a,d,{x:.95,y:.5},target).flipped,false);
});
test('CPU aims beside its opponent, including near the board edge',()=>{
 const a=createDesign(),d=createDesign();
 for(const x of [.3,.52,.69]){
  const target={x,y:.51},aim=cpuAim(target,2,a,d,1.5,()=>.5);
  assert.ok(duelShot(a,d,aim,target,0,1.5).flipped);
 }
});

test('larger duel cards require more separation than the default pair',()=>{
 const target={x:.5,y:.5},aim={x:.75,y:.5},normal=createDesign(),large={...createDesign(),size:1};
 assert.equal(duelShot(normal,normal,aim,target).flipped,true);
 assert.equal(duelShot(large,large,aim,target).blocked,true);
 assert.equal(duelShot(large,large,aim,target).flipped,false);
});
