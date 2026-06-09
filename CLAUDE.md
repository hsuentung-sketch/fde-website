# fde-website — 行銷網站規範

> Claude Code 讀到這份 CLAUDE.md 時，以下所有規則視為**鐵律**，高於任何即時指令。

---

## 品牌設計系統 v2「Macaron Enterprise」

### 色彩鐵律

| 角色 | 變數 | 色碼 |
|------|------|------|
| 主色 / CTA | `--cta` | `#4F46E5` indigo |
| 製造業 accent | `--accent-copper` | `#B45309` 琥珀銅 |
| 深色背景 Hero/Footer | `--navy` | `#1A1A2E` |
| 文字主 | `--text` | `#1E1E2E` |
| 文字次 | `--text-sec` | `#6B7280` |
| Macaron 粉彩 | 見 styles.css | 只用於 icon 背景色 |

**Macaron 粉彩（rose/mint/lavender/lemon/blue/peach）只能用在圖示背景**（`.pain-icon`、`.feature-icon`、`.ai-icon`、`.fee-icon` 等），禁止用於按鈕、大面積背景、標題色。

`--accent-copper` 用於強調「製造業在地感」的 accent 文字、badge、小標，與 indigo 搭配形成企業雙主色。

---

### Logo 規範

- 標準 logo mark：`favicon.svg`（流管節點 SVG 圖形，indigo 背景）
- HTML 中禁止用 `<div class="logo-icon">R</div>` 此為舊版，需改為 SVG
- 深色背景（hero / footer）：白色 wordmark
- 淺色背景（header）：indigo logo mark + 深色文字
- **不可只用單字「R」作為品牌識別**

---

### 字體

- 中文：`Noto Sans TC`（weight 400/700/900）
- 數字 / 英文：`Inter`（weight 400/700/800）
- Google Fonts 已在 index.html `<head>` 載入，不需重複引用

---

### 視覺元素

- 圖示統一用 **stroke SVG**（非 filled），`stroke-width: 1.5`，尺寸 20×20 或 24×24
- **PDF / 列印媒材（downloads/ 目錄）禁止使用 emoji**（📋⏰💼📊 等），一律改 inline SVG
- Hero section 必須包含視覺化 mockup（現有 CNC 機台看板），不可退化成純文字
- 圖表優先於文字說明（能用 SVG bar chart 呈現的數字不要只寫文字）

---

### 文案語氣鐵律（Tone of Voice）

**以廠長 / 老闆視角說話，不以工程師視角。**

- 具體數字 > 模糊形容（「30 分鐘」好過「大量節省時間」）
- 允許的口吻：直接、帶一點黑色幽默、承認困難、用製造業日常詞彙（師傅、派工、架機、公差、良率）
- **禁止的詞**：量身打造、賦能、生態系、全方位、智慧化、無縫接軌、一鍵（除非真的只要一鍵）、數位轉型加速（不要用這種大詞）
- 客戶聲音段落：用第三人稱敘述（「樂奇精密製造部主管說」），不用假造的引號
- 標題不用問號結尾（消費品行銷手法，B2B 製造業不適用）

---

## 專案結構

```
fde-website/
├── index.html          主頁（行銷 landing page）
├── styles.css          共用 CSS（設計系統，改這裡影響全站）
├── script.js           互動功能（modal、scroll animation、nav）
├── favicon.svg         品牌 logo mark
├── cases/
│   ├── precision-machining.html   精密金屬加工案例
│   ├── waste-management.html      廢棄物管理案例
│   └── general-erp.html           流通貿易 ERP 案例
└── downloads/
    ├── pdf-styles.css             PDF 專用樣式
    ├── precision-machining-case.html   精密加工 PDF 原始碼
    ├── generate-pdf.mjs           Puppeteer PDF 產生腳本
    └── ...（其他行業同結構）
```

---

## 開發紀律

- CSS 改動**必須確認** RWD 320px / 768px / 1200px 三個斷點
- 新 section 遵守 `--section-py: 96px` 間距
- 每次重大改動後更新 `DESIGN-LOG.md`
- 新增行業案例：複製 `cases/precision-machining.html` 當模板，不要從空白開始
- PDF 重新產生：`cd downloads && node generate-pdf.mjs`
- GitHub Pages 部署：`git push origin main`（Actions 自動部署）

---

## 重要外部連結

- **正式網站**：`https://hsuentung-sketch.github.io/fde-website/`
- **聯絡信箱**：`runtong.tw@gmail.com`
- **所有 CTA 都指向這個信箱**，尚無 form 後端
