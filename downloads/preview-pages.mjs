import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.join(__dirname, 'precision-machining-case.html');

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 1.4 });
await page.goto(pathToFileURL(HTML).href, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');
await new Promise(r => setTimeout(r, 1500));

const pages = await page.$$('.page');
console.log('Total pages:', pages.length);
// Take previews of first 4 pages
const idx = [0, 1, 5, 10];
for (const i of idx) {
  if (pages[i]) {
    await pages[i].screenshot({ path: path.join(__dirname, `preview-p${i+1}.png`) });
    console.log('saved preview-p' + (i+1) + '.png');
  }
}
await browser.close();
