// 樂奇精密後台截圖腳本（匿名化版）
// 使用：node capture-screenshots.mjs
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, 'screenshots');
const BASE = 'http://localhost:3000';
const LOGIN_EMAIL = 'admin@demo.com';
const LOGIN_PASSWORD = 'admin123';

// 匿名化注入：替換品牌、隱藏 admin email
const ANON_CSS = `
  /* 隱藏右上角 admin info */
  .topbar > div:last-child, .topbar .user, .topbar .user-info,
  [class*="user-email"], [data-role="user-email"],
  .topbar [class*="logout"], .topbar a[href*="logout"] { visibility: hidden !important; }
`;
const ANON_JS = `
  // 客戶名稱對照表（依出現順序 stable mapping）
  const CUSTOMER_MAP = new Map();
  const VENDOR_MAP = new Map();
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // 已知真實公司名（demo seed 用的）+ 通用偵測規則
  const KNOWN_CUSTOMERS = [
    '大立光電','上銀科技','力成科技','友達光電','日月光半導體','日月光',
    '台積電','聯電','鴻海','華邦電','旺宏','南亞科','聯發科','聯詠',
    '世界先進','穩懋','宏達電','華碩','和碩','廣達','緯創','仁寶',
    '英業達','研華','凌華','研鼎','技嘉','微星','華映',
    'FOXCONN','TSMC','UMC','MTK','ASE','MXIC','TXN','STM'
  ];
  const KNOWN_VENDORS = ['立揚電鍍','永興表面處理','新光熱處理','東元電鍍','元大表處'];

  function anonymizeCustomer(name) {
    if (!name) return name;
    let n = name.trim();
    for (const k of KNOWN_CUSTOMERS) {
      if (n.includes(k)) {
        if (!CUSTOMER_MAP.has(k)) {
          const i = CUSTOMER_MAP.size;
          const letter = CHARS[i % 26] + (i >= 26 ? Math.floor(i/26) : '');
          CUSTOMER_MAP.set(k, letter + ' 客戶');
        }
        return n.replace(new RegExp(k, 'g'), CUSTOMER_MAP.get(k));
      }
    }
    return n;
  }
  function anonymizeVendor(name) {
    if (!name) return name;
    for (const k of KNOWN_VENDORS) {
      if (name.includes(k)) {
        if (!VENDOR_MAP.has(k)) {
          const i = VENDOR_MAP.size;
          VENDOR_MAP.set(k, '外協廠 ' + (i+1));
        }
        return name.replace(new RegExp(k, 'g'), VENDOR_MAP.get(k));
      }
    }
    return name;
  }
  // 料號中也有 FOXCONN/TSMC 等品牌字串 → 也替換
  function anonymizePartNumber(text) {
    let t = text;
    ['FOXCONN','TSMC','UMC','MTK','ASE','MXIC','TXN','STM'].forEach((b, i) => {
      t = t.replace(new RegExp(b, 'g'), 'CUST' + String.fromCharCode(65+i));
    });
    return t;
  }

  function renameBrand() {
    document.querySelectorAll('*').forEach(el => {
      if (el.children.length === 0 && el.textContent) {
        const t = el.textContent.trim();
        if (!t) return;
        // 品牌
        if (t === '樂奇精密 ERP' || t === '樂奇精密') {
          el.textContent = '精密金屬加工廠 ERP';
          return;
        }
        // 客戶 / 廠商 / 料號
        const anon1 = anonymizeCustomer(t);
        const anon2 = anonymizeVendor(anon1);
        const anon3 = anonymizePartNumber(anon2);
        if (anon3 !== t) {
          el.textContent = el.textContent.replace(t, anon3);
        }
      }
    });
    document.title = document.title.replace(/樂奇精密/g, '精密金屬加工廠');
  }
  renameBrand();
  window.addEventListener('hashchange', () => setTimeout(renameBrand, 1000));
  // 重複跑（資料 async 載入）
  setInterval(renameBrand, 1200);
  window._renameBrand = renameBrand;
`;

const SHOTS = [
  { name: '01-dashboard',          hash: '#/',                       wait: 4000 },
  { name: '02-machine-board',      hash: '#/machine-board',          wait: 7000 },
  { name: '03-production-tracker', hash: '#/production',            wait: 5000 },
  { name: '04-dispatch',           hash: '#/dispatch',               wait: 5000 },
  { name: '07-drawing-ingest',     hash: '#/drawing-ingest',         wait: 4000 },
  { name: '08-outsource',          hash: '#/outsource',              wait: 4000 },
  { name: '09-shipment',           hash: '#/shipment',               wait: 4000 },
  { name: '10-log-viewer',         hash: '#/log',                    wait: 4000 },
];

// LIFF 走另外 URL
const LIFF_SHOTS = [
  { name: '05-liff-operator',  url: `${BASE}/liff/`,         viewport: { width: 414, height: 896 }, wait: 2500 },
  { name: '06-liff-card-detail', url: `${BASE}/liff/`,       viewport: { width: 414, height: 896 }, wait: 2500, postNav: async (page) => {
    await new Promise(r => setTimeout(r, 1500));
    const link = await page.$('a[href*="card"], .card-item, li a');
    if (link) await link.click();
    await new Promise(r => setTimeout(r, 2500));
  }},
];

async function login(page) {
  await page.goto(`${BASE}/admin/login.html`, { waitUntil: 'networkidle2' });
  await page.type('input[type=email],input[name="email"]', LOGIN_EMAIL);
  await page.type('input[type=password]', LOGIN_PASSWORD);
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {}),
    page.click('button[type=submit],form button'),
  ]);
  await new Promise(r => setTimeout(r, 1500));
}

async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--lang=zh-TW'],
    defaultViewport: { width: 1440, height: 900 },
  });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  console.log('Logging in...');
  await login(page);

  // 注入匿名化
  await page.addStyleTag({ content: ANON_CSS });
  await page.evaluate(ANON_JS);

  // Admin shots
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

  // LIFF shots（不同 viewport）
  for (const shot of LIFF_SHOTS) {
    console.log(`📸 ${shot.name} (LIFF)`);
    await page.setViewport(shot.viewport);
    try {
      await page.goto(shot.url, { waitUntil: 'networkidle2', timeout: 10000 });
      await new Promise(r => setTimeout(r, shot.wait));
      if (shot.postNav) await shot.postNav(page);
      await page.addStyleTag({ content: ANON_CSS }).catch(() => {});
      const out = path.join(OUT_DIR, `${shot.name}.png`);
      await page.screenshot({ path: out, fullPage: false });
      console.log(`   → ${out}`);
    } catch (e) {
      console.log(`   ⚠ ${shot.name} skipped: ${e.message}`);
    }
  }

  await browser.close();
  console.log('\n✅ Done');
}

main().catch(err => { console.error(err); process.exit(1); });
