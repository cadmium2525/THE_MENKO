import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
const require=createRequire(process.env.PLAYWRIGHT_PACKAGE_JSON||import.meta.url);
const {chromium}=require('playwright');
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));
 await page.goto(process.env.MENKO_TEST_URL||pathToFileURL(path.resolve('THE-MENKO.html')).href);
 const click=async a=>{await page.locator(`[data-action="${a}"]`).first().click();await page.waitForTimeout(150);};
 await click('quick');await click('duel');await click('local');await click('start');
 const fire=async(x,y)=>{const b=await page.locator('#arena').boundingBox();await page.touchscreen.tap(b.x+x*b.width,b.y+y*b.height);};
 await fire(.52,.51);await page.waitForTimeout(700);await page.screenshot({path:'test-results/duel-overlap.png'});await click('skip');
 assert.match(await page.locator('h2').textContent(),/重なった/);
 assert.match(await page.locator('.record-line').textContent(),/1P 0 ― 0/);
 await click('next-turn');await fire(.42,.60);await page.waitForTimeout(1000);await page.screenshot({path:'test-results/duel-edge.png'});await click('skip');
 assert.match(await page.locator('h2').textContent(),/一本/);
 assert.match(await page.locator('.record-line').textContent(),/1P 0 ― 1/);
 assert.deepEqual(errors,[]);console.log('Overlap misses; adjacent ground flips; scores 0–1; browser errors 0.');
}finally{await browser.close();}
