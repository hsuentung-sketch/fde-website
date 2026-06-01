// 華品環保案例 PPTX 生成
import puppeteer from 'puppeteer';
import PptxGenJS from 'pptxgenjs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_FILE = path.join(__dirname, 'waste-management-case.html');
const TEMP_DIR  = path.join(__dirname, 'pptx-temp-huapin');
const PPTX_FILE = path.join(__dirname, 'waste-management-case.pptx');

const PAGE_W = 1240;
const PAGE_H = 1754;

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

console.log('[1/3] Capturing pages...');
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport({ width: PAGE_W, height: PAGE_H, deviceScaleFactor: 1.5 });
await page.goto(pathToFileURL(HTML_FILE).href, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluateHandle('document.fonts.ready');
await new Promise(r => setTimeout(r, 1500));

const pages = await page.$$('.page');
console.log(`Found ${pages.length} pages`);
const pngFiles = [];
for (let i = 0; i < pages.length; i++) {
  const file = path.join(TEMP_DIR, `p${String(i+1).padStart(2,'0')}.png`);
  await pages[i].screenshot({ path: file });
  pngFiles.push(file);
}
await browser.close();

console.log('[2/3] Building PPTX...');
const pptx = new PptxGenJS();
pptx.title = '環保清運公司案例 — 潤樋科技 FDE';
pptx.author = '潤樋科技';
pptx.layout = 'LAYOUT_WIDE';
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;
const IMG_H = SLIDE_H;
const IMG_W = SLIDE_H * (210/297);
const IMG_X = (SLIDE_W - IMG_W) / 2;

for (let i = 0; i < pngFiles.length; i++) {
  const slide = pptx.addSlide();
  slide.background = { color: '1A1A2E' };
  slide.addImage({ path: pngFiles[i], x: IMG_X, y: 0, w: IMG_W, h: IMG_H });
  slide.addText(`${i+1} / ${pngFiles.length}`, {
    x: 0.3, y: SLIDE_H - 0.4, w: 1.5, h: 0.3,
    fontSize: 9, color: '94A3B8', fontFace: 'Noto Sans TC',
  });
  slide.addText('潤樋科技 · runtong.tw@gmail.com', {
    x: SLIDE_W - 5, y: SLIDE_H - 0.4, w: 4.7, h: 0.3,
    fontSize: 9, color: '94A3B8', fontFace: 'Noto Sans TC', align: 'right',
  });
}

console.log('[3/3] Writing PPTX...');
await pptx.writeFile({ fileName: PPTX_FILE });
const sz = fs.statSync(PPTX_FILE);
console.log(`PPTX: ${PPTX_FILE}`);
console.log(`Size: ${(sz.size/1024/1024).toFixed(2)} MB`);

for (const f of pngFiles) fs.unlinkSync(f);
fs.rmdirSync(TEMP_DIR);
