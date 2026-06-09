# 交接檔：fde-website 設計升級 v2

**建立日期**：2026-06-08  
**執行環境**：行銷網站 Claude Code session（`D:\Claude\網站資料\fde-website\`）  
**目標**：修正品牌視覺弱點（SWOT W6），對應 A/B/C 三個層級的改動

---

## 執行前確認

```bash
cd "D:\Claude\網站資料\fde-website"
git status   # 確認工作目錄乾淨
git log --oneline -3   # 確認基準 commit
```

---

## 改動總覽

| 層級 | 影響範圍 | 主要改動 |
|------|---------|---------|
| A — 共用品牌 | `favicon.svg`, `styles.css`, `index.html` | Logo SVG / copper accent / 文案改寫 |
| B — 案例頁 | `cases/precision-machining.html` | 客戶聲音 quote block / SVG 效益圖 |
| C — PDF 下載 | `downloads/precision-machining-case.html` | 封面 Logo / 移除 emoji 換 SVG icon |

---

## A1 — 更新 `favicon.svg`（Logo mark 重設計）

**完整替換 `favicon.svg`** 內容為：

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <!-- 流管節點：象徵「潤」(流) + 「樋」(管道) -->
  <rect width="32" height="32" rx="8" fill="#4F46E5"/>
  <!-- 左側輸入管 -->
  <path d="M5 8 L5 14 Q5 18 9 18" stroke="rgba(255,255,255,0.5)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <!-- 中心節點（流程匯聚點） -->
  <circle cx="16" cy="18" r="4" fill="white"/>
  <circle cx="16" cy="18" r="1.8" fill="#4F46E5"/>
  <!-- 右側輸出管 -->
  <path d="M20 18 L26 18 L26 25" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/>
  <!-- 右上輸入管 -->
  <path d="M25 8 L25 13 Q25 18 20 18" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
</svg>
```

---

## A2 — 更新 `styles.css`（新增 copper accent token）

在 `styles.css` 的 `:root` 區塊，找到 `--cta` 所在行附近，在其後新增：

```css
/* === 製造業 accent（copper/琥珀金） === */
--accent-copper:        #B45309;
--accent-copper-light:  #FEF3C7;
--accent-copper-mid:    #D97706;
```

**搜尋目標**（找到這一行）：
```css
  --cta:                 #4F46E5;
```

**插入位置**：在 `--cta` 那行之後加入上面三行。

---

## A3 — 更新 `index.html`（5 處改動）

### A3-1 Logo：移除舊版字母 R，改為 SVG

**找到並替換：**
```html
      <div class="logo-icon">R</div>
      潤樋科技
```

**改為：**
```html
      <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
        <rect width="32" height="32" rx="8" fill="#4F46E5"/>
        <path d="M5 8 L5 14 Q5 18 9 18" stroke="rgba(255,255,255,0.5)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <circle cx="16" cy="18" r="4" fill="white"/>
        <circle cx="16" cy="18" r="1.8" fill="#4F46E5"/>
        <path d="M20 18 L26 18 L26 25" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M25 8 L25 13 Q25 18 20 18" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      </svg>
      潤樋科技
```

---

### A3-2 Hero 副標題：改寫（減少 AI 套話）

**找到：**
```html
        <p class="hero-sub fade-up">
          依你的行業流程量身打造 ERP<br>
          LINE 操作、機台整合、法規合規，4-8 週上線
        </p>
```

**改為：**
```html
        <p class="hero-sub fade-up">
          你的廠怎麼做事，系統就怎麼長<br>
          LINE 操作、機台整合、法規合規，4-8 週上線
        </p>
```

---

### A3-3 關於我們：改寫開頭段落（去除「量身打造」套話）

**找到：**
```html
        <p>潤樋科技專注於中小企業的流程數位化。我們不賣通用軟體，而是深入每個行業的實際作業流程，量身打造真正能用的系統。</p>
        <p>我們的「流程先行」方法論：</p>
```

