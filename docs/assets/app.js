/* 小特里亞儂：網站程式。資料全部來自 data/wiki.json（由 tools/build.py 產生）。
   新增頁面不需要改這個檔案。 */
const figure = (src, alt, cls = "", eager = false) => `<figure class="art ${cls}"><img src="assets/img/${esc(src)}" alt="${esc(alt)}" loading="${eager ? "eager" : "lazy"}" decoding="async"></figure>`;
const TYPE_NAME = { topic: "故事", entity: "名詞", source: "資料卡", question: "問答", overview: "總論" };
const REV_START = "1789-07-14";
const INK = "#2E3A4B", INDIGO = "#2E4F98", INDIGO2 = "#8CC2DD", STAMP = "#B08D4E", LINE = "#E4DCCD", MUTED = "#626B7A";
/* 分類＝塞弗爾瓷器釉色：顏色定義在 style.css 的 --myth-ink 等變數；新增分類要一起改（CLAUDE.md 第 8 節）。順序＝首頁目錄順序 */
const CATS = {
  "迷思": { key: "myth", glaze: "國王藍" }, "生平": { key: "life", glaze: "天藍" }, "宮廷": { key: "court", glaze: "蘋果綠" },
  "時尚": { key: "mode", glaze: "龐巴度粉" }, "飲食": { key: "table", glaze: "黃水仙" }, "人物": { key: "people", glaze: "紫羅蘭" },
  "革命": { key: "rev", glaze: "鉛灰" }, "身後": { key: "after", glaze: "灰玫瑰" },
};
/* 盤心的鍍金小花飾（沒有判定的故事用） */
const ROSETTE = `<svg class="rosette" viewBox="0 0 40 40" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2">${[0, 45, 90, 135].map(r => `<ellipse cx="20" cy="20" rx="4" ry="13" transform="rotate(${r} 20 20)"/>`).join("")}<circle cx="20" cy="20" r="2.6" fill="currentColor"/></g></svg>`;
/* 判定章的字照詞斷行：四字分成兩行，「研究者還在吵」分成三字兩行 */
const sealText = v => esc(v).replace(/^(.{2,3})(.{2,3})$/, "$1<br>$2");
const VERDICTS = ["確有其事", "半真半假", "查無實據", "研究者還在吵"];
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const catKey = c => (CATS[c] || { key: "myth" }).key;
const catInk = c => cssVar(`--${catKey(c)}-ink`) || INDIGO;
const catOf = id => byId[id]?.category;
/* 中文標題在「：？，」後分段，每段不拆開，只在段與段之間換行，避免切在詞中間 */
const phrase = t => String(t ?? "").split(/(?<=[：？，])/).map(x => `<span class="ph">${esc(x)}</span>`).join("");

