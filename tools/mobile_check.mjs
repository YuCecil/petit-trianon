// 手機版自動檢查：用 WebKit（跟 iPhone Safari 同一套核心）模擬 iPhone 17，逐頁打開網站，檢查常見的手機問題。
// 需要先安裝：cd .tools && npm install playwright-core lighthouse && npx playwright-core install webkit
// 用法：node tools/mobile_check.mjs [--shots <截圖資料夾>] [--lighthouse]
//   錯誤（會讓結束碼 = 1）：左右滑動、程式錯誤、圖片或檔案載入失敗
//   提醒：字太小（< 12px）、按鈕太小（< 24×24px）
import { createRequire } from "module";
import { spawn } from "child_process";
import { readFileSync, mkdirSync, existsSync, symlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(ROOT, ".tools", "package.json"));
const { webkit } = require("playwright-core");

const args = process.argv.slice(2);
const shotsDir = args.includes("--shots") ? args[args.indexOf("--shots") + 1] : null;
const runLighthouse = args.includes("--lighthouse");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 8792;
// 跟 GitHub Pages 一樣，網站放在 /petit-trianon/ 底下（404 頁用的是這個路徑）
const BASE = `http://localhost:${PORT}/petit-trianon/`;

// 要模擬的手機：朋友用的 iPhone 17（6.3 吋，畫面 402×874，3 倍解析度）
const DEVICES = [
  { name: "iPhone 17", width: 402, height: 874, dpr: 3,
    ua: "Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1" },
];

// 要檢查的頁面：所有獨立頁 + 每一篇故事 + 各類型抽一頁 + 404
const wiki = JSON.parse(readFileSync(path.join(ROOT, "docs/data/wiki.json"), "utf8"));
const byType = t => wiki.pages.filter(p => p.type === t).map(p => p.id);
const PAGES = [
  "#/", "#/myths", "#/timeline", "#/map", "#/numbers", "#/debates", "#/graph", "#/library", "#/about",
  ...byType("topic").map(id => `#/p/${id}`),
  ...["source", "entity", "question"].flatMap(t => byType(t).slice(0, 1).map(id => `#/p/${id}`)),
  "404.html",
];
const SHOT_PAGES = new Set(["#/", "#/p/t-varennes", "#/timeline", "#/map", "#/myths"]);

const SERVE = path.join(ROOT, ".tools", "serve");
mkdirSync(SERVE, { recursive: true });
if (!existsSync(path.join(SERVE, "petit-trianon"))) symlinkSync(path.join(ROOT, "docs"), path.join(SERVE, "petit-trianon"));
const server = spawn("python3", ["-m", "http.server", String(PORT), "-d", SERVE], { stdio: "ignore" });
await new Promise(r => setTimeout(r, 800));

const browser = await webkit.launch({ headless: true });
const errors = [], warnings = {};
let checked = 0;

