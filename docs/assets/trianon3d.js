/* 小特里亞儂立體地圖（3D 互動）。由 app.js 在讀者按「開始互動」後才載入。
   建築與水域輪廓來自 OpenStreetMap（tools/trianon3d.py 產生 assets/trianon3d.json）；
   標記點與說明來自 data/trianon3d-spots.json，每一點都有故事與出處。
   高度是示意，不是實測。 */
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";

const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();

export async function mount(fig, opts = {}) {
  const data = await (await fetch("assets/trianon3d.json?v=" + (opts.v || 1))).json();
  const stage = fig.querySelector(".s3d-stage");
  stage.innerHTML = "";
  const W = () => stage.clientWidth, H = () => stage.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const paper = new THREE.Color(css("--sheet") || "#FFFFFF");
  scene.fog = new THREE.Fog(paper, 1100, 2400);   /* 遠處漸漸淡進紙色，看不到地面的邊 */
  const camera = new THREE.PerspectiveCamera(38, W() / H(), 5, 5000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xdfe6d8, 1.6));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-300, 500, 250);
  scene.add(sun);

  /* 地面：蘋果綠的淡色，像瓷盤上的釉 */
  const [sw, sh] = data.size;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(sw * 6, sh * 6), new THREE.MeshLambertMaterial({ color: 0xe6eedc }));
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const shapeOf = pts => {
    const s = new THREE.Shape();
    pts.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z));
    return s;
  };
  const extrude = (pts, depth, mat) => {
    const g = new THREE.ExtrudeGeometry(shapeOf(pts), { depth, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, mat);
    return m;
  };

  const waterMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(css("--life-glaze") || "#8CC2DD") });
  data.water.forEach(w => { const m = extrude(w.pts, 0.4, waterMat); m.position.y = 0.05; scene.add(m); });

  const ink = new THREE.Color(css("--ink") || "#1C2A4A");
  const gilt = new THREE.Color(css("--gilt") || "#A8823F");
  const wallMat = new THREE.MeshLambertMaterial({ color: 0xfbf7f0 });
  const keyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const lineMat = new THREE.LineBasicMaterial({ color: ink, transparent: true, opacity: 0.35 });
  const giltLine = new THREE.LineBasicMaterial({ color: gilt });
  const named = new Set(["Le Petit Trianon", "Théâtre de la Reine", "Temple de l'Amour", "Belvédère"]);
  const hiMat = new THREE.MeshLambertMaterial({ color: 0xf2dfb4 });   /* 導覽到的建築：淡金 */
  const meshById = {};
  data.buildings.forEach(b => {
    const key = named.has(b.name);
    const m = extrude(b.pts, b.h, key ? keyMat : wallMat);
    m.userData.base = m.material; meshById[b.id] = m;
    scene.add(m);
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), key ? giltLine : lineMat);
    scene.add(e);
  });

  /* 鏡頭：繞著中心轉。拖曳＝旋轉，雙指或滾輪＝縮放，雙指拖曳或右鍵＝平移 */
  const tall = () => H() > W() * 1.1;
  const home = { r: tall() ? 980 : 760, th: -0.35, ph: 0.82, t: new THREE.Vector3(10, 0, -10) };
  const cam = { ...home, t: home.t.clone() };
  const place = () => {
    cam.ph = Math.min(1.35, Math.max(0.25, cam.ph));
    cam.r = Math.min(1600, Math.max(160, cam.r));
    camera.position.set(cam.t.x + cam.r * Math.sin(cam.ph) * Math.sin(cam.th), cam.r * Math.cos(cam.ph), cam.t.z + cam.r * Math.sin(cam.ph) * Math.cos(cam.th));
    camera.lookAt(cam.t);
  };

  /* 標記：HTML 按鈕疊在畫面上，點了在下方顯示說明與故事連結 */
  const layer = document.createElement("div");
  layer.className = "s3d-labels";
  stage.appendChild(layer);
  const info = fig.querySelector(".s3d-info");
  const spots = data.spots.map((s, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "s3d-pin"; b.innerHTML = `<span>${s.name}</span>`; b.setAttribute("aria-label", s.name);
    b.onclick = () => fly(i);
    layer.appendChild(b);
    return { ...s, el: b, v: new THREE.Vector3(s.pos[0], s.h + 6, s.pos[1]) };
  });
  /* 導覽：照時間順序一站一站飛過去；沒有排進導覽的地點，點了也能看說明 */
  const tour = spots.map((s, i) => s.tour ? i : -1).filter(i => i >= 0);
  let sel = 0, lit = null;
  const show = i => {
    sel = i; touch();
    spots.forEach((s, j) => s.el.classList.toggle("on", i === j));
    if (lit) lit.material = lit.userData.base;
    lit = meshById[spots[i].osm] || null;
    if (lit) lit.material = hiMat;
    const s = spots[i], t = opts.title?.(s.topic) || "", k = tour.indexOf(i);
    const head = k >= 0 ? `第 ${k + 1} 站／共 ${tour.length} 站` : "自由逛逛";
    info.innerHTML = `<div class="s3d-nav"><button type="button" class="pl-btn s3d-prev"${k <= 0 ? " disabled" : ""}>← 上一站</button><button type="button" class="pl-btn s3d-next">${k < 0 ? "回到導覽" : k === tour.length - 1 ? "看全景" : "下一站 →"}</button></div>
      <p class="s3d-stop">${head}${s.year ? `<span>${s.year}</span>` : ""}</p><b>${s.name}</b><p>${s.note}</p>
      <p class="s3d-src">出處：${opts.ref ? opts.ref(s.source) : s.source}${t ? `　·　<a href="#/p/${s.topic}">讀這個故事：${t}</a>` : ""}</p>`;
    info.hidden = false;
    info.querySelector(".s3d-prev").onclick = () => fly(tour[k - 1]);
    info.querySelector(".s3d-next").onclick = () => k < 0 ? fly(tour[0]) : k === tour.length - 1 ? overview() : fly(tour[k + 1]);
  };
  /* 鏡頭飛行：1.4 秒的緩動；讀者設定「減少動態」就直接跳過去 */
  let anim = null;
  const tween = (to, ms = 1400) => {
    const from = { r: cam.r, th: cam.th, ph: cam.ph, t: cam.t.clone() };
    let dth = to.th - from.th; dth = Math.atan2(Math.sin(dth), Math.cos(dth));
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) ms = 1;
    const t0 = performance.now();
    anim = now => {
      const u = Math.min(1, (now - t0) / ms), e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      cam.r = from.r + (to.r - from.r) * e; cam.th = from.th + dth * e; cam.ph = from.ph + (to.ph - from.ph) * e;
      cam.t.lerpVectors(from.t, to.t, e);
      if (u >= 1) anim = null;
    };
    touch();
  };
  const fly = i => {
    const s = spots[i];
    show(i);
    tween({ r: tall() ? 330 : 260, th: cam.th + 0.55, ph: 0.92, t: new THREE.Vector3(s.pos[0], 0, s.pos[1]) });
  };
  const overview = () => { tween({ ...home, t: home.t.clone() }); };

  const tmp = new THREE.Vector3();
  /* 地名互相擋住時，排在後面的縮成小圓點（放大之後就有空間顯示文字）；選中的永遠顯示 */
  const drawLabels = () => {
    const w = W(), h = H(), placed = [];
    const order = [sel, ...spots.map((_, i) => i).filter(i => i !== sel)];
    order.forEach(i => {
      const s = spots[i];
      tmp.copy(s.v).project(camera);
      const vis = tmp.z < 1 && Math.abs(tmp.x) < 1.05 && Math.abs(tmp.y) < 1.05;
      s.el.style.visibility = vis ? "visible" : "hidden";
      if (!vis) return;
      const x = (tmp.x + 1) / 2 * w, y = (1 - tmp.y) / 2 * h;
      const bw = s.bw ||= s.el.querySelector("span").offsetWidth + 22, bh = 28;
      const r = { l: x - bw / 2, r: x + bw / 2, t: y - bh - 10, b: y };
      const hit = placed.some(q => r.l < q.r + 4 && r.r > q.l - 4 && r.t < q.b + 2 && r.b > q.t - 2);
      s.el.classList.toggle("dot", hit);
      if (!hit) placed.push(r);
      s.el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -100%)`;
    });
  };

  let dirty = true, raf = 0, alive = true;
  const loop = () => {
    if (!alive) return;
    if (anim) { anim(performance.now()); dirty = true; }
    if (dirty) { place(); renderer.render(scene, camera); drawLabels(); dirty = false; }
    raf = requestAnimationFrame(loop);
  };
  const touch = () => { dirty = true; };

  const el = renderer.domElement;
  el.style.touchAction = "none";
  const pts = new Map();
  let last = null;
  el.addEventListener("pointerdown", e => { anim = null; el.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); last = null; });
  el.addEventListener("pointerup", e => { pts.delete(e.pointerId); last = null; });
  el.addEventListener("pointercancel", e => { pts.delete(e.pointerId); last = null; });
  el.addEventListener("contextmenu", e => e.preventDefault());
  const pan = (dx, dy) => {
    const k = cam.r / 900;
    const c = Math.cos(cam.th), s = Math.sin(cam.th);
    /* 往右拖＝場景往右移；往下拖＝看向更遠處（跟線上地圖一樣） */
    cam.t.x += -dx * c * k - dy * s * k;
    cam.t.z += dx * s * k - dy * c * k;
    cam.t.x = Math.max(-sw / 2, Math.min(sw / 2, cam.t.x)); cam.t.z = Math.max(-sh / 2, Math.min(sh / 2, cam.t.z));
  };
  el.addEventListener("pointermove", e => {
    if (!pts.has(e.pointerId)) return;
    const p = pts.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) {
      if (e.buttons === 2 || e.shiftKey) pan(dx, dy);
      else { cam.th -= dx * 0.006; cam.ph -= dy * 0.005; }
    } else if (pts.size === 2) {
      const [a, b] = [...pts.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      if (last) { cam.r *= last.d / d; pan(m.x - last.m.x, m.y - last.m.y); }
      last = { d, m };
    }
    touch();
  });
  el.addEventListener("wheel", e => { e.preventDefault(); cam.r *= Math.exp(e.deltaY * 0.0012); touch(); }, { passive: false });

  fig.querySelector(".s3d-zoom-in").onclick = () => { cam.r /= 1.3; touch(); };
  fig.querySelector(".s3d-zoom-out").onclick = () => { cam.r *= 1.3; touch(); };
  fig.querySelector(".s3d-reset").onclick = overview;

  const ro = new ResizeObserver(() => { if (!alive || !W() || !H()) return; renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); touch(); });
  ro.observe(stage);
  loop();
  show(tour[0]);
  setTimeout(() => alive && fly(tour[0]), 700);

  return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); scene.traverse(o => { o.geometry?.dispose?.(); }); };
}
