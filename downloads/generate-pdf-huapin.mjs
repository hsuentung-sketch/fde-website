// 華品環保案例 PDF 生成
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML_FILE = path.join(__dirname, 'waste-management-case.html');
const PDF_FILE  = path.join(__dirname, 'waste-management-case.pdf');

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--lang=zh-TW'] });
const page = await browser.newPage();
await page.goto(pathToFileURL(HTML_FILE).href, { waitUntil: 'networkidle0', timeout: 60000 });
await page.evaluateHandle('document.fonts.ready');
await new Promise(r => setTimeout(r, 1500));

await page.pdf({
  path: PDF_FILE,
  format: 'A4',
  printBackground: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  preferCSSPageSize: true,
});
await browser.close();
const sz = fs.statSync(PDF_FILE);
console.log(`PDF: ${PDF_FILE}`);
console.log(`Size: ${(sz.size/1024/1024).toFixed(2)} MB`);