try {
  for (const dev of DEVICES) {
    const ctx = await browser.newContext({
      viewport: { width: dev.width, height: dev.height }, deviceScaleFactor: dev.dpr,
      isMobile: true, hasTouch: true, userAgent: dev.ua, locale: "zh-TW",
    });
    for (const route of PAGES) {
      const page = await ctx.newPage();
      const pageErrs = [];
      page.on("pageerror", e => pageErrs.push(`程式錯誤：${e.message}`));
      page.on("console", m => { if (m.type() === "error" && !m.text().startsWith("Failed to load resource")) pageErrs.push(`主控台錯誤：${m.text().slice(0, 160)}`); });
      page.on("requestfailed", r => pageErrs.push(`載入失敗：${r.url().slice(0, 120)}`));
      page.on("response", r => { if (r.status() >= 400 && !r.url().endsWith("favicon.ico")) pageErrs.push(`載入失敗（${r.status()}）：${r.url().slice(0, 120)}`); });

      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 30000 }).catch(e => pageErrs.push(`打不開：${e.message.slice(0, 120)}`));
      await page.waitForTimeout(600); // 讓地圖、圖表畫完
      // 捲到底，觸發延遲載入的圖片
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } scrollTo(0, 0); });
      await page.waitForTimeout(300);

      const r = await page.evaluate(() => {
        const vw = innerWidth, out = { overflow: 0, wide: [], smallText: [], smallTaps: [], brokenImgs: [] };
        out.overflow = document.documentElement.scrollWidth - vw;
        const desc = el => (el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + (el.className && typeof el.className === "string" ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".") : "")).slice(0, 60);
        const inScroller = el => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === "auto" || o === "scroll" || o === "hidden") return true; } return false; };
        for (const el of document.querySelectorAll("body *")) {
          const b = el.getBoundingClientRect();
          if (!b.width || !b.height) continue;
          if (b.right > vw + 1 && !inScroller(el) && out.wide.length < 5) out.wide.push(`${desc(el)}（右緣 ${Math.round(b.right)}px）`);
          const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
          if (own) { const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 12 && out.smallText.length < 5) out.smallText.push(`${desc(el)} ${fs}px「${el.textContent.trim().slice(0, 12)}」`); }
        }
        // 按鈕與選單類的連結（段落裡的文字連結不算，照 WCAG 2.2 的例外）
        for (const el of document.querySelectorAll("button, nav a, header a, .plate a, [role=button], summary, .fn-ref")) {
          const b = el.getBoundingClientRect();
          if (!b.width || !b.height || getComputedStyle(el).visibility === "hidden") continue;
          if ((b.width < 24 || b.height < 24) && out.smallTaps.length < 5) out.smallTaps.push(`${desc(el)} ${Math.round(b.width)}×${Math.round(b.height)}`);
        }
        for (const img of document.images) if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) out.brokenImgs.push(img.getAttribute("src").slice(0, 80));
        return out;
      });

      const where = `[${dev.name}] ${route}`;
      if (r.overflow > 1) errors.push(`${where}：可以左右滑動（多出 ${r.overflow}px）。超出的元素：${r.wide.join("、") || "（找不到單一元素）"}`);
      r.brokenImgs.forEach(s => errors.push(`${where}：圖片壞掉 ${s}`));
      [...new Set(pageErrs)].forEach(e => errors.push(`${where}：${e}`));
      const warn = (msg) => { const k = `[${dev.name}] ${msg}`; (warnings[k] = warnings[k] || []).push(route); };
      if (r.smallText.length) warn(`字太小：${r.smallText[0]}`);
      if (r.smallTaps.length) warn(`按鈕太小：${r.smallTaps[0]}`);

      if (shotsDir && SHOT_PAGES.has(route)) {
        mkdirSync(shotsDir, { recursive: true });
        const name = route.replace(/[#/]+/g, "_").replace(/^_|_$/g, "") || "home";
        await page.screenshot({ path: path.join(shotsDir, `mobile-${name}.png`), fullPage: false });
        await page.screenshot({ path: path.join(shotsDir, `mobile-${name}-full.png`), fullPage: true });
      }
      await page.close();
      checked++;
    }
    await ctx.close();
  }
} finally {
  await browser.close();
}

let lhFail = 0;
if (runLighthouse) {
  const { default: lighthouse } = await import(path.join(ROOT, ".tools/node_modules/lighthouse/core/index.js"));
  const chromeLauncher = require("chrome-launcher");
  const chrome = await chromeLauncher.launch({ chromePath: CHROME, chromeFlags: ["--headless=new"] });
  console.log("\nLighthouse（手機模式）：");
  for (const route of ["#/", "#/p/t-varennes", "#/timeline"]) {
    const res = await lighthouse(BASE + route, { port: chrome.port, output: "json", logLevel: "error",
      onlyCategories: ["accessibility", "best-practices", "seo"], formFactor: "mobile" });
    const c = res.lhr.categories, a = res.lhr.audits;
    const failed = Object.values(a).filter(x => x.score !== null && x.score < 1 && x.scoreDisplayMode === "binary").map(x => x.title);
    const s = k => Math.round(c[k].score * 100);
    console.log(`  ${route}  無障礙 ${s("accessibility")}、最佳做法 ${s("best-practices")}、SEO ${s("seo")}${failed.length ? "\n    未通過：" + failed.join("；") : ""}`);
    if (s("accessibility") < 90) lhFail++;
  }
  await chrome.kill();
}

server.kill();
console.log(`\n手機檢查：${DEVICES.length} 種手機 × ${PAGES.length} 頁 = ${checked} 次`);
const W = Object.entries(warnings);
console.log(`錯誤 ${errors.length}、提醒 ${W.length} 種`);
errors.forEach(e => console.log("✗ " + e));
W.forEach(([k, pages]) => console.log(`△ ${k}（${pages.length} 頁，例如 ${pages.slice(0, 3).join("、")}）`));
if (shotsDir) console.log(`截圖：${shotsDir}`);
process.exit(errors.length || lhFail ? 1 : 0);