let W = null, byId = {}, backlinks = {};
let live = { charts: [], map: null, graph: null };
const app = document.getElementById("app");
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function shortName(p) {
  if (!p) return "";
  if (p.type === "source") {
    /* 出處標記只放第一位作者的姓，多位作者加「等」 */
    const all = String(p.author || "").split(/\s*(?:;|、|＆|&|,| and | et |與|和)\s*/).filter(Boolean);
    let a = (all[0] || "").replace(/（.*?）|\(.*?\)/g, "").trim();
    const org = /^(Archives|Château|Chateau|Musée|Ministère|Bibliothèque|Centre|Harvard|NPR|Assemblée|Société)\b/i.test(a);
    if (!org && /^[\x00-\u024F'’.\- ]+$/.test(a)) a = a.split(/\s+/).filter(w => !/^(de|von|van|la|le|du)$/i.test(w)).pop() || a;
    return `${a}${all.length > 1 ? " 等" : ""} ${p.year || ""}`.trim();
  }
  return p.title;
}
function refLink(id, label) {
  const p = byId[id];
  if (!p) return `<span class="ref broken" title="找不到這頁">${esc(id)}</span>`;
  const cls = p.type === "source" ? "s" : p.type === "entity" ? "e" : "t";
  return `<a class="ref ${cls}" href="#/p/${id}" title="${esc(p.title)}">${esc(label || shortName(p))}</a>`;
}
function pageLink(id) {
  const p = byId[id];
  return p ? `<a href="#/p/${id}">${esc(p.title)}</a>` : esc(id);
}
function cleanup() {
  live.charts.forEach(c => c.destroy()); live.charts = [];
  if (live.map) { live.map.remove(); live.map = null; }
  if (live.graph) { live.graph.destroy(); live.graph = null; }
  if (live.ftoc) { removeEventListener("scroll", live.ftoc.upd); live.ftoc.el.remove(); live.ftoc = null; }
}
function setNav(key) {
  document.querySelectorAll(".nav a").forEach(a => { const on = a.dataset.k === key; a.classList.toggle("on", on); on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"); });
}

/* ---------- 圖表 ---------- */
function chartBlock(s, inPage) {
  const h = inPage ? "h3" : "h2";
  return `<figure class="chart" data-chart="${esc(s.id)}" data-cat="${catKey(catOf(s.topic))}" style="margin-left:0;margin-right:0">
    <${h}>${esc(s.title)}</${h}><div class="u">單位：${esc(s.unit)}</div>
    <div class="cv"><canvas role="img" aria-label="${esc(s.title)}"></canvas></div>
    <figcaption class="note">${esc(s.note || "")} 出處：${refLink(s.source)}${!inPage && s.topic ? `。故事：${pageLink(s.topic)}` : ""}</figcaption></figure>`;
}
function mountCharts(root) {
  Chart.defaults.font.family = '"Noto Sans TC", sans-serif';
  Chart.defaults.color = MUTED;
  root.querySelectorAll("[data-chart]").forEach(el => {
    const s = W.stats.find(x => x.id === el.dataset.chart);
    if (!s) return;
    const isLine = s.type === "line";
    const many = s.series.length > 1;
    const base = s.topic ? catInk(catOf(s.topic)) : INDIGO;
    const c = new Chart(el.querySelector("canvas"), {
      type: isLine ? "line" : "bar",
      data: {
        labels: s.labels,
        datasets: s.series.map((ser, i) => ({
          label: ser.name, data: ser.values, borderRadius: 0, barPercentage: .62,
          // 單一數列時，stats.json 的 highlight 指定的那一根用印泥紅，讓眼睛先看到重點
          backgroundColor: many ? [INK, INDIGO, INDIGO2][i] : ser.values.map((_, j) => j === s.highlight ? STAMP : base),
          borderColor: many ? [INK, INDIGO, INDIGO2][i] : base, pointRadius: 4, pointBackgroundColor: STAMP,
        })),
      },
      options: {
        maintainAspectRatio: false, indexAxis: !isLine && s.labels.some(l => l.length > 7) ? "y" : "x",
        plugins: { legend: { display: many }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}：${ctx.formattedValue} ${s.unit}` } } },
        scales: { x: { grid: { display: false }, border: { color: INK } }, y: { grid: { color: "rgba(199,205,196,.6)" }, border: { display: false } } },
      },
    });
    live.charts.push(c);
  });
}

/* ---------- Markdown ---------- */
/* 註釋（CLAUDE.md 8.4）：內文「（[[s-…]] 頁碼）」轉成上標註號，原文收進 notes，文末集中列出 */
function footnotes(t, notes) {
  if (!notes) return t;
  return t.replace(/([^\s*_<>（）])?（([^（）\n]*\[\[s-[^（）\n]*)）([。；，？！]?)/g, (_, prev, inner, punct) => {
    notes.push(inner);
    const n = notes.length;
    return `<span class="fn-w">${prev || ""}${punct || ""}<sup class="fn"><button type="button" class="fn-b" data-n="${n}" aria-expanded="false" aria-label="註釋 ${n}">${n}</button></sup></span>`;
  });
}
function notesBlock(notes) {
  if (!notes.length) return "";
  const li = notes.map((x, i) => `<li id="fn-${i + 1}">${marked.parseInline(x.replace(/\[\[([a-z0-9\-]+)(?:\|([^\]]*))?\]\]/g, (_, id, label) => refLink(id, label)))}</li>`).join("");
  return `<details class="notes"><summary>註釋（${notes.length} 則）</summary><ol>${li}</ol></details>`;
}
function photoFig(f, cap, credit) {
  return `<figure class="photo"><img src="assets/photo/${esc(f)}" alt="${esc(cap)}" loading="lazy" decoding="async"><figcaption>${esc(cap)}${credit ? `<small>${esc(credit)}</small>` : ""}</figcaption></figure>`;
}
function renderMd(body, notes) {
  let t = footnotes(body, notes);
  t = t.replace(/\{\{chart:([\w\-]+)\}\}/g, (_, id) => {
    const s = W.stats.find(x => x.id === id);
    return s ? "\n\n" + chartBlock(s, true).replace(/\n\s*/g, " ") + "\n\n" : "";
  });
  t = t.replace(/\{\{img:([\w\-.]+)\|([^}]*)\}\}/g, (_, f, cap) =>
    `\n\n<figure class="inline-fig"><img src="assets/img/${esc(f)}" alt="${esc(cap)}" loading="lazy" decoding="async"><figcaption>${esc(cap)}</figcaption></figure>\n\n`);
  t = t.replace(/\{\{photo:([\w\-.]+)\|([^|}]*)(?:\|([^}]*))?\}\}/g, (_, f, cap, cr) => "\n\n" + photoFig(f, cap, cr) + "\n\n");
  t = t.replace(/\[\[([a-z0-9\-]+)(?:\|([^\]]*))?\]\]/g, (_, id, label) => refLink(id, label));
  return marked.parse(t);
}

/* ---------- 首頁 ---------- */
/* 故事盤子：首頁目錄與故事結尾「接著讀」共用 */
const plateItem = (t, hx = "h4") => `<li><a class="plate" data-cat="${catKey(t.category)}" href="#/p/${t.id}">
    <span class="dish">${t.image ? `<img src="assets/img/${esc(t.image)}" alt="" loading="lazy" decoding="async">` : t.verdict ? `<span class="cart"><small>判定</small>${esc(t.verdict)}</span>` : ROSETTE}</span>
    <${hx} class="toc-t">${phrase(t.title)}</${hx}><p>${esc(t.summary)}</p>${t.verdict && t.image ? `<span class="verdict">判定：${esc(t.verdict)}</span>` : ""}</a></li>`;

function home(anchor) {
  setNav("home");
  const topics = W.pages.filter(p => p.type === "topic").sort((a, b) => (a.period?.[0] || 0) - (b.period?.[0] || 0) || (a.period?.[1] || 0) - (b.period?.[1] || 0));
  const c = W.counts;
  const plate = t => plateItem(t);
  const groups = Object.keys(CATS).map(k => [k, topics.filter(t => t.category === k)]).filter(g => g[1].length);
  const toc = groups.map(([k, list]) => `<div class="toc-group" data-cat="${catKey(k)}"><h3><i class="glaze-dot" aria-hidden="true"></i>${k}</h3><ol class="plates">${list.map(plate).join("")}</ol></div>`).join("")
    || `<p class="lead">第一批故事正在準備中。</p>`;
  app.innerHTML = `
  <section class="hero">
    <div class="hero-t">
      <h1><span class="q">「讓他們吃蛋糕。」</span>${phrase("她其實沒說過，")}${phrase("那她說過什麼？")}</h1>
      <p class="lead">看完《凡爾賽拜金女》，想知道瑪麗．安東尼和路易十六真正的樣子？這裡把傳說、宮廷、時尚、餐桌、身邊的人和最後的結局，一盤一盤端上來；每個流傳的說法，都對照當時的書信、回憶錄和今天的研究。</p>
      <div class="cat-menu" aria-label="分類">${Object.keys(CATS).map(k => `<span data-cat="${CATS[k].key}"><i class="glaze-dot" aria-hidden="true"></i>${k}</span>`).join("")}</div>
      <a class="go" href="#/#stories">從故事開始讀</a>
    </div>
    <div class="big-plate"><img class="mascot" src="assets/img/mascot.png" alt="王后的小狗，戴著國王藍的緞帶，坐在瓷盤中央，是本站的導覽員" width="314" height="410"></div>
  </section>

  <section class="sec" id="stories">
    <h2>故事</h2>
    ${toc}
  </section>

  <section class="sec" id="more">
    <h2>更多</h2>
    <div class="more">
      <a href="#/myths"><b>迷思對照</b><span>流傳的說法 vs. 史料</span></a>
      <a href="#/timeline"><b>時間軸</b><span>${W.timeline.length} 件事，照年份排</span></a>
      <a href="#/map"><b>地圖</b><span>從維也納到凡爾賽、巴黎</span></a>
      <a href="#/debates"><b>研究爭論</b><span>研究者看法不同的地方</span></a>
      <a href="#/library"><b>資料庫</b><span>${c.sources} 份研究、書信與回憶錄</span></a>
    </div>
  </section>`;
  if (anchor) setTimeout(() => document.getElementById(anchor)?.scrollIntoView(), 300);
  else scrollTo(0, 0);
}

function mythsPage() {
  setNav("myths");
  const list = W.pages.filter(p => p.type === "topic" && p.verdict);
  const groups = VERDICTS.map(v => [v, list.filter(p => p.verdict === v)]).filter(g => g[1].length);
  app.innerHTML = `<section class="sec reading" style="border:0"><h1>迷思對照</h1>
    <p class="lead">關於他們的傳說很多。每一則都查過：最早出現在哪裡、當時的人怎麼說、今天的研究者怎麼看。</p>
    ${groups.map(([v, ps]) => `<h2 class="v-h"><span class="seal">${sealText(v)}</span></h2><ol class="myth-list">${ps.map(p => `<li data-cat="${catKey(p.category)}"><a href="#/p/${p.id}"><span class="m-say">${esc(p.myth)}</span><span class="m-t">${esc(p.title)}</span></a></li>`).join("")}</ol>`).join("")
    || `<p>還沒有判定過的迷思。</p>`}
  </section>`;
  scrollTo(0, 0);
}

let tlCat = "全部";
function timelinePage() {
  setNav("tl");
  app.innerHTML = `<section class="sec" style="border:0"><h1>時間軸</h1>
    <div class="chips" id="tl-chips" role="group" aria-label="依主題篩選"></div>
    <div id="tl-list"></div></section>`;
  drawTimeline(); scrollTo(0, 0);
}
function drawTimeline() {
  const all = W.timeline.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const cats = ["全部", ...Object.keys(CATS).filter(k => all.some(e => e.category === k))];
  document.getElementById("tl-chips").innerHTML = cats.map(k => `<button type="button" class="chip ${k === tlCat ? "on" : ""}" ${k !== "全部" ? `data-cat="${catKey(k)}"` : ""} data-k="${k}" aria-pressed="${k === tlCat}">${k === "全部" ? "全部" : `<i class="glaze-dot" aria-hidden="true"></i>${k}`}</button>`).join("");
  document.querySelectorAll("#tl-chips .chip").forEach(b => b.onclick = () => { tlCat = b.dataset.k; drawTimeline(); document.querySelector(`#tl-chips .chip[data-k="${tlCat}"]`)?.focus(); });
  const evs = all.filter(e => tlCat === "全部" || e.category === tlCat);
  const byYear = {};
  evs.forEach(e => (byYear[String(e.date).slice(0, 4)] ||= []).push(e));
  let endShown = false;
  document.getElementById("tl-list").innerHTML = Object.entries(byYear).map(([y, list]) => `<div class="tl-year-g"><h2 class="tl-y">${y}</h2><ol class="tl-list">${list.map(e => {
    let mark = "";
    if (!endShown && String(e.date) >= REV_START) { endShown = true; mark = `<li class="tl-end-row">1789.07.14 攻占巴士底，革命開始</li>`; }
    const md = String(e.date).slice(5).replace(/-/g, ".") || "";
    return `${mark}<li class="tl-item" data-cat="${catKey(e.category)}"><span class="d">${esc(md)}</span><div><h3>${esc(e.title)}</h3><p>${esc(e.desc)}</p><p class="small">${e.topic ? "故事：" + pageLink(e.topic) + "。" : ""}出處：${refLink(e.source)}</p></div></li>`;
  }).join("")}</ol></div>`).join("");
}

function mapPage() {
  setNav("map");
  const used = Object.keys(CATS).filter(k => W.places.some(p => byId[p.topic]?.category === k));
  app.innerHTML = `<section class="sec" style="border:0"><h1>地圖</h1>
    <div class="legend">${used.map(k => `<span data-cat="${CATS[k].key}"><i class="pin" style="display:inline-block;width:12px;height:12px;vertical-align:-1px;margin-right:6px"></i>${k}</span>`).join("")}</div>
    <div id="map-el"></div></section>`;
  drawMap(); scrollTo(0, 0);
}
function drawMap() {
  if (!window.L || !W.places.length) return;
  const m = L.map("map-el", { scrollWheelZoom: true, touchZoom: true, zoomSnap: 0.25, zoomDelta: 0.5 });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', maxZoom: 18,
  }).addTo(m);
  W.places.forEach(p => {
    const t = byId[p.topic];
    L.marker([p.lat, p.lng], { icon: L.divIcon({ className: "", html: `<div class="pin" data-cat="${catKey(t?.category)}"></div>`, iconSize: [28, 28], iconAnchor: [14, 14] }), title: p.name })
      .addTo(m).bindPopup(`<b>${esc(p.name)}</b><br>${esc(p.desc)}<br>${t ? "故事：" + pageLink(p.topic) + "<br>" : ""}<span class="small">出處：${refLink(p.source)}</span>`);
  });
  m.fitBounds(W.places.map(p => [p.lat, p.lng]), { padding: [24, 24], maxZoom: 13 });
  live.map = m;
}

/* ---------- 獨立頁：數字、爭論、關係網 ---------- */
function numbers() {
  setNav("numbers");
  app.innerHTML = `<section class="sec" style="border:0"><h1>數字</h1>
    <p class="lead">圖下方註明出處與換算方式。</p>
    ${W.stats.map(s => chartBlock(s)).join("")}</section>`;
  mountCharts(app); scrollTo(0, 0);
}
function debates() {
  setNav("debates");
  app.innerHTML = `<section class="sec" style="border:0"><h1>研究爭論</h1>
    ${W.debates.map(d => `<div class="debate"><h2>${esc(d.question)}</h2><div class="pos">${d.positions.map(p => `<div>${esc(p.claim)}<small>${refLink(p.source)}</small></div>`).join("")}</div>${d.topic ? `<p class="small">相關故事：${pageLink(d.topic)}</p>` : ""}</div>`).join("")}</section>`;
  scrollTo(0, 0);
}
function graph() {
  setNav("graph");
  if (!window.vis) {  /* 關係網函式庫很大，只在進這頁時才載入 */
    app.innerHTML = `<p class="loading">關係網載入中…</p>`;
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.9/standalone/umd/vis-network.min.js";
    s.onload = () => { if (location.hash.startsWith("#/graph")) graph(); };
    document.head.appendChild(s);
    return;
  }
  app.innerHTML = `<section class="sec" style="border:0"><h1>關係網</h1>
    <p class="lead">每份資料、每個故事怎麼連在一起。可以拖拉節點，點一下打開那一頁；滑鼠移到小點上會顯示資料名稱。</p>
    <div class="legend"><span>故事（依分類釉色）</span><span><i class="dot" style="background:${INDIGO}"></i>名詞</span><span><i class="dot" style="background:${INDIGO2}"></i>資料卡</span></div>
    <div id="graph-el"></div></section>`;
  const style = {
    topic: { color: STAMP, size: 22, font: 22 }, entity: { color: INDIGO, size: 13, font: 16 },
    source: { color: INDIGO2, size: 7, font: 0 }, question: { color: INK, size: 12, font: 15 },
  };
  const ps = W.pages.filter(p => style[p.type]);
  const ids = new Set(ps.map(p => p.id));
  const nodes = new vis.DataSet(ps.map(p => {
    const s = p.type === "topic" ? { ...style.topic, color: catInk(p.category) } : style[p.type];
    return { id: p.id, label: p.type === "source" ? undefined : p.title.split("：")[0].split("？")[0],
      title: p.type === "source" ? `${shortName(p)}｜${p.title}` : p.title, shape: "dot", size: s.size,
      color: { background: s.color, border: s.color, highlight: { background: s.color, border: INK }, hover: { background: s.color, border: INK } },
      font: { size: s.font, face: "Noto Serif TC, Noto Sans TC", color: INK, strokeWidth: 4, strokeColor: "#FFFDF8" } };
  }));
  const seen = new Set();
  const edges = new vis.DataSet(W.edges.filter(([a, b]) => ids.has(a) && ids.has(b)).filter(([a, b]) => {
    const k = [a, b].sort().join("|"); if (seen.has(k)) return false; seen.add(k); return true;
  }).map(([a, b]) => ({ from: a, to: b, color: { color: LINE, highlight: STAMP, hover: INDIGO }, width: 1 })));
  const g = new vis.Network(document.getElementById("graph-el"), { nodes, edges }, {
    physics: { solver: "forceAtlas2Based", forceAtlas2Based: { gravitationalConstant: -60, centralGravity: .02, springLength: 80, avoidOverlap: .5 }, stabilization: { iterations: 250 } },
    interaction: { hover: true, zoomView: true },
  });
  /* 直接開這頁時，穩定化可能在版面排好前就結束，fit 會算成最大倍率；所以穩定後與一秒後各 fit 一次 */
  const fit = () => g.fit({ animation: false, maxZoomLevel: 1.5 });
  g.once("stabilizationIterationsDone", fit);
  g.once("stabilized", fit);
  setTimeout(fit, 1000);
  g.on("click", e => { if (e.nodes[0]) location.hash = "#/p/" + e.nodes[0]; });
  live.graph = g;
  scrollTo(0, 0);
}

/* ---------- 單頁 ---------- */
function page(p) {
  setNav(p.type === "source" ? "library" : "home");
  const back = (backlinks[p.id] || []).filter(id => byId[id]);
  let aside = "";
  if (p.type === "source") {
    aside += `<div class="box"><h2>書目</h2><dl>
      <dt>作者</dt><dd>${esc(p.author)}</dd><dt>年份</dt><dd>${esc(p.year)}</dd><dt>出處</dt><dd>${esc(p.venue)}</dd>
      <dt>類型</dt><dd>${esc(p.kind)}</dd><dt>語言</dt><dd>${esc({ en: "英文", fr: "法文", de: "德文", zh: "中文" }[p.lang] || p.lang || "")}</dd><dt>讀到</dt><dd><span class="depth ${esc(p.depth)}">${esc(p.depth)}</span></dd>
      <dt>可信度</dt><dd>${esc(p.reliability)}</dd><dt>取得</dt><dd>${esc(p.access)}</dd></dl>
      ${p.url && p.url !== "無" ? `<p style="margin:10px 0 0"><a href="${esc(p.url)}" target="_blank" rel="noopener">打開原始頁面</a></p>` : ""}</div>`;
  }
  const evs = W.timeline.filter(e => e.topic === p.id).sort((a, b) => String(a.date).localeCompare(String(b.date)));
  if (evs.length) aside += `<div class="box"><h2>這個故事的時間軸</h2>${evs.map(e => `<div class="mini-ev"><b>${esc(e.date)}</b><span>${esc(e.title)}</span></div>`).join("")}</div>`;
  const pls = W.places.filter(x => x.topic === p.id);
  if (pls.length) aside += `<div class="box"><h2>發生在</h2>${pls.map(x => `<div>${esc(x.name)}</div>`).join("")}<a href="#/map" style="margin-top:6px">在地圖上看</a></div>`;
  const rel = [...new Set([...(p.topics || []), ...(p.entities || []), ...back])].filter(id => id !== p.id && byId[id] && byId[id].type !== "overview");
  const relT = rel.filter(id => byId[id].type !== "source"), relS = rel.filter(id => byId[id].type === "source");
  if (relT.length) aside += `<div class="box"><h2>${p.type === "source" ? "用在這些故事" : "相關故事與名詞"}</h2>${relT.map(id => `<a href="#/p/${id}">${esc(byId[id].title)}</a>`).join("")}</div>`;
  if (relS.length && p.type !== "topic") aside += `<div class="box"><h2>相關資料</h2>${relS.map(id => `<a href="#/p/${id}">${esc(shortName(byId[id]))}</a>`).join("")}</div>`;

  let body = p.body, lede = "", myth = "";
  const notes = p.type === "topic" || p.type === "entity" ? [] : null;
  if (p.type === "topic") {
    const m = body.match(/^## 一句話說明\s*\n+([\s\S]*?)(?=\n## )/m);
    if (m) { lede = m[1].trim(); body = body.replace(m[0], ""); }
    const mm = body.match(/^## 迷思與史料\s*\n+([\s\S]*?)(?=\n## |(?![\s\S]))/m);
    if (mm) {
      body = body.replace(mm[0], "");
      if (p.myth) myth = `<section class="myth" aria-label="迷思與史料"><h2>迷思與史料</h2><dl>
        <dt>流傳的說法</dt><dd>${esc(p.myth)}</dd><dt>史料怎麼說</dt><dd>${renderMd(mm[1].trim(), notes)}</dd></dl>
        ${p.verdict ? `<p class="judge"><span class="seal">${sealText(p.verdict)}</span><a href="#/myths">其他迷思</a></p>` : ""}</section>`;
    }
  }
  const facts = [p.type === "topic" ? `<span class="cat"><i class="glaze-dot" aria-hidden="true"></i>${esc(p.category)}</span>` : "", p.period ? esc([...new Set(p.period)].join("–")) : "", esc(p.kind || ""), p.sources ? `根據 ${p.sources.length} 份資料` : "", p.updated ? `更新於 ${esc(p.updated)}` : ""].filter(Boolean).join("，");
  const sub = p.type === "source" ? `${esc(p.author)}，${esc(p.year)}。${esc(p.venue)}` : `${esc(p.summary || "")}${facts && p.type !== "overview" ? `<br><span class="small">${facts}</span>` : ""}`;
  app.innerHTML = `<div class="page" ${p.type === "topic" ? `data-cat="${catKey(p.category)}"` : ""}><div>
    <div class="crumb"><a href="#/">首頁</a>　${TYPE_NAME[p.type] || ""}</div>
    <header class="page-h ${p.type === "topic" ? "glaze-h" : ""}" ${p.type === "topic" ? `data-cat="${catKey(p.category)}"` : ""}>
      <div class="ph-body"><h1>${phrase(p.title)}</h1>${sub ? `<div class="meta">${sub}</div>` : ""}</div></header>
    ${p.image ? figure(p.image, p.imageAlt || p.title, "lead-art") : ""}
    ${lede ? `<div class="lede">${renderMd(lede)}</div>` : ""}
    ${myth}
    <article class="md">${renderMd(body, notes)}${notes ? notesBlock(notes) : ""}</article>
    ${p.type === "topic" ? nextRead(p, relT) : ""}
    ${aside ? `<aside class="page-info" aria-label="這一頁的相關資訊">${aside}</aside>` : ""}
  </div></div>`;
  mountCharts(app);
  /* 長文的段落導覽：故事裡有 3 個以上小標時，在「故事是這樣的」上方列出 */
  const hs = [...app.querySelectorAll("article.md h3")];
  if (p.type === "topic" && hs.length >= 3) {
    hs.forEach((h, i) => h.id = "sec-" + (i + 1));
    const nav = document.createElement("nav");
    nav.className = "toc"; nav.setAttribute("aria-label", "本文段落");
    nav.innerHTML = `<b>本文段落</b><ol>${hs.map(h => `<li><a href="#${h.id}" data-sec="${h.id}">${esc(h.textContent)}</a></li>`).join("")}</ol>`;
    const story = [...app.querySelectorAll("article.md h2")].find(h => h.textContent.includes("故事是這樣的"));
    (story || app.querySelector("article.md")).before(nav);
    nav.addEventListener("click", e => { const a = e.target.closest("a[data-sec]"); if (a) { e.preventDefault(); document.getElementById(a.dataset.sec).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } });
    floatToc(hs);
  }
  requestAnimationFrame(() => scrollTo(0, 0));
}

/* 故事結尾「接著讀」：先挑這篇提到的其他故事，不夠再補同分類的，最多 3 篇 */
function nextRead(p, relT) {
  const pick = [...relT.filter(id => byId[id].type === "topic"),
    ...W.pages.filter(x => x.type === "topic" && x.category === p.category).map(x => x.id)]
    .filter((id, i, a) => id !== p.id && a.indexOf(id) === i).slice(0, 3);
  if (!pick.length) return "";
  return `<section class="next-read" aria-label="接著讀"><h2>接著讀</h2><ol class="plates">${pick.map(id => plateItem(byId[id], "h3")).join("")}</ol></section>`;
}

/* 長文目錄：浮動按鈕＋面板，標出目前讀到的小節 */
function floatToc(hs) {
  const wrap = document.createElement("div");
  wrap.className = "ftoc";
  wrap.innerHTML = `<button type="button" class="ftoc-b" aria-expanded="false" aria-controls="ftoc-p"><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="M4 5.5h12M4 10h12M4 14.5h8" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>目錄</button>
    <nav class="ftoc-p" id="ftoc-p" aria-label="本文段落" hidden><b>本文段落</b><ol>${hs.map(h => `<li><a href="#${h.id}" data-sec="${h.id}">${esc(h.textContent)}</a></li>`).join("")}</ol></nav>`;
  document.body.appendChild(wrap);
  const btn = wrap.querySelector(".ftoc-b"), panel = wrap.querySelector(".ftoc-p");
  const close = () => { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); };
  btn.onclick = () => { const o = panel.hidden; panel.hidden = !o; btn.setAttribute("aria-expanded", String(o)); };
  panel.addEventListener("click", e => { const a = e.target.closest("a[data-sec]"); if (a) { e.preventDefault(); close(); document.getElementById(a.dataset.sec).scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } });
  const inline = app.querySelector("nav.toc");
  const upd = () => {
    const art = app.querySelector("article.md");
    const show = (inline ? inline.getBoundingClientRect().bottom < 0 : scrollY > 400) && (!art || art.getBoundingClientRect().bottom > innerHeight * 0.6);
    wrap.classList.toggle("on", show);
    if (!show) close();
    let cur = hs[0];
    hs.forEach(h => { if (h.getBoundingClientRect().top < innerHeight * 0.35) cur = h; });
    panel.querySelectorAll("a").forEach(a => a.classList.toggle("cur", a.dataset.sec === cur.id));
  };
  addEventListener("scroll", upd, { passive: true });
  live.ftoc = { el: wrap, upd };
  upd();
}

/* ---------- 資料庫、關於 ---------- */
function library() {
  setNav("library");
  const src = W.pages.filter(p => p.type === "source").sort((a, b) => (a.year || 0) - (b.year || 0));
  app.innerHTML = `<section class="sec" style="border:0"><h1>資料庫</h1>
  <p class="lead">「全文」是整份讀過；「部分」是精讀了某幾章；「摘要」「書目」只讀到一點點。回憶錄和書信是「當時某個人的說法」，可信度另外標示。</p>
  <div style="overflow-x:auto"><table class="lib"><thead><tr><th>年份</th><th>資料</th><th class="hide-m">類型</th><th class="hide-m">語言</th><th>讀到</th><th class="hide-m">可信度</th></tr></thead><tbody>
  ${src.map(s => `<tr><td>${esc(s.year)}</td><td><a href="#/p/${s.id}">${esc(s.title)}</a><div class="small">${esc(s.author)}</div></td><td class="hide-m">${esc(s.kind)}</td><td class="hide-m">${esc(s.lang || "")}</td><td><span class="depth ${esc(s.depth)}">${esc(s.depth)}</span></td><td class="hide-m">${esc(s.reliability)}</td></tr>`).join("")}
  </tbody></table></div></section>`;
  scrollTo(0, 0);
}
const LOG_KIND = { ingest: "新資料", rule: "規則", site: "網站", lint: "健檢", query: "問答", art: "插圖" };
function about() {
  setNav("about");
  const ov = byId["overview"];
  app.innerHTML = `<section class="sec reading" style="border:0"><div class="about-h"><h1>這個網站怎麼做的</h1><img class="mascot mascot-about" src="assets/img/mascot-about.png" alt="" aria-hidden="true" width="240" height="240" onerror="this.remove()"></div>
  <p class="lead">關於瑪麗．安東尼和路易十六的書、論文、書信和回憶錄多到讀不完，傳說又比史實流傳得更廣。所以讓 AI 一份一份讀，人負責找資料和提問。這個做法叫 LLM Wiki，概念來自 Andrej Karpathy。</p>
  <ol class="flow">
    <li><span><b>收集原始資料</b><br>英文、法文的研究、傳記、當時的書信與回憶錄。有著作權的原文不公開。</span></li>
    <li><span><b>AI 提煉</b><br>照 CLAUDE.md 的規則，一份資料寫一張資料卡，再合成故事、時間軸、地圖與迷思對照。</span></li>
    <li><span><b>自動檢查</b><br>lint.py 檢查格式、出處、斷掉的連結與引文長度，沒通過就不發布。</span></li>
    <li><span><b>產生網站</b><br>build.py 把 wiki 轉成這個網站。新增故事不用改程式。</span></li>
  </ol>
  <h2>怎麼讀</h2>
  <p>故事裡的小小上標數字是註釋，點一下就會在原地展開出處，再點一次收起；全部註釋也整理在文章最後。出處裡的連結會帶你到那份資料的資料卡，看它是什麼書、讀到哪裡、可信度如何。標「（推論）」的是本站自己的推論；標「（本站譯）」的是本站從英文或法文翻的。回憶錄是「某個人多年後的說法」，故事裡會寫出是誰說的。</p>
  <h2>想加新內容</h2>
  <table class="lib" style="margin:14px 0 8px"><thead><tr><th>指令</th><th>做什麼</th></tr></thead><tbody>
    <tr><td><code>/new-topic 主題</code></td><td>例如 <code>/new-topic 王后的熱巧克力</code>，AI 自己找資料、讀全文，新增一個完整的故事。</td></tr>
    <tr><td><code>/ingest</code></td><td>把 PDF 丟進 <code>inbox/</code>，AI 讀完併進網站。</td></tr>
    <tr><td><code>/ask 問題</code></td><td>用網站裡的資料回答問題。</td></tr>
    <tr><td><code>/illustrate 故事</code></td><td>替故事畫一張插圖。</td></tr>
    <tr><td><code>/wiki-lint</code></td><td>健檢，並列出下一批該找的資料。</td></tr>
  </tbody></table>
  <p>想看資料、故事、人物之間怎麼互相連結，可以打開<a href="#/graph">關係網</a>。</p>
  ${ov ? `<h2>總論：目前我們知道什麼</h2><article class="md">${renderMd(ov.body)}</article>` : ""}
  ${W.log?.length ? `<h2>更新紀錄</h2><div style="margin-top:14px">${W.log.slice().reverse().map(l => `<div class="log-row"><b>${esc(l.date)}</b><i>${esc(LOG_KIND[l.kind] || l.kind)}</i><span>${esc(l.title)}</span></div>`).join("")}</div>` : ""}
  </section>`;
  scrollTo(0, 0);
}

/* ---------- 路由 ---------- */
function route() {
  cleanup();
  const h = location.hash || "#/";
  let m;
  if ((m = h.match(/^#\/p\/([^/?#]+)/))) {
    if (byId[m[1]]) return page(byId[m[1]]);
    setNav("");
    app.innerHTML = `<section class="sec" style="border:0"><h1>找不到這一頁</h1><p>網址可能打錯，或這一頁已經改名。<a href="#/">回到故事目錄</a></p></section>`;
    return scrollTo(0, 0);
  }
  if (h.startsWith("#/library")) return library();
  if (h.startsWith("#/about")) return about();
  if (h.startsWith("#/timeline") || h.startsWith("#/#timeline")) return timelinePage();
  if (h.startsWith("#/map") || h.startsWith("#/#map")) return mapPage();
  if (h.startsWith("#/myths")) return mythsPage();
  if (h.startsWith("#/numbers")) return numbers();
  if (h.startsWith("#/debates")) return debates();
  if (h.startsWith("#/graph")) return graph();
  home((h.match(/^#\/#([\w\-]+)/) || [])[1]);
}

fetch("data/wiki.json", { cache: "no-cache" }).then(r => r.json()).then(d => {
  W = d;
  W.pages.forEach(p => byId[p.id] = p);
  W.edges.forEach(([a, b]) => (backlinks[b] = backlinks[b] || []).push(a));
  Object.keys(backlinks).forEach(k => backlinks[k] = [...new Set(backlinks[k])]);
  document.getElementById("built").textContent = `資料更新：${W.built}。${W.counts.sources} 份資料、${W.counts.topics} 個故事。`;
  addEventListener("hashchange", route);
  /* 閱讀進度線：只在故事頁顯示 */
  const bar = document.createElement("div");
  bar.className = "progress"; bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);
  const upd = () => {
    const on = !!document.querySelector(".glaze-h");
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${on && h > 0 ? Math.min(1, scrollY / h) : 0})`;
  };
  addEventListener("scroll", upd, { passive: true }); addEventListener("hashchange", () => setTimeout(upd, 50));
  const top = document.querySelector(".topbar"), menu = document.querySelector(".menu-b"), nav = document.getElementById("nav");
  const setMenu = o => { top.classList.toggle("open", o); menu.setAttribute("aria-expanded", String(o)); };
  menu.onclick = () => setMenu(!top.classList.contains("open"));
  nav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
  let lastY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    if (!top.classList.contains("open")) top.classList.toggle("hide", y > lastY && y > 160);
    lastY = y;
  }, { passive: true });
  addEventListener("hashchange", () => { setMenu(false); top.classList.remove("hide"); });
  /* 已經在 #/#stories 時再按一次「故事」，hash 不變、不會觸發 hashchange，直接捲過去 */
  document.addEventListener("click", e => {
    const l = e.target.closest('a[href^="#/#"]');
    if (l && l.getAttribute("href") === location.hash) { e.preventDefault(); document.getElementById(l.getAttribute("href").slice(3))?.scrollIntoView(); }
  });
  /* 點上標註號：在原地展開／收起那一條出處 */
  app.addEventListener("click", e => {
    const b = e.target.closest(".fn-b");
    if (!b) return;
    const sup = b.closest(".fn-w") || b.parentElement, open = sup.nextElementSibling?.classList.contains("fn-pop");
    document.querySelectorAll(".fn-pop").forEach(x => { x.previousElementSibling?.querySelector(".fn-b")?.setAttribute("aria-expanded", "false"); x.remove(); });
    if (open) return;
    const li = document.getElementById("fn-" + b.dataset.n);
    if (!li) return;
    const pop = document.createElement("span");
    pop.className = "fn-pop"; pop.innerHTML = `<b>${b.dataset.n}</b> ${li.innerHTML}`;
    sup.after(pop); b.setAttribute("aria-expanded", "true");
  });
  document.querySelector(".skip").onclick = e => { e.preventDefault(); app.setAttribute("tabindex", "-1"); app.focus(); };
  route();
}).catch(e => { app.innerHTML = `<p class="loading">資料載入失敗（${esc(e.message)}）。請用網頁伺服器開啟：python3 -m http.server -d docs</p>`; });
