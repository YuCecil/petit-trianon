/* 故事裡的互動模組（rules/site.md）。故事寫 {{play:<id>}}，app.js 看到才載入這個檔。
   每一筆數字、日期都附資料卡 id 與頁碼，只能用故事裡已有出處的內容。 */

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 1. 赤字夫人：先猜再看帳本 ---------- */
const DEFICIT = {
  total: 283.2, unit: "百萬里弗爾",
  parts: [   /* 一格＝100 萬里弗爾；「其他」是本站用總數減出來的 */
    { k: "house", name: "整個王室的家用", v: 36.2, cls: "gilt" },
    { k: "army", name: "軍事", v: 125.2, cls: "ink" },
    { k: "debt", name: "借款利息", v: 45.2, cls: "blue" },
    { k: "other", name: "其他（本站用總數減出來）", v: 76.6, cls: "pale" },
  ],
  src: ["s-1989-white-solution", "p. 552"],
  gamble: { v: 487272, src: ["s-1874-arneth-mercy-correspondance", "第 3 冊，1777 年 1 月 17 日信"] },
};

function deficit(fig, { ref }) {
  const cells = [];
  DEFICIT.parts.forEach(p => { for (let i = 0; i < Math.round(p.v); i++) cells.push(p); });
  fig.innerHTML = `
    <p class="pl-kicker">你猜猜看</p>
    <p class="pl-q">1781 年，法國國家的一般支出大約是 <b>2 億 8,320 萬里弗爾</b>。下面每一格代表 100 萬。<br>你覺得，<b>國王、王后和所有王族的家用</b>加起來，占了幾成？</p>
    <div class="pl-grid" role="img" aria-label="283 格，每格 100 萬里弗爾">${cells.map(() => "<i></i>").join("")}</div>
    <div class="pl-guess">
      <label for="pl-g">我猜 <output>25</output>%</label>
      <input id="pl-g" type="range" min="1" max="60" value="25">
      <button type="button" class="pl-btn pl-reveal">看答案</button>
    </div>
    <div class="pl-out" aria-live="polite"></div>`;
  const grid = [...fig.querySelectorAll(".pl-grid i")];
  const range = fig.querySelector("input"), out = fig.querySelector("output"), res = fig.querySelector(".pl-out");
  const paintGuess = () => {
    const n = Math.round(range.value / 100 * cells.length);
    out.textContent = range.value;
    grid.forEach((g, i) => g.className = i < n ? "guess" : "");
  };
  range.oninput = paintGuess; paintGuess();
  fig.querySelector(".pl-reveal").onclick = e => {
    const guess = +range.value, real = Math.round(DEFICIT.parts[0].v / DEFICIT.total * 100);
    const n = Math.round(guess / 100 * cells.length);
    e.target.remove(); range.disabled = true;
    grid.forEach((g, i) => setTimeout(() => { g.className = cells[i].cls + (i < n ? " mine" : ""); }, still() ? 0 : i * 4));
    const diff = guess - real;
    const verdict = Math.abs(diff) <= 3 ? "猜得很準。" : diff > 0 ? `你猜得比實際多了 ${diff} 個百分點。很多人都跟你一樣，以為宮廷花掉了國家大部分的錢。` : `你猜得比實際少了 ${-diff} 個百分點。`;
    res.innerHTML = `
      <p class="pl-big">實際上大約 <b>${real}%</b>，八分之一左右。${verdict}</p>
      <ul class="pl-legend">${DEFICIT.parts.map(p => `<li><i class="${p.cls}"></i>${p.name}：${p.v} 百萬</li>`).join("")}<li><i class="guess-key"></i>框起來的格子是你猜的</li></ul>
      <p class="pl-src">出處：經濟史學者懷特整理的 1781 年帳目 ${ref(...DEFICIT.src)}。（推論）比例是本站換算。</p>
      <button type="button" class="pl-btn pl-zoom">那王后的賭債有多大？</button>`;
    res.querySelector(".pl-zoom").onclick = z => {
      z.target.remove();
      grid.forEach((g, i) => g.classList.toggle("dim", i !== 0));
      grid[0].classList.add("half");
      res.insertAdjacentHTML("beforeend", `
        <p class="pl-big">1777 年，梅西替王后算出她欠的賭債：<b>48 萬 7,272 里弗爾</b>。在這張圖上，它<b>不到半格</b>（左上角那一格的一半）。</p>
        <p class="pl-src">出處：梅西給瑪麗亞．特蕾莎的密報 ${ref(...DEFICIT.gamble.src)}。注意：這是 1777 年的債、1781 年的帳，不同年份，只用來比大小（推論）。真正讓預算失控的，研究者多半指向美國獨立戰爭和借款利息，詳見下文。</p>`);
    };
  };
}

