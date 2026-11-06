import {build} from 'esbuild';
import {mkdir,copyFile} from 'node:fs/promises';
await mkdir('assets/vendor',{recursive:true});
await build({entryPoints:['node_modules/three/build/three.module.js'],bundle:true,format:'iife',globalName:'MENKO_THREE',minify:true,outfile:'assets/vendor/three.min.js'});
await copyFile('node_modules/three/LICENSE','assets/vendor/THREE-LICENSE.txt');
