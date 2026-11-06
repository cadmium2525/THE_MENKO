// Deterministic controller checks using a minimal DOM and the real Canvas renderer.
// Complements, rather than replaces, Playwright touch/layout testing.
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {runInNewContext} from 'node:vm';
import {webcrypto} from 'node:crypto';
import assert from 'node:assert/strict';
const require=createRequire(process.env.CANVAS_PACKAGE_JSON||import.meta.url);
const {createCanvas}=require('@napi-rs/canvas');
let clock=100,sequence=0,frames=new Map(),elements=new Map(),actions=new Map();
const noop=()=>{};
function element(id='',tag='div'){
 const e=tag==='canvas'?createCanvas(342,280):{};
 e.id=id;e.classList={add:noop,remove:noop,toggle:noop};e.setAttribute=noop;e.addEventListener=noop;e.setPointerCapture=noop;
 e.getBoundingClientRect=()=>({left:0,top:0,width:id==='arena'?390:342,height:id==='arena'?574:280});
 e.querySelector=selector=>selector.includes('data-action')?actions.get(selector.match(/"(.*?)"/)[1]):elements.get(selector.slice(1));
 if(id==='screen')Object.defineProperty(e,'innerHTML',{set(html){this.html=html;actions=new Map();for(const [,type,attrs]of html.matchAll(/<([a-z]+)([^>]*)>/g)){const eid=attrs.match(/\bid="([^"]+)"/)?.[1],act=attrs.match(/data-action="([^"]+)"/)?.[1];if(eid||act){const child=element(eid||'',type);child.disabled=/\bdisabled\b/.test(attrs);if(eid)elements.set(eid,child);if(act)actions.set(act,child);}}},get(){return this.html||'';}});
 return e;
}
for(const id of ['screen','dialog','sound','toast'])elements.set(id,element(id));
elements.get('dialog').open=false;
const storage=new Map();
const env={console,crypto:webcrypto,devicePixelRatio:1,matchMedia:()=>({matches:false}),performance:{now:()=>clock},navigator:{},setTimeout:()=>1,clearTimeout:noop,scrollTo:noop,addEventListener:noop,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},document:{hidden:false,body:{classList:{toggle:noop}},addEventListener:noop,querySelector:s=>s.startsWith('#')?elements.get(s.slice(1)):element(),createElement:tag=>element('',tag)},requestAnimationFrame:fn=>{frames.set(++sequence,fn);return sequence;},cancelAnimationFrame:id=>frames.delete(id)};
env.window=env;
let source='';for(const file of ['model','effects','cinematic','render','three-view','audio','app'])source+=(await readFile('src/'+file+'.js','utf8')).replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'')+'\n';
source=source.replace("new URL('../assets/audio/'+name+'.wav',import.meta.url)","'unused.wav'");
runInNewContext(source+'\nglobalThis.hooks={state,action,fire,finishShot};',env);
const {state,action,fire,finishShot}=env.hooks;
function tick(ms){clock=ms;const callbacks=[...frames.values()];frames.clear();for(const cb of callbacks)cb(ms);}
function draw(points){const c=elements.get('work'),event=p=>({pointerId:1,clientX:171+p[0]*106.4,clientY:140+p[1]*106.4,preventDefault:noop,type:'pointermove'});c.onpointerdown(event(points[0]));for(const p of points.slice(1))c.onpointermove(event(p));c.onpointerup({...event(points.at(-1)),type:'pointerup'});}
await action('new');await action('craft-next');assert.equal(state.step,0);assert.ok(state.cutStarted);assert.ok(actions.get('craft-next').disabled);
tick(650);assert.equal(state.step,0);tick(1250);assert.equal(state.step,1);assert.equal(actions.has('shape-circle'),false);assert.ok(actions.get('craft-next').disabled);
const shape=[[-.8,-.7],[.7,-.6],[.8,.7],[-.7,.8],[-.8,-.7]];
draw(shape);assert.equal(state.design.kind,'custom');assert.equal(actions.get('craft-next').disabled,false);await action('shape-undo');assert.equal(state.design.kind,'uncut');assert.ok(actions.get('craft-next').disabled);draw(shape);await action('craft-next');assert.equal(state.step,2);
draw([[-.7,0],[0,0],[.7,0]]);const pen=JSON.stringify(state.design.front.strokes[0]);await action('eraser');draw([[0,-.3],[0,0],[0,.3]]);assert.equal(state.design.front.strokes.length,2);assert.equal(state.design.front.strokes[1].tool,'eraser');assert.equal(JSON.stringify(state.design.front.strokes[0]),pen);tick(1300);await action('undo');assert.equal(state.design.front.strokes.length,1);
await action('craft-next');await action('musou');await action('start');
fire({x:.5,y:.55});tick(1600);assert.equal(state.impactPlayed,false);assert.equal(state.counter,0);tick(1800);assert.equal(state.impactPlayed,true);assert.equal(state.counter,0);finishShot();
for(let wave=2;wave<=5;wave++){await action('next-wave');assert.equal(state.wave,wave);fire({x:.5,y:.55});finishShot();}
assert.match(elements.get('screen').innerHTML,/5 WAVE 完走/);assert.equal(actions.has('next-wave'),false);assert.ok(actions.has('restart-run'));assert.equal(state.runScores.length,5);assert.equal(state.runTotal,state.runScores.reduce((a,b)=>a+b,0));
await action('next-wave');assert.equal(state.wave,5);await action('restart-run');assert.equal(state.wave,1);assert.equal(state.runTotal,0);
fire({x:.5,y:.55});finishShot();const total=state.runTotal;await action('rematch');fire({x:.5,y:.55});finishShot();assert.equal(state.runTotal,total);
console.log('Controller checks passed: saw, manual shape/undo, eraser/undo, impact timing, five-wave completion, restart and retry totals.');