**改為：**
```html
        <p>見過太多工廠花幾十萬導入 ERP，師傅還是靠紙本。不是不認真學，是那套系統根本沒考慮他們怎麼做事。所以我們換個做法：先跟著你的員工走一遍真實流程，才動手寫系統。</p>
        <p>這四個步驟我們每個客戶都跑過：</p>
```

---

### A3-4 CTA 標題 + 說明：改寫（更直接、減少官腔）

**找到：**
```html
    <h2 class="fade-up">免費流程診斷</h2>
    <p class="fade-up">告訴我們你的行業和痛點<br>我們會先幫你做一份流程診斷報告</p>
```

**改為：**
```html
    <h2 class="fade-up">30 分鐘，先把問題弄清楚</h2>
    <p class="fade-up">不用先決定要不要買系統<br>帶著你現在最頭痛的流程來，我們一起走一遍</p>
```

---

### A3-5 CTA hint 文字：更新

**找到：**
```html
    <p class="cta-hint fade-up">點擊上方按鈕直接寄信，或複製信箱地址聯繫我們</p>
```

**改為：**
```html
    <p class="cta-hint fade-up">點擊上方按鈕直接寄信 — 通常 24 小時內回覆</p>
```

---

## B — 更新 `cases/precision-machining.html`（2 處改動）

### B1 — 客戶聲音 quote block

在案例頁的 **metrics-row（指標列）之後、下一個 section 之前**，插入以下 HTML block。

搜尋目標（找到 metrics 區塊的結束）：
```html
      </div><!-- /.metrics-row -->
```

在其後插入：
```html

      <!-- 客戶聲音 -->
      <div class="fade-up" style="background:var(--bg-lavender,#F0F0FF);border-left:4px solid var(--cta);border-radius:10px;padding:28px 32px;margin:48px 0;position:relative;overflow:hidden">
        <svg style="position:absolute;top:12px;right:16px;opacity:.1" width="56" height="56" viewBox="0 0 24 24" fill="#4F46E5" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
        </svg>
        <p style="font-size:1.05rem;line-height:1.9;color:#1E1E2E;margin-bottom:14px;font-style:italic">「以前廠裡 14 台機台在哪、忙什麼，要走過去看才知道。現在手機一開，哪台在跑、哪台停機，直接就看到了。師傅不用一直被叫去問，廠長出差也能掌握狀況。」</p>
        <div style="font-size:.85rem;color:#6B7280;font-weight:600">— 樂奇精密　製造部主管</div>
      </div>
```

---

### B2 — 效益 SVG 橫條圖（時間節省視覺化）

在案例頁找到 Before/After 對比區域之後，插入以下 SVG 圖表。

搜尋目標（找到 BA 對比區塊結束後的下一個 section 標題，例如 `<h2>系統架構` 或類似的標題行）：

在 BA 對比區塊結束的 `</div>` 後插入：

