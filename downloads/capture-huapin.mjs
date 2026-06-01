// 華品環保後台截圖腳本（匿名化版）
// 用法：node capture-huapin.mjs
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'screenshots-huapin');
const BASE = 'http://localhost:3001';
const LOGIN_EMAIL = 'admin@demo.com';
const LOGIN_PASSWORD = 'admin123';

const ANON_CSS = `
  .topbar > div:last-child, .topbar .user, .topbar .user-info,
  [class*="user-email"], [data-role="user-email"],
  .topbar [class*="logout"], .topbar a[href*="logout"] { visibility: hidden !important; }
`;

const ANON_JS = `
  // 已知真實/seed 公司名稱 → 匿名化
  const CUSTOMER_MAP = new Map();
  const VENDOR_MAP = new Map();
  const DRIVER_MAP = new Map();
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // 常見半導體大廠、demo seed 用的廠商名（保險起見）
  const KNOWN_CUSTOMERS = [
    '大立光電','上銀科技','力成科技','友達光電','日月光半導體','日月光',
    '台積電','聯電','鴻海','華邦電','旺宏','南亞科','聯發科','聯詠',
    '世界先進','穩懋','宏達電','華碩','和碩','廣達','緯創','仁寶',
    '英業達','研華','凌華','研鼎','技嘉','微星','華映',
    '統一企業','味全','光泉','義美','大成',
    'FOXCONN','TSMC','UMC','MTK','ASE','MXIC'
  ];
  const KNOWN_VENDORS = ['山隆','台糖','統一','立揚','永興','新光','和泰','中鋼','台塑'];
  const KNOWN_DRIVERS = ['王大明','李志強','陳明德','張志豪','林俊傑','黃志明','吳建宏'];

  function mapName(map, key, prefix) {
    if (!map.has(key)) {
      const i = map.size;
      const letter = CHARS[i % 26];
      map.set(key, prefix + ' ' + letter);
    }
    return map.get(key);
  }

  function anonymize(text) {
    if (!text) return text;
    let t = text;
    for (const k of KNOWN_CUSTOMERS) {
      if (t.includes(k)) t = t.replace(new RegExp(k, 'g'), mapName(CUSTOMER_MAP, k, '客戶'));
    }
    for (const k of KNOWN_VENDORS) {
      if (t.includes(k)) t = t.replace(new RegExp(k, 'g'), mapName(VENDOR_MAP, k, '供應商'));
    }
    for (const k of KNOWN_DRIVERS) {
      if (t.includes(k)) t = t.replace(new RegExp(k, 'g'), mapName(DRIVER_MAP, k, '司機'));
    }
    return t;
  }

  function renameBrand() {
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0 && el.textContent) {
        const t = el.textContent.trim();
        if (!t) return;
        // 品牌
        if (t === '華品環保 ERP' || t === '華品環保') {
          el.textContent = '環保清運公司 ERP';
          return;
        }
        const anon = anonymize(t);
        if (anon !== t) {
          el.textContent = el.textContent.replace(t, anon);
        }
      }
    });
    document.title = document.title.replace(/華品環保/g, '環保清運公司');
  }
  renameBrand();
  window.addEventListener('hashchange', () => setTimeout(renameBrand, 1000));
  window._renameBrand = renameBrand;
`;

const SHOTS = [
  { name: '01-dashboard',       hash: '#/',                       wait: 4500 },
  { name: '02-dispatch',        hash: '#/dispatch',               wait: 5000 },
  { name: '03-quotation',       hash: '#/sales/quotation',        wait: 4500 },
  { name: '04-route-billing',   hash: '#/dispatch/route/billing', wait: 4500 },
  { name: '05-fuel',            hash: '#/fuel',                   wait: 4500 },
  { name: '06-fleet',           hash: '#/fleet',                  wait: 4500 },
  { name: '07-accounting',      hash: '#/accounting',             wait: 4500 },
  { name: '08-analytics',       hash: '#/analytics',              wait: 6000 },
  { name: '09-maintenance',     hash: '#/maintenance',            wait: 4500 },
  { name: '10-log',             hash: '#/log',                    wait: 4500 },
];

const LIFF_SHOTS = [
  { name: '11-liff-driver',  url: `${BASE}/liff/`, viewport: { width: 414, height: 896 }, wait: 3000 },
];

async function login(page) {
  // 華品 CORS 只接受 :3000，puppeteer fetch from :3001 會被擋
  // 改：直接從 node 端 curl-style 拿 token，再注入到 localStorage
  const tokenRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: LOGIN_EMAIL, password: LOGIN_PASSWORD }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Login API failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const data = await tokenRes.json();

  // 先 goto login.html 讓 origin 對齊，再注入 localStorage
  await page.goto(`${BASE}/admin/login.html`, { waitUntil: 'networkidle2' });
  await page.evaluate((d) => {
    localStorage.setItem('huapin.token', d.accessToken);
    localStorage.setItem('huapin.refreshToken', d.refreshToken);
    localStorage.setItem('huapin.user', JSON.stringify(d.user));
  }, data);
  await page.goto(`${BASE}/admin/index.html#/`, { waitUntil: 'networkidle2' });
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

  for (const shot of LIFF_SHOTS) {
    console.log(`📸 ${shot.name} (LIFF)`);
    await page.setViewport(shot.viewport);
    try {
      await page.goto(shot.url, { waitUntil: 'networkidle2', timeout: 10000 });
      await new Promise(r => setTimeout(r, shot.wait));
      await page.addStyleTag({ content: ANON_CSS }).catch(() => {});
      const out = path.join(OUT_DIR, `${shot.name}.png`);
      await page.screenshot({ path: out, fullPage: false });
      console.log(`   → ${out}`);
    } catch (e) {
      console.log(`   ⚠ skipped: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\n✅ Done');
}

main().catch(err => { console.error(err); process.exit(1); });