/* ---------- 2. 聖殿塔：一家人被一個一個帶走 ---------- */
const PEOPLE = [
  { k: "k", name: "國王", full: "路易十六" },
  { k: "q", name: "王后", full: "瑪麗．安東尼" },
  { k: "e", name: "姑姑", full: "伊莉莎白夫人" },
  { k: "m", name: "公主", full: "瑪麗－泰蕾茲" },
  { k: "d", name: "王子", full: "路易－夏爾" },
];
/* where：t＝跟家人在一起；a＝在塔裡、但被隔開；其他文字＝離開了塔、去了哪裡 */
const TEMPLE = [
  { date: "1792 年 8 月 13 日", where: { k: "t", q: "t", e: "t", m: "t", d: "t" }, text: "杜樂麗宮被攻陷三天後，一家五口被送進聖殿塔。馬車在人群裡走了兩個半小時。", src: ["s-1883-tourzel-memoires", "第 2 冊第 23 章"] },
  { date: "1792 年 9 月 3 日", where: {}, text: "監獄屠殺。王后好友朗巴勒親王妃的頭，被插在長矛上送到塔的窗前。", src: ["s-1798-clery-journal", "p. 20"] },
  { date: "1792 年 12 月 11 日", where: { k: "a" }, text: "清晨鼓聲大作。王子被帶回母親身邊，國王被帶去國民公會受審。從這天起，國王和家人分開住。", src: ["s-1798-clery-journal", "pp. 76–77"] },
  { date: "1793 年 1 月 20 日晚上", where: {}, text: "國王已被判死刑。全家獲准見他最後一面，告別持續了「七刻鐘」，將近兩個小時。", src: ["s-1798-clery-journal", "p. 110"] },
  { date: "1793 年 1 月 21 日", where: { k: "斷頭台" }, text: "國王被送上斷頭台。公主記得，他想對群眾說話，被鼓聲蓋過。", src: ["s-1852-marie-therese-temple", "p. 66"] },
  { date: "1793 年 7 月 3 日", where: { d: "a" }, text: "國民公會下令把王子移到「塔裡最安全的房間」。母親死命不肯放手，直到對方威脅要殺了孩子。", src: ["s-1852-marie-therese-temple", "pp. 75–76"] },
  { date: "1793 年 8 月 2 日凌晨兩點", where: { q: "古監獄" }, text: "王后被移到古監獄等候審判。走出塔門時頭撞上門楣，她說：「現在，什麼都不會再傷害我了。」（本站譯）", src: ["s-1852-marie-therese-temple", "p. 79"] },
  { date: "1794 年 5 月 9 日晚上", where: { e: "斷頭台" }, text: "有人叫伊莉莎白夫人下樓。她擁抱姪女：「要有勇氣，要堅定。」第二天她被送上斷頭台，看守卻只告訴公主，姑姑「出去透透氣」。", src: ["s-1868-feuillet-elisabeth-correspondance", "編者序"], src2: ["s-1824-lafont-daussonne-memoires", "p. 393"] },
  { date: "1795 年 6 月 8 日或 9 日", where: { d: "死在塔裡" }, text: "王子死在塔裡，十歲又兩個月。官方紀錄寫 8 日，姊姊的回憶寫 9 日。", src: ["s-1852-marie-therese-temple", "p. 105"] },
  { date: "1795 年 12 月 19 日", where: { m: "被接出塔" }, text: "公主十七歲生日那天深夜，內政部長來接她出塔。她是一家五口裡，唯一活著走出來的人。", src: ["s-1852-marie-therese-temple", "p. 16（編者）"] },
];

