// 將 precision-machining-case.html 轉為 PDF
// 用法：node generate-pdf.mjs
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_FILE = path.join(__dirname, 'precision-machining-case.html');
const PDF_FILE  = path.join(__dirname, 'precision-machining-case.pdf');

async function main() {
  if (!fs.existsSync(HTML_FILE)) {
    console.error('HTML not found:', HTML_FILE);
    process.exit(1);
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--lang=zh-TW'],
  });
  const page = await browser.newPage();

  const url = pathToFileURL(HTML_FILE).href;
  console.log('Loading:', url);
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

  // 等字體載入
  await page.evaluateHandle('document.fonts.ready');
  await new Promise(r => setTimeout(r, 1500));

  console.log('Generating PDF...');
  await page.pdf({
    path: PDF_FILE,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  await browser.close();

  const stats = fs.statSync(PDF_FILE);
  const sizeKB = (stats.size / 1024).toFixed(1);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
  console.log(`\nPDF generated: ${PDF_FILE}`);
  console.log(`Size: ${sizeKB} KB (${sizeMB} MB)`);
}

main().catch(err => { console.error(err); process.exit(1); });
