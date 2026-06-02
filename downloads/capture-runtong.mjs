// 潤樋 ERP 後台截圖腳本（匿名化版）
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'screenshots-runtong');
const BASE = 'http://localhost:3002';
const LOGIN_EMPID = 'E0004';  // ADMIN
const LOGIN_PASSWORD = 'demo1234';

const ANON_CSS = `
  /* 隱藏右上 admin info */
  .topbar > div:last-child, .topbar .user, .topbar .user-info,
  [class*="user-email"], [data-role="user-email"],
  .topbar [class*="logout"], .topbar a[href*="logout"] { visibility: hidden !important; }
`;

const ANON_JS = `
  function renameBrand() {
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0 && el.textContent) {
        const t = el.textContent.trim();
        if (!t) return;
        if (t === '某環保公司' || t === '潤樋實業' || t.includes('某環保公司')) {
          el.textContent = el.textContent.replace(/某環保公司/g, '一般貿易公司');
        }
      }
    });
    document.title = (document.title || '').replace(/某環保公司/g, '一般貿易公司');
  }
  renameBrand();
  window.addEventListener('hashchange', () => setTimeout(renameBrand, 1000));
  window._renameBrand = renameBrand;
`;

const SHOTS = [
  { name: '01-dashboard',     hash: '#dashboard',              wait: 3500 },
  { name: '02-customers',     hash: '#customers',              wait: 4000 },
  { name: '03-quotations',    hash: '#sales/quotations',       wait: 3500 },
  { name: '04-sales-orders',  hash: '#sales/sales-orders',     wait: 4000 },
  { name: '05-purchase',      hash: '#purchase/purchase-orders', wait: 3500 },
  { name: '06-receivables',   hash: '#accounting/receivables', wait: 3500 },
  { name: '07-einvoices',     hash: '#accounting/einvoices',   wait: 3500 },
  { name: '08-journal',       hash: '#acct/journal',           wait: 3500 },
  { name: '09-inventory',     hash: '#acct/inventory',         wait: 3500 },
  { name: '10-audit-logs',    hash: '#admin/audit-logs',       wait: 3500 },
];

async function login(page) {
  // 用 node 端 API 拿 cookie，但 web-auth 是 HTTP-only cookie，需走 form login
  await page.goto(`${BASE}/admin/`, { waitUntil: 'networkidle2' });
  // 直接 fetch API + 用 set-cookie 設 puppeteer cookie
  const cookieResp = await fetch(`${BASE}/api/auth/web/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ employeeId: LOGIN_EMPID, password: LOGIN_PASSWORD }),
  });
  if (!cookieResp.ok) throw new Error(`Login failed: ${cookieResp.status}`);
  const setCookie = cookieResp.headers.get('set-cookie');
  if (!setCookie) throw new Error('No Set-Cookie returned');
  // 解析 cookie 字串
  const cookies = [];
  for (const part of setCookie.split(/,(?=[^;]+=)/)) {
    const [nameVal] = part.split(';');
    const [name, value] = nameVal.split('=').map(s => s.trim());
    cookies.push({ name, value, domain: 'localhost', path: '/' });
  }
  await page.setCookie(...cookies);
  await page.goto(`${BASE}/admin/#dashboard`, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
}

async function main() {
  const fs = await import('fs');
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--lang=zh-TW'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  console.log('Logging in...');
  await login(page);

  await page.addStyleTag({ content: ANON_CSS });
  await page.evaluate(ANON_JS);

  for (const shot of SHOTS) {
    console.log(`📸 ${shot.name} (${shot.hash})`);
    await page.evaluate((h) => { window.location.hash = h; }, shot.hash);
    await new Promise(r => setTimeout(r, shot.wait));
    await page.addStyleTag({ content: ANON_CSS }).catch(() => {});
    await page.evaluate('window._renameBrand && window._renameBrand()').catch(() => {});
    await new Promise(r => setTimeout(r, 600));
    const out = path.join(OUT_DIR, `${shot.name}.png`);
    await page.screenshot({ path: out, fullPage: false });
    console.log(`   → ${out}`);
  }

  await browser.close();
  console.log('\n✅ Done');
}

main().catch(err => { console.error(err); process.exit(1); });