```html

      <!-- 效益量化圖 -->
      <div class="fade-up" style="margin:48px 0">
        <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:24px;color:#1E1E2E">作業時間對比（分鐘/件）</h3>
        <svg viewBox="0 0 560 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:560px;font-family:'Noto Sans TC',sans-serif">
          <!-- 背景格線 -->
          <line x1="140" y1="10" x2="140" y2="170" stroke="#E5E7EB" stroke-width="1"/>
          <line x1="240" y1="10" x2="240" y2="170" stroke="#E5E7EB" stroke-width="1"/>
          <line x1="340" y1="10" x2="340" y2="170" stroke="#E5E7EB" stroke-width="1"/>
          <line x1="440" y1="10" x2="440" y2="170" stroke="#E5E7EB" stroke-width="1"/>
          <line x1="540" y1="10" x2="540" y2="170" stroke="#E5E7EB" stroke-width="1"/>
          <!-- 刻度標籤 -->
          <text x="140" y="185" text-anchor="middle" font-size="11" fill="#9CA3AF">10</text>
          <text x="240" y="185" text-anchor="middle" font-size="11" fill="#9CA3AF">20</text>
          <text x="340" y="185" text-anchor="middle" font-size="11" fill="#9CA3AF">30</text>
          <text x="440" y="185" text-anchor="middle" font-size="11" fill="#9CA3AF">40</text>
          <text x="540" y="185" text-anchor="middle" font-size="11" fill="#9CA3AF">50 分鐘</text>
          <!-- 行 1：派工安排 -->
          <text x="130" y="35" text-anchor="end" font-size="12" fill="#374151">派工安排</text>
          <rect x="140" y="18" width="420" height="20" rx="4" fill="#FEE2E2" opacity=".5"/>
          <rect x="140" y="18" width="420" height="20" rx="4" fill="#EF4444" opacity=".25"/>
          <rect x="140" y="18" width="84" height="20" rx="4" fill="#4F46E5"/>
          <text x="232" y="33" font-size="11" fill="#EF4444" font-weight="600">前：50 分</text>
          <text x="144" y="33" font-size="11" fill="white" font-weight="700">6 分</text>
          <!-- 行 2：機台狀態確認 -->
          <text x="130" y="80" text-anchor="end" font-size="12" fill="#374151">機台狀態確認</text>
          <rect x="140" y="63" width="300" height="20" rx="4" fill="#FEE2E2" opacity=".5"/>
          <rect x="140" y="63" width="300" height="20" rx="4" fill="#EF4444" opacity=".25"/>
          <rect x="140" y="63" width="40" height="20" rx="4" fill="#4F46E5"/>
          <text x="448" y="78" font-size="11" fill="#EF4444" font-weight="600">前：30 分</text>
          <text x="144" y="78" font-size="11" fill="white" font-weight="700">即時</text>
          <!-- 行 3：製程卡追溯 -->
          <text x="130" y="125" text-anchor="end" font-size="12" fill="#374151">製程卡追溯</text>
          <rect x="140" y="108" width="360" height="20" rx="4" fill="#FEE2E2" opacity=".5"/>
          <rect x="140" y="108" width="360" height="20" rx="4" fill="#EF4444" opacity=".25"/>
          <rect x="140" y="108" width="28" height="20" rx="4" fill="#4F46E5"/>
          <text x="508" y="123" font-size="11" fill="#EF4444" font-weight="600">前：36 分</text>
          <text x="144" y="123" font-size="11" fill="white" font-weight="600">3</text>
          <!-- 圖例 -->
          <rect x="140" y="150" width="12" height="12" rx="2" fill="#4F46E5"/>
          <text x="156" y="161" font-size="11" fill="#374151">導入後</text>
          <rect x="220" y="150" width="12" height="12" rx="2" fill="#EF4444" opacity=".5"/>
          <text x="236" y="161" font-size="11" fill="#374151">導入前</text>
        </svg>
      </div>
```

---

## C — 更新 `downloads/precision-machining-case.html`（3 處改動）

### C1 — 封面 Logo（P1）

**找到：**
```html
    <div class="cover-logo">R</div>
```

**改為：**
```html
    <div class="cover-logo">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:48px;height:48px">
        <rect width="32" height="32" rx="8" fill="white" fill-opacity="0.15"/>
        <path d="M5 8 L5 14 Q5 18 9 18" stroke="rgba(255,255,255,0.6)" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <circle cx="16" cy="18" r="4" fill="white"/>
        <circle cx="16" cy="18" r="1.8" fill="#4F46E5"/>
        <path d="M20 18 L26 18 L26 25" stroke="white" stroke-width="2.2" stroke-linecap="round" fill="none"/>
        <path d="M25 8 L25 13 Q25 18 20 18" stroke="rgba(255,255,255,0.45)" stroke-width="1.8" stroke-linecap="round" fill="none"/>
      </svg>
    </div>
```

### C2 — 頁首 ph-logo（每頁 header 的小 Logo R 字）

