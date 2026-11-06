import {mkdir,cp,readFile,writeFile} from 'node:fs/promises';
await mkdir('dist',{recursive:true});
for(const file of ['index.html','src','assets','.nojekyll'])await cp(file,'dist/'+file,{recursive:true});
console.log('GitHub Pages static build: dist/');
// A self-contained edition also works by double-click, with no server or network.
const audio={};for(const name of ['bgm','hit','cut','flip','win','click'])audio[name]='data:audio/wav;base64,'+(await readFile('assets/audio/'+name+'.wav')).toString('base64');
const background='data:image/jpeg;base64,'+(await readFile('assets/environment/yard.jpg')).toString('base64');
let source='';for(const file of ['model','effects','cinematic','render','audio','app'])source+=(await readFile('src/'+file+'.js','utf8')).replace(/^import .*;\r?\n/gm,'').replace(/^export /gm,'')+'\n';
source=source.replace("new URL('../assets/audio/'+name+'.wav',import.meta.url)",'window.__MENKO_AUDIO__[name]');
let html=await readFile('index.html','utf8');html=html.replace('<link rel="stylesheet" href="src/style.css">','<style>'+await readFile('src/style.css','utf8')+'</style>').replace('href="assets/icon.svg"','href="data:image/svg+xml,'+encodeURIComponent(await readFile('assets/icon.svg','utf8'))+'"').replace('<script type="module" src="src/app.js"></script>','<script>window.__MENKO_AUDIO__='+JSON.stringify(audio)+';window.__MENKO_BACKGROUND__='+JSON.stringify(background)+';(()=>{\n'+source+'\n})();</script>');
await writeFile('THE-MENKO.html',html);console.log('Standalone edition: THE-MENKO.html');
