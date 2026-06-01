// 將 precision-machining-case.html 每頁截成 PNG，組成 PPT
// 用法：node generate-pptx.mjs
import puppeteer from 'puppeteer';
import PptxGenJS from 'pptxgenjs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_FILE = path.join(__dirname, 'precision-machining-case.html');
const TEMP_DIR  = path.join(__dirname, 'pptx-temp');
const PPTX_FILE = path.join(__dirname, 'precision-machining-case.pptx');

// A4 直式比例 = 210:297。截圖用 1240×1754（A4 @ 150 DPI）
const PAGE_W = 1240;
const PAGE_H = 1754;

async function main() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error('HTML not found:', HTML_FILE);
    process.exit(1);
  }
  if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

  console.log('[1/3] Capturing page screenshots...');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: PAGE_W, height: PAGE_H, deviceScaleFactor: 1.5 });
  await page.goto(pathToFileURL(HTML_FILE).href, { waitUntil: 'networkidle0', timeout: 60000 });
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1500));

  const pages = await page.$$('.page');
  console.log(`  Found ${pages.length} pages`);

  const pngFiles = [];
  for (let i = 0; i < pages.length; i++) {
    const file = path.join(TEMP_DIR, `page-${String(i+1).padStart(2,'0')}.png`);
    await pages[i].screenshot({ path: file, omitBackground: false });
    pngFiles.push(file);
    process.stdout.write(`  saved ${i+1}/${pages.length}\r`);
  }
  console.log('');
  await browser.close();

  console.log('[2/3] Building PPTX...');
  const pptx = new PptxGenJS();
  pptx.title = '精密金屬加工廠案例 — 潤樋科技 FDE';
  pptx.subject = 'FDE 自動化流程優化服務';
  pptx.author = '潤樋科技 RunTong Tech';
  pptx.company = '潤樋科技';

  // 16:9 layout, 13.333 × 7.5 inches
  pptx.layout = 'LAYOUT_WIDE';
  const SLIDE_W = 13.333;
  const SLIDE_H = 7.5;

  // A4 直式圖在 16:9 投影片：以高度為基準
  // 圖高 = SLIDE_H、圖寬 = SLIDE_H × (210/297) = 7.5 × 0.7071 ≈ 5.303
  const IMG_H = SLIDE_H;
  const IMG_W = SLIDE_H * (210/297);
  const IMG_X = (SLIDE_W - IMG_W) / 2;
  const IMG_Y = 0;

  for (let i = 0; i < pngFiles.length; i++) {
    const slide = pptx.addSlide();
    // 深藍背景（同設計系統 --navy #1A1A2E）
    slide.background = { color: '1A1A2E' };
    // 兩側裝飾色塊（macaron lavender 微光）
    slide.addShape('rect', {
      x: 0, y: 0, w: IMG_X, h: SLIDE_H,
      fill: { type: 'solid', color: '1A1A2E' },
      line: { width: 0 },
    });
    slide.addShape('rect', {
      x: SLIDE_W - IMG_X, y: 0, w: IMG_X, h: SLIDE_H,
      fill: { type: 'solid', color: '1A1A2E' },
      line: { width: 0 },
    });
    // 頁面圖
    slide.addImage({
      path: pngFiles[i],
      x: IMG_X,
      y: IMG_Y,
      w: IMG_W,
      h: IMG_H,
    });
    // 左下角頁碼 + 品牌（白色小字）
    slide.addText(`${i+1} / ${pngFiles.length}`, {
      x: 0.3, y: SLIDE_H - 0.4, w: 1.5, h: 0.3,
      fontSize: 9, color: '94A3B8', fontFace: 'Noto Sans TC', align: 'left',
    });
    slide.addText('潤樋科技 RunTong Tech · runtong.tw@gmail.com', {
      x: SLIDE_W - 5, y: SLIDE_H - 0.4, w: 4.7, h: 0.3,
      fontSize: 9, color: '94A3B8', fontFace: 'Noto Sans TC', align: 'right',
    });
    process.stdout.write(`  slide ${i+1}/${pngFiles.length}\r`);
  }
  console.log('');

  console.log('[3/3] Writing PPTX file...');
  await pptx.writeFile({ fileName: PPTX_FILE });
  const stats = fs.statSync(PPTX_FILE);
  console.log(`\nPPTX generated: ${PPTX_FILE}`);
  console.log(`Size: ${(stats.size/1024/1024).toFixed(2)} MB`);

  // 清理 temp PNG
  for (const f of pngFiles) fs.unlinkSync(f);
  fs.rmdirSync(TEMP_DIR);
  console.log('Temp files cleaned.');
}

main().catch(err => { console.error(err); process.exit(1); });