**全文替換**（replace_all）：  
把所有出現的 `<span class="ph-logo">R</span>` 改為：

```html
<span class="ph-logo" style="display:inline-flex;align-items:center;justify-content:center"><svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:18px;height:18px"><rect width="32" height="32" rx="8" fill="#4F46E5"/><path d="M5 8 L5 14 Q5 18 9 18" stroke="rgba(255,255,255,0.5)" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="16" cy="18" r="4" fill="white"/><circle cx="16" cy="18" r="1.8" fill="#4F46E5"/><path d="M20 18 L26 18 L26 25" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M25 8 L25 13 Q25 18 20 18" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linecap="round" fill="none"/></svg></span>
```

> 注意：此替換需用 `replace_all: true`，因為所有分頁頁首都有這個元素。

### C3 — P2 emoji icon 全部改 SVG

**找到：**
```html
        <div class="card card-lemon">
          <div class="card-icon icon-lemon">📋</div>
```
**改為：**
```html
        <div class="card card-lemon">
          <div class="card-icon icon-lemon">
            <svg viewBox="0 0 24 24" fill="none" stroke="#92400E" stroke-width="1.5" width="24" height="24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>
          </div>
```

**找到：**
```html
        <div class="card card-rose">
          <div class="card-icon icon-rose">⏰</div>
```
**改為：**
```html
        <div class="card card-rose">
          <div class="card-icon icon-rose">
            <svg viewBox="0 0 24 24" fill="none" stroke="#B91C1C" stroke-width="1.5" width="24" height="24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
```

**找到：**
```html
        <div class="card card-peach">
          <div class="card-icon icon-peach">💼</div>
```
**改為：**
```html
        <div class="card card-peach">
          <div class="card-icon icon-peach">
            <svg viewBox="0 0 24 24" fill="none" stroke="#C2410C" stroke-width="1.5" width="24" height="24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>
          </div>
```

**找到：**
```html
        <div class="card card-blue">
          <div class="card-icon icon-blue">📊</div>
```
**改為：**
```html
        <div class="card card-blue">
          <div class="card-icon icon-blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1D4ED8" stroke-width="1.5" width="24" height="24"><path d="M9 17H7v-7h2m4 7h-2V7h2m4 10h-2v-4h2"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          </div>
```

---

## 執行後驗收

1. 開啟 `index.html` → header logo 顯示流管節點 SVG（不是字母 R）
2. `index.html` About section：開頭段落無「量身打造」字樣
3. `index.html` CTA：標題改為「30 分鐘，先把問題弄清楚」
4. `cases/precision-machining.html` → 有 quote block 與 SVG 橫條圖
5. `downloads/precision-machining-case.html` → 封面無字母 R；P2 icon 全部是 SVG 非 emoji
6. 確認 PDF 重新產生：`cd downloads && node generate-pdf.mjs`（重新產生 precision-machining-case.pdf）

---

## Git commit 建議

```bash
git add favicon.svg styles.css index.html
git commit -m "A: brand logo SVG + copper accent token + copy rewrite"

git add cases/precision-machining.html
git commit -m "B: add customer voice quote + time-savings bar chart"

git add downloads/precision-machining-case.html downloads/precision-machining-case.pdf
git commit -m "C: replace emoji with SVG icons in PDF, update cover logo"
```

---

## DESIGN-LOG.md 更新格式

執行完畢後在 `DESIGN-LOG.md` 最新 entry 的 `Touched modules` 加入：

```
- favicon.svg
- styles.css (--accent-copper token)
- index.html (logo SVG, copy rewrite: hero/about/cta)
- cases/precision-machining.html (customer voice, SVG chart)
- downloads/precision-machining-case.html (cover logo, emoji→SVG)
- downloads/precision-machining-case.pdf (regenerated)
```

---

*交接檔產生於 Cowork session，2026-06-08。如有問題，查 `CLAUDE.md` 規範說明。*
