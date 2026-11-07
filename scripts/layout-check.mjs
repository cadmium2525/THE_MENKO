import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';import path from 'node:path';import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';import {createDesign,makeBoard,simulateShot} from '../src/model.js';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE_JSON||import.meta.url),{chromium}=require('playwright');const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 await mkdir('test-results',{recursive:true});const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.addInitScript(()=>{window.__layoutSeed=1;const original=crypto.getRandomValues.bind(crypto);crypto.getRandomValues=a=>{if(a instanceof Uint32Array&&a.length===1){a[0]=window.__layoutSeed;return a;}return original(a);};});
 await page.goto(process.env.MENKO_TEST_URL||pathToFileURL(path.resolve('THE-MENKO.html')).href);
 const d={...createDesign(),size:1,thickness:1};await page.evaluate(d=>localStorage.setItem('the-menko-v1',JSON.stringify({designs:[d],settings:{sound:false,reduced:false}})),d);await page.reload();
 const click=async a=>{await page.locator(`[data-action="${a}"]`).first().click();await page.waitForTimeout(170);};
 const fire=async aim=>{const b=await page.locator('#arena').boundingBox();await page.touchscreen.tap(b.x+b.width*aim.x,b.y+b.height*aim.y);};
 const score=async()=>Number((await page.locator('.result-number').textContent()).replace(/[^0-9]/g,''));
 await click('quick');await click('musou');assert.doesNotMatch(await page.locator('#counter').textContent(),/\//);await page.screenshot({path:'test-results/random-board.png'});
 await fire({x:.5,y:.55});await click('skip');const center=await score();await click('rematch');
 const board=makeBoard(1,0,1),aim=board.hubs.map(p=>({p,score:simulateShot(board,d,p).count})).sort((a,b)=>b.score-a.score)[0].p;
 await fire(aim);await click('skip');const aimed=await score();assert.ok(aimed>center);await page.evaluate(()=>window.__layoutSeed=3);
 for(let wave=2;wave<=5;wave++){
  await click('next-wave');const b=makeBoard(wave,(wave-1)%4,3),best=b.hubs.map(p=>({p,score:simulateShot(b,d,p).count})).sort((a,b)=>b.score-a.score)[0];
  await fire(best.p);
  if(wave===5){await page.locator('#chain-callout:not(.hidden)').waitFor();await page.screenshot({path:'test-results/offscreen-chain.png'});}
  await click('skip');
 }
 const outsideText=await page.locator('.result-stats').textContent();assert.match(outsideText,/画面外の連鎖/);assert.ok(await score()>640);
 // A new run can use a new board, while rematch above reused the original seed.
 await page.evaluate(()=>window.__layoutSeed=4);await click('restart-run');await page.screenshot({path:'test-results/random-board-new.png'});await fire({x:.5,y:.55});await click('skip');
 assert.deepEqual(errors,[]);const report={errors,center,aimed,offscreen:true,fiveWaves:true,noQuota:true};await writeFile('test-results/layout-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
