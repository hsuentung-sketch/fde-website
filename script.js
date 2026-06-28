/* 潤樋科技 — FDE Demo Site JS v2 */

(function () {
  // ── Intersection Observer: fade-up + stagger ──
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.05 }
  );
  document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

  // ── Count-up animation ──
  const countObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.target, 10);
        const duration = 1500;
        const start = performance.now();
        const initial = parseInt(el.textContent, 10) || 0;

        function tick(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(initial + (target - initial) * eased);
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    },
    { threshold: 0.3 }
  );
  document.querySelectorAll('.count-up').forEach((el) => countObserver.observe(el));

  // ── Hamburger menu ──
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('open');
      document.body.classList.toggle('menu-open', nav.classList.contains('open'));
      hamburger.innerHTML = nav.classList.contains('open') ? '&#10005;' : '&#9776;';
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
        hamburger.innerHTML = '&#9776;';
      });
    });
  }

  // ── Back to top ──
  const btt = document.querySelector('.back-to-top');
  if (btt) {
    window.addEventListener('scroll', () => {
      btt.classList.toggle('show', window.scrollY > 600);
    }, { passive: true });
    btt.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Pain point modal ──
  var painData = {
    'staff-turnover': {
      title: '人員流動快，老闆兼會計到深夜',
      bg: 'var(--mac-lavender)',
      problem: '內勤同事一離職，新人還沒上手，發票要開、應收要追、出貨單要打，全部回到老闆桌上。本來該談生意、跑客戶的時間，全花在補資料、對帳號。等到深夜回家，明天還是一堆事情等著。',
      solution: 'FDE 依你的公司流程客製建立，把例行內勤作業（開單、請款、對帳、報表）全部系統化。新人只要會用 LINE 就能上手，老員工的操作習慣也能保留。表單欄位、簽核流程、提醒節奏全部跟著你原本的做法走，不用重新學一套。',
      result: '內勤交接時間從 1-2 個月縮到 1 週。例行作業時間減半，老闆能把精力放回開拓業務上。即使臨時缺人，系統照常運轉，不會卡住整個公司。'
    },
    excel: {
      title: 'Excel 散在各台電腦，備份全靠運氣',
      bg: 'var(--mac-rose)',
      problem: '小陳把客戶報價單存在自己桌機的 D 槽，上週電腦中毒重灌，三年的報價歷史全沒了。更糟的是前業務離職時把客戶名單複製帶走，公司完全無法追蹤。Excel 沒有權限控管，誰都能改、誰都能刪。',
      solution: 'FDE 系統將所有資料存在雲端加密資料庫（PostgreSQL），自動備份保留 30 天日備 / 12 週週備 / 24 月月備。每筆操作都有稽核紀錄（誰在什麼時候改了什麼），角色權限控管確保業務只看得到自己的客戶。',
      result: '資料遺失風險降為零，備份自動化。離職交接只需停用帳號，客戶資料完整保留在公司系統內。'
    },
    'order-miss': {
      title: 'LINE、電話、Email 多管道，忙起來真的會漏單',
      bg: 'var(--mac-peach)',
      problem: '客戶從 LINE 傳「幫我訂 100 箱 6336」，業務正在開會沒看到。兩天後客戶打來問進度才發現根本沒下單。多管道進單（LINE、電話、Email）全靠人腦記，忙起來哪有可能不漏？',
      solution: 'FDE 的 LINE Bot 收到訂單訊息自動建立待確認銷貨單，推播提醒業務處理。語音訊息也能用 AI 轉文字自動解析品項與數量。所有訂單統一進系統，不再散落在聊天記錄裡。',
      result: '漏單率降至 0%。客戶用 LINE 下單 → 系統自動建單 → 業務確認 → 出貨，全程 5 分鐘。'
    },
    'billing-miss': {
      title: '貨出了卻忘記請款，做了白工才發現',
      bg: 'var(--mac-lemon)',
      problem: '貨已經送出去半個月，月底對帳才發現這筆單忘記開發票、忘記建應收。客戶那邊不會主動提醒你要付款，等你想起來時，請款日早就過了，下個月才能再請。錢還沒收到的痛，比加班補資料還累。',
      solution: 'FDE 在出貨單成立的當下自動產生應收帳款，到期前 15 天自動 LINE 推播提醒業務追款。月結客戶整月帳單可一鍵批次產生 PDF + 寄送。逾期未收的單會持續閃紅燈在儀表板上，老闆一眼看到還有多少錢沒進來。',
      result: '請款 100% 不漏單。應收催收工作量降 70%。現金回收速度加快，月底不再因為「忘記請款」而少賺一筆。'
    },
    'erp-waste': {
      title: '花大錢買 ERP，結果只用到進銷存',
      bg: 'var(--mac-lemon)',
      problem: '花了 80 萬買某牌 ERP，用了半年只用到進銷存。想多加一個「客戶稅率」欄位，原廠說要排需求、評估、報價，最快三個月。教育訓練辦了兩輪，現場還是偷偷開 Excel 做。',
      solution: 'FDE 從你的實際流程出發，只做你真正會用的功能。操作介面就是 LINE，員工零學習成本。需要加欄位？當週就能上線。不是買套裝軟體再來砍功能，是從需求長出系統。',
      result: '導入費用從百萬降到月費制。上線時間從半年縮到 4-8 週。功能使用率從 20% 提升到 95%。'
    },
    kpi: {
      title: '想獎勵認真員工，卻拿不出數據',
      bg: 'var(--mac-lavender)',
      problem: '老闆想給認真的司機加獎金，但「認真」怎麼量化？油耗數據月底才彙整、維修費用散在各家車廠發票裡、出車次數還要翻手寫本。最後只能憑印象打分，員工不服氣也說不出所以然。',
      solution: 'FDE 自動收集每位員工的工作數據：駕駛的油耗、里程、維修成本、異常次數；業務的報價轉換率、客戶拜訪頻率、回款速度。AI 每月自動產出績效報告，A-D 評分加中文評語。',
      result: '考核從「感覺」變成「數據」。AI 績效報告成本僅 $0.005/人/月，管理者 5 分鐘看完整月表現。'
    },
    gov: {
      title: '政府採購網標案抄寫比對到眼花',
      bg: 'var(--mac-blue)',
      problem: '標案公告出來，助理手動抄規格、比對庫存有沒有、算單價和數量、填投標文件，一個案子搞半天。同時跑三個標案就手忙腳亂，報錯價還不知道。',
      solution: 'FDE 可串接政府採購網 API 自動擷取標案資訊，AI 比對公司產品庫存與歷史報價，自動產出投標報價草稿。人只需要最後確認和送出。',
      result: '標案處理時間從半天縮短到 30 分鐘。報價準確度提升，不再手動抄寫出錯。（規劃中功能）'
    },
    knowledge: {
      title: '老師傅一請假，整間廠跟著慌',
      bg: 'var(--mac-mint)',
      problem: '張師傅做了 20 年，哪種材料用什麼轉速、哪家供應商的料比較穩定，全在他腦子裡。他請假三天，新人排程排到天荒地老，報價也不知道該報多少。萬一退休，這些知識就歸零了。',
      solution: 'FDE 把經驗數位化：派工決策記錄理由（DispatchDecisionLog）、報價歷史可追溯、製程參數存在系統。AI 學習歷史數據後能推薦最佳機台和加工參數，新人也能做出老師傅等級的判斷。',
      result: '關鍵知識從「人腦」搬到「系統」。AI 派工推薦準確率持續提升，新人上手時間縮短 60%。'
    },
    compliance: {
      title: '月底人工抄申報，罰款說來就來',
      bg: 'var(--mac-rose)',
      problem: '每個月底，會計小美要花兩天整理 EPA 廢棄物聯單、核對處理廠簽收、填申報表。電子發票要一張一張對金額、稅額、載具。一不小心填錯，環保局罰款 6 萬起跳。',
      solution: 'FDE 在派車完成時自動記錄廢棄物重量、處理廠、管制編號。電子發票 B2B/B2C 全自動開立，Turnkey XML 直接上傳。月底只需點一鍵就產出申報資料。',
      result: '月底申報從 2 天縮短到 5 分鐘。發票開立從 15 分鐘/張降到 30 秒/張。罰款風險歸零。'
    },
    'data-loss': {
      title: '客戶說有下單，系統卻查不到',
      bg: 'var(--mac-peach)',
      problem: '客戶說上週有下單 500 箱，但系統裡只有 200 箱。到底是客戶記錯、業務沒改、還是誰不小心刪了？沒有修改記錄，大家互相指責，最後只能「下次注意」了事。',
      solution: 'FDE 的稽核日誌（Audit Log）記錄每一筆資料的建立、修改、刪除，包含操作人、時間、修改前後的值。資料不會真的被刪除（軟刪除 + 30 天恢復期），任何爭議都能追溯到具體的操作紀錄。',
      result: '資料異動 100% 可追溯。爭議處理從「互相猜疑」變成「查紀錄就知道」。誤刪資料 30 天內可一鍵恢復。'
    }
  };

  var modal = document.getElementById('painModal');
  if (modal) {
    document.querySelectorAll('.pain-card[data-pain]').forEach(function (card) {
      card.addEventListener('click', function () {
        var key = this.dataset.pain;
        var d = painData[key];
        if (!d) return;
        document.getElementById('pmIcon').style.background = d.bg;
        document.getElementById('pmTitle').textContent = d.title;
        document.getElementById('pmProblem').textContent = d.problem;
        document.getElementById('pmSolution').textContent = d.solution;
        document.getElementById('pmResult').textContent = d.result;
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
    modal.querySelector('.pain-modal-close').addEventListener('click', function () {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ── Machine board animation ──
  const cards = document.querySelectorAll('.machine-card[data-states]');
  if (cards.length) {
    setInterval(() => {
      cards.forEach((card) => {
        const states = JSON.parse(card.dataset.states);
        const idx = Math.floor(Math.random() * states.length);
        const st = states[idx];
        const badge = card.querySelector('.machine-status');
        if (!badge) return;
        badge.className = 'machine-status status-' + st.key;
        badge.textContent = st.label;
      });
    }, 4000);
  }
})();
