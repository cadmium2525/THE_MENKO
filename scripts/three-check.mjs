import {createRequire} from 'node:module';import {pathToFileURL} from 'node:url';import path from 'node:path';import {writeFile,mkdir,readFile} from 'node:fs/promises';import assert from 'node:assert/strict';import {createDesign} from '../src/model.js';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE_JSON||import.meta.url);const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 await mkdir('test-results',{recursive:true});const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const url=process.env.MENKO_TEST_URL||pathToFileURL(path.resolve('THE-MENKO.html')).href;
 if(url==='http://menko.test/')await page.route('http://menko.test/**',async route=>{
 const file=path.resolve('.','.'+decodeURIComponent(new URL(route.request().url()).pathname));
 if(!file.startsWith(process.cwd()+path.sep)&&file!==process.cwd()){await route.abort();return;}
 const target=file===process.cwd()?path.resolve('index.html'):file;
 await route.fulfill({body:await readFile(target),contentType:({'.html':'text/html','.js':'text/javascript','.css':'text/css','.jpg':'image/jpeg','.svg':'image/svg+xml','.wav':'audio/wav'})[path.extname(target)]||'application/octet-stream'});
});
 await page.goto(url);await page.waitForTimeout(400);assert.equal(await page.locator('#hero').getAttribute('data-renderer'),'three');await page.screenshot({path:'test-results/3d-home.png'});
 const design={...createDesign('star'),size:1,thickness:1};
 // Use a large circular handmade card for the strongest wind; a drawn mark must survive into its texture.
 design.points=createDesign().points;design.kind='custom';design.name='風の一枚';design.front.strokes=[{color:'#282b27',width:.09,points:[{x:-.6,y:0},{x:.5,y:0},{x:0,y:.6}]}];
 await page.evaluate(d=>localStorage.setItem('the-menko-v1',JSON.stringify({designs:[d],settings:{sound:false,reduced:false}})),design);await page.reload();
 const click=async a=>{await page.locator(`[data-action="${a}"]`).first().click();await page.waitForTimeout(180);};
 await click('quick');await page.screenshot({path:'test-results/3d-custom.png'});assert.equal(await page.locator('#preview').getAttribute('data-renderer'),'three');
 await click('duel');await click('field-3');await click('ready');await click('musou');assert.match(await page.locator('h2').textContent(),/ひだまり/);assert.equal(await page.locator('[data-action="start"]').count(),0);assert.equal(await page.locator('.field-picker').count(),0);assert.ok(await page.locator('#arena').isVisible());await page.screenshot({path:'test-results/3d-aim.png'});
 const fire=async()=>{const b=await page.locator('#arena').boundingBox();await page.touchscreen.tap(b.x+b.width*.5,b.y+b.height*.55);};
 await fire();await page.waitForTimeout(500);await page.screenshot({path:'test-results/3d-contact.png'});await page.waitForTimeout(650);await page.screenshot({path:'test-results/3d-flight.png'});await page.waitForTimeout(1000);await page.screenshot({path:'test-results/3d-wig.png'});
 assert.match(await page.locator('#arena-overlay').textContent(),/カツラ/);const first=await page.evaluate(()=>__MENKO_3D__.info);await page.waitForTimeout(300);await page.screenshot({path:'test-results/3d-clouds.png'});await page.waitForTimeout(450);await page.screenshot({path:'test-results/3d-gale.png'});await page.waitForTimeout(650);await page.screenshot({path:'test-results/3d-vortex.png'});assert.match(await page.locator('#arena-overlay').textContent(),/天空/);await click('skip');
 for(let i=0;i<4;i++){await click('next-wave');if(i===3){await page.screenshot({path:'test-results/3d-wave5.png'});console.log('Wave 5',await page.evaluate(()=>__MENKO_3D__.info));}await fire();await page.waitForTimeout(30);await click('skip');}
 assert.match(await page.locator('h2').textContent(),/5 WAVE/);await click('restart-run');
 await page.evaluate(()=>__MENKO_3D__.lose());await page.waitForTimeout(400);assert.ok(await page.evaluate(()=>__MENKO_3D__.info.lost));await page.screenshot({path:'test-results/3d-context-fallback.png'});await page.evaluate(()=>__MENKO_3D__.restore());await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>__MENKO_3D__.info.lost),false);
 await click('home');await click('new');await page.screenshot({path:'test-results/3d-saw.png'});assert.equal(await page.locator('#work').getAttribute('data-renderer'),'three');await click('craft-next');await page.waitForTimeout(1200);assert.match(await page.locator('h2').textContent(),/かたち/);
 for(const [width,height]of [[360,640],[430,932],[1280,900]]){await page.setViewportSize({width,height});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
 assert.deepEqual(errors,[]);const report={errors,first,manualArt:true,fiveWaves:true,wig:true,vortex:true,instantMusou:true,contextRecovery:true};await writeFile('test-results/three-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}