function temple(fig, { ref }) {
  fig.innerHTML = `
    <p class="pl-kicker">一家五口，一個一個被帶走</p>
    <div class="pt-stage">
      <svg class="pt-tower" viewBox="0 0 200 260" aria-hidden="true"><path d="M30 70h140v180H30z" /><path d="M14 80h32v170H14zM154 80h32v170h-32z" /><path d="M14 80l16-46 16 46M154 80l16-46 16 46M46 70l54-50 54 50" /><path d="M86 250v-34a14 14 0 0 1 28 0v34" /></svg>
      <div class="pt-room pt-t"><span>和家人在一起</span><div></div></div>
      <div class="pt-room pt-a"><span>在塔裡，被隔開</span><div></div></div>
    </div>
    <div class="pt-gone"><span>離開了塔</span><div></div></div>
    <div class="pt-card" aria-live="polite"><p class="pt-date"></p><p class="pt-text"></p><p class="pl-src"></p></div>
    <div class="pt-nav"><button type="button" class="pl-btn pt-prev">← 上一步</button><span class="pt-step"></span><button type="button" class="pl-btn pt-next">下一步 →</button></div>
    <input class="pt-range" type="range" min="0" max="${TEMPLE.length - 1}" value="0" aria-label="時間">`;
  const box = { t: fig.querySelector(".pt-t div"), a: fig.querySelector(".pt-a div"), gone: fig.querySelector(".pt-gone div") };
  const tok = {};
  PEOPLE.forEach(p => {
    const el = document.createElement("span");
    el.className = "pt-p"; el.dataset.k = p.k;
    el.innerHTML = `<b>${p.name}</b><small>${p.full}</small><em></em>`;
    tok[p.k] = el;
  });
  const range = fig.querySelector(".pt-range");
  let cur = -1;
  const go = i => {
    i = Math.max(0, Math.min(TEMPLE.length - 1, i));
    const where = {};
    TEMPLE.slice(0, i + 1).forEach(s => Object.assign(where, s.where));
    /* FLIP：先記下位置，搬到新的格子，再從舊位置滑過去 */
    const before = new Map(Object.values(tok).map(el => [el, el.getBoundingClientRect()]));
    PEOPLE.forEach(p => {
      const w = where[p.k] || "t", el = tok[p.k];
      const to = w === "t" ? box.t : w === "a" ? box.a : box.gone;
      el.querySelector("em").textContent = w === "t" || w === "a" ? "" : w;
      el.classList.toggle("out", to === box.gone);
      el.classList.toggle("now", !!TEMPLE[i].where[p.k]);
      if (el.parentNode !== to) to.appendChild(el);
    });
    if (cur >= 0 && !still()) Object.values(tok).forEach(el => {
      const a = before.get(el), b = el.getBoundingClientRect();
      if (!a.width || (a.left === b.left && a.top === b.top)) return;
      el.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: "none" }], { duration: 700, easing: "cubic-bezier(.3,.7,.2,1)" });
    });
    const s = TEMPLE[i];
    fig.querySelector(".pt-date").textContent = s.date;
    fig.querySelector(".pt-text").textContent = s.text;
    fig.querySelector(".pl-src").innerHTML = "出處：" + ref(...s.src) + (s.src2 ? "；" + ref(...s.src2) : "");
    fig.querySelector(".pt-step").textContent = `${i + 1} / ${TEMPLE.length}`;
    fig.querySelector(".pt-prev").disabled = i === 0;
    fig.querySelector(".pt-next").disabled = i === TEMPLE.length - 1;
    fig.querySelector(".pt-stage").classList.toggle("empty", Object.values(where).filter(w => w !== "t" && w !== "a").length === PEOPLE.length);
    range.value = i; cur = i;
  };
  fig.querySelector(".pt-prev").onclick = () => go(cur - 1);
  fig.querySelector(".pt-next").onclick = () => go(cur + 1);
  range.oninput = () => go(+range.value);
  go(0);
}

const PLAYS = { deficit, temple };
export function mount(fig, opts) { PLAYS[fig.dataset.play]?.(fig, opts); }
