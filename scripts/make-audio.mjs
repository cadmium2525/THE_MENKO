// Rendered with the user's cadmium2525/mp4mp3 "かなでる" engine.
import {mkdir,writeFile} from 'node:fs/promises';
import {renderSong} from '../tools/mp4mp3/daw/js/engine/mix.js';
import {renderAnySfx} from '../tools/mp4mp3/daw/js/engine/sfx.js';
import {encodeWav} from '../tools/mp4mp3/daw/js/engine/wav.js';
await mkdir('assets/audio',{recursive:true});await mkdir('audio-source',{recursive:true});
const notes=[62,65,67,69,72,69,67,65,62,65,69,67,65,62,60,62];
const song={name:'紙風の遊び場',bpm:112,sig:[4,4],bars:8,key:'D minor pentatonic',master:{loudness:-20,ceiling:-2,fadeOut:0},tracks:[{id:'koto',name:'琴',inst:'koto',volume:-3,pan:-.12,clips:[{at:0,notes:Array.from({length:64},(_,i)=>[i*.5,notes[i%16]+(i>=32?12:0),.32,i%4===0?.7:.45]),len:32}]},{id:'marimba',inst:'marimba',volume:-10,pan:.2,clips:[{at:0,notes:Array.from({length:16},(_,i)=>[i*2+.5,[50,53,55,48][Math.floor(i/4)],.8,.5]),len:32}]},{id:'bass',inst:'pluckbass',volume:-10,clips:[{at:0,notes:Array.from({length:32},(_,i)=>[i,[38,41,43,36][Math.floor(i/8)],.5,i%2?.3:.6]),len:32}]},{id:'drums',kit:'lofi',volume:-11,clips:Array.from({length:8},(_,i)=>({at:i*4,len:4,res:.25,grid:{kick:'x.......x.......',rim:'....x.......x...',shaker:'x.x.x.x.x.x.x.x.'}}))}]};
await writeFile('audio-source/bgm.json',JSON.stringify(song,null,2));const sr=24000;const out=renderSong(song,{sr});const len=Math.round(32*60/112*out.sr);const L=out.L.slice(0,len),R=out.R.slice(0,len);for(let i=0;i<Math.min(220,L.length);i++){const a=i/220;L[i]*=a;R[i]*=a;L[L.length-1-i]*=a;R[R.length-1-i]*=a;}await writeFile('assets/audio/bgm.wav',encodeWav(L,R,out.sr,16));
const effects={hit:{preset:'impact',pitch:3,length:.6,punch:.9,space:.12,seed:9},cut:{preset:'page',pitch:-8,length:.7,space:0,seed:3},flip:{preset:'pop',pitch:7,length:.35,space:.1,seed:4},win:{preset:'success',pitch:0,length:.8,space:.2,seed:5},click:{preset:'tap',pitch:2,length:.5,space:0,seed:6}};
for(const[name,config]of Object.entries(effects)){await writeFile('audio-source/'+name+'.json',JSON.stringify(config,null,2));const [l,r]=renderAnySfx(config,sr);await writeFile('assets/audio/'+name+'.wav',encodeWav(l,r,sr,16));console.log(name,l.length/sr);}
console.log('Audio rendered. BGM seconds:',L.length/out.sr);
