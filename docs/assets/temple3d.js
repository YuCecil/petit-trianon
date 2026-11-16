/* 聖殿塔動畫：一家五口，一個一個被帶走（rules/site.md）。由 app.js 在讀者按「播放」後才載入。
   塔的形狀、樓層、房間照克萊里 1798 年日記的描述（pp. 51–53；小塔見 p. 53 註）重建，比例是示意。
   巴黎地點座標見 data/places.json；塞納河河道取自 OpenStreetMap（© OpenStreetMap contributors，ODbL），是今天的河道。
   每一幕的文字都取自故事裡已有出處的段落。 */
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";

const still = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const LAT0 = 48.8665, LNG0 = 2.361, MLAT = 111320, MLNG = 111320 * Math.cos(LAT0 * Math.PI / 180);
const geo = (lat, lng) => V((lng - LNG0) * MLNG, 0, (LAT0 - lat) * MLAT);
const SEINE = [[[48.85119,2.35386],[48.8513,2.3528],[48.85192,2.3504],[48.85322,2.34722],[48.85429,2.34403],[48.85495,2.34284],[48.85657,2.34084],[48.85783,2.33859],[48.85824,2.33847],[48.85813,2.34009],[48.85673,2.3468],[48.85546,2.35059],[48.85468,2.35223],[48.85175,2.35319],[48.85119,2.35386],[48.85028,2.35676],[48.84847,2.3614],[48.84003,2.3729]],[[48.85824,2.33847],[48.86011,2.32992],[48.85995,2.33022],[48.86188,2.32478],[48.86354,2.31899],[48.86376,2.31728],[48.86375,2.31041],[48.8635,2.30174],[48.86334,2.2995],[48.86266,2.29687]],[[48.84847,2.3614],[48.84931,2.36095],[48.85159,2.36027],[48.85187,2.35981],[48.85468,2.35223]]];
const PL = {
  temple: geo(48.8665, 2.361), conc: geo(48.8562, 2.3456), place: geo(48.8656, 2.3212), tuil: geo(48.8635, 2.3275), east: V(5600, 0, 900),
};

/* ---------- 人物 ---------- */
const PEOPLE = [
  { k: "k", name: "國王", glaze: 0x2E4F98, h: 3.1, w: 1.5 },
  { k: "q", name: "王后", glaze: 0xC7697A, h: 3.0, w: 1.8 },
  { k: "e", name: "伊莉莎白夫人", glaze: 0x8E6BB0, h: 2.9, w: 1.65 },
  { k: "m", name: "公主", glaze: 0x4F93B8, h: 2.5, w: 1.5 },
  { k: "d", name: "王子", glaze: 0xC9A227, h: 2.0, w: 1.3 },
];

/* ---------- 每一幕：set＝這一幕結束時的狀態；play＝動畫 ---------- */
const STEPS = [
  { date: "1792 年 8 月 13 日", text: "杜樂麗宮被攻陷三天後，一家五口坐馬車被送進聖殿塔，人群一路攔車，走了兩個半小時。他們先住在大塔旁邊的小塔：王后、孩子們和伊莉莎白夫人住第二層，國王住第三層。", src: [["s-1883-tourzel-memoires", "第 2 冊第 23 章"], ["s-1798-clery-journal", "p. 53 註"]],
    set: { loc: { k: "pt3", q: "pt2", e: "pt2", m: "pt2", d: "pt2" }, trail: ["tuil"] }, play: "arrive" },
  { date: "1792 年 9 月 3 日", text: "巴黎的監獄發生屠殺。王后的好友朗巴勒親王妃被殺，人群把她的頭插在長矛上，送到塔的窗前，要王后出來看。", src: [["s-1798-clery-journal", "p. 20"]],
    set: {}, play: "crowd" },
  { date: "1792 年 9 月底到 10 月", text: "國王先被搬進大塔，和家人分開住；過了一陣子，王后一家也搬進大塔，住在國王的樓上。大塔四層都是拱頂，中間一根大柱子，用木板隔成四個房間；窗外裝了鐵條和遮板，窗洞有九呎深。王子的床放在國王的房間裡。", src: [["s-1798-clery-journal", "pp. 39–40、50–53"]],
    set: { loc: { k: "g2nw", q: "g3nw", e: "g3ne", m: "g3nw", d: "g2nw" }, cut: true }, play: "move" },
  { date: "1792 年 12 月 11 日", text: "清晨鼓聲大作。市政官員把王子從國王身邊帶回王后那裡，接著巴黎市長上樓，要帶國王去國民公會受審。從這天起，國王一個人住在這一層。", src: [["s-1798-clery-journal", "pp. 76–77"]],
    set: { loc: { d: "g3nw" } }, play: "trial" },
  { date: "1793 年 1 月 20 日晚上八點半", text: "國王已經被判死刑。家人獲准下樓見他最後一面，在餐廳的玻璃隔間裡。克萊里關上玻璃門，好幾分鐘，屋裡只有一片沉默。告別持續了「七刻鐘」，將近兩個小時。", src: [["s-1798-clery-journal", "p. 110"]],
    set: { night: true }, play: "farewell" },
  { date: "1793 年 1 月 21 日上午", text: "國王被送到革命廣場。他想對群眾說話，被鼓聲蓋過。女兒記下，父親死於上午十點十分。", src: [["s-1852-marie-therese-temple", "p. 66"], ["s-1815-edgeworth-memoirs", "約 pp. 86–87"]],
    set: { loc: { k: "place" }, dead: ["k"], trail: ["place"], mem: { place: ["國王 1793.1.21"] } }, play: "king" },
  { date: "1793 年 7 月 3 日", text: "國民公會下令把王子移到「塔裡最安全的房間」。母親死命不肯放手，直到對方威脅要殺了孩子。之後她常爬上塔頂，從一道小縫等著看兒子經過。（推論）王子被關在哪一間，本站沒找到確切記載，畫在樓下是示意。", src: [["s-1852-marie-therese-temple", "pp. 75–77"]],
    set: { loc: { d: "g2ne" } }, play: "son" },
  { date: "1793 年 8 月 2 日凌晨兩點", text: "王后被叫醒，要移到古監獄等候審判。女兒和小姑求著一起去，被拒絕。走出塔門時她的頭撞上門楣，她說：「現在，什麼都不會再傷害我了。」（本站譯）", src: [["s-1852-marie-therese-temple", "p. 79"]],
    set: { loc: { q: "conc" }, night: true, trail: ["conc"] }, play: "queen" },
  { date: "1793 年 10 月 16 日", text: "清晨四點半判決宣讀。王后穿著白色晨衣，坐劊子手的車離開古監獄；沿路站著三萬多名武裝人員。到了革命廣場，她望向原本的王宮花園，臉色突然更白了。", src: [["s-1793-tribunal-proces-criminel-testament", ""]],
    set: { loc: { q: "place" }, dead: ["q"], trail2: ["conc", "place"], mem: { place: ["王后 1793.10.16"] } }, play: "cart" },
  { date: "1794 年 5 月 9 日晚上", text: "有人叫伊莉莎白夫人下樓。她擁抱姪女：「要有勇氣，要堅定。」她被帶到古監獄，隔天一早受審，當天就被送上斷頭台。", src: [["s-1868-feuillet-elisabeth-correspondance", "編者序"], ["s-1899-elisabeth-life-letters-en", "pp. 101–102"]],
    set: { loc: { e: "conc" }, dead: ["e"], night: true, trail: ["conc"], mem: { conc: ["伊莉莎白夫人 1794.5.9"] } }, play: "aunt" },
  { date: "1795 年 6 月 8 日或 9 日", text: "王子死在塔裡，十歲又兩個月。官方紀錄寫 8 日，姊姊的回憶寫 9 日。她說，害死他的「唯一毒藥」，是骯髒、虐待和殘酷。", src: [["s-1852-marie-therese-temple", "p. 105"]],
    set: { dead: ["d"] }, play: "dauphin" },
  { date: "1795 年 12 月 19 日深夜", text: "公主十七歲生日那天深夜，內政部長來塔裡接她，要把她送去和奧地利交換。她是一家五口裡，唯一活著走出這座塔的人。", src: [["s-1852-marie-therese-temple", "pp. 14–17"]],
    set: { loc: { m: "east" }, night: true, trail: ["east"], empty: true }, play: "daughter" },
];

export async function mount(fig, opts = {}) {
  const ref = opts.ref || (id => id);
  const stage = fig.querySelector(".ta-stage");
  stage.innerHTML = "";
  const W = () => stage.clientWidth, H = () => stage.clientHeight;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), H());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const DAY = { bg: new THREE.Color(0xE9EDE8), ground: new THREE.Color(0xD9DED2), hemi: 1.9, sun: 2.4 };
  const NIGHT = { bg: new THREE.Color(0x26324F), ground: new THREE.Color(0x56627E), hemi: 1.1, sun: .5 };
  const scene = new THREE.Scene();
  scene.background = DAY.bg.clone();
  scene.fog = new THREE.Fog(scene.background, 9000, 18000);
  const camera = new THREE.PerspectiveCamera(34, W() / H(), 1, 40000);
  const hemi = new THREE.HemisphereLight(0xffffff, 0xd8ddd2, DAY.hemi);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff3e2, DAY.sun);
  sun.position.set(-60, 150, 130);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -70, right: 70, top: 70, bottom: -70, near: 10, far: 400 });
  sun.shadow.bias = -0.0005;
  scene.add(sun, sun.target);
  const lamp = new THREE.PointLight(0xffc06a, 0, 22, 1.6);   /* 告別那晚餐廳裡的燈 */

  /* ---------- 材質 ---------- */
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, ...o });
  const stone = M(0xF4EEE2), stoneDark = M(0xE2DACB), slate = M(0x5E6A84, { roughness: .55 }), wood = M(0xC9AE85), plank = M(0xB5976B);
  const glass = M(0xBFD9E6, { transparent: true, opacity: .35, roughness: .2 });
  const winMat = M(0x2B3550, { roughness: .4 }), barMat = M(0x3B3B3B), gilt = M(0xA8823F, { metalness: .6, roughness: .35 });
  const groundMat = M(DAY.ground.getHex(), { roughness: 1 });
  const glowOn = new THREE.Color(0xFFC46B);
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  const cyl = (rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 24) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
  const cone = (r, h, mat, x = 0, y = 0, z = 0, seg = 24) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat); m.position.set(x, y, z); m.castShadow = true; return m; };

  const pawnGeo = h => pawnGeo0(h);
  const gable = (len, wid, h, mat, x, y, z) => {   /* 兩面坡的屋頂，沿 x 方向 */
    const sh = new THREE.Shape(); sh.moveTo(-wid / 2, 0); sh.lineTo(wid / 2, 0); sh.lineTo(0, h); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false }); g.translate(0, 0, -len / 2); g.rotateY(Math.PI / 2);
    const m = new THREE.Mesh(g, mat); m.position.set(x, y, z); m.castShadow = true; return m;
  };
  /* ---------- 地面、塞納河 ---------- */
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40000, 40000), groundMat);
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
  scene.add(ground);
  const river = M(0x8CC2DD, { roughness: .5 });
  SEINE.forEach(seg => {
    const pts = seg.map(([la, ln]) => geo(la, ln));
    const pos = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      const n = V(-(b.z - a.z), 0, b.x - a.x).normalize().multiplyScalar(75);
      pos.push(p.x + n.x, 2, p.z + n.z, p.x - n.x, 2, p.z - n.z);
    });
    const idx = [];
    for (let i = 0; i < pts.length - 1; i++) { const j = i * 2; idx.push(j, j + 1, j + 2, j + 1, j + 3, j + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, river); m.material.side = THREE.DoubleSide; scene.add(m);
  });

  /* ---------- 聖殿：花園、圍牆、宮殿、大塔、小塔（克萊里 pp. 51–53） ---------- */
  const temple = new THREE.Group();
  scene.add(temple);
  const yard = new THREE.Group(); temple.add(yard);
  const garden = new THREE.Mesh(new THREE.PlaneGeometry(230, 230), M(0xDDE6D3, { roughness: 1 }));
  garden.rotation.x = -Math.PI / 2; garden.position.y = .15; garden.receiveShadow = true;
  yard.add(garden);
  [[0, -115, 230, 1.2], [0, 115, 230, 1.2], [-115, 0, 1.2, 230], [115, 0, 1.2, 230]].forEach(([x, z, w, d]) => yard.add(box(w, 4, d, stoneDark, x, 2, z)));
  /* 宮殿：「大塔離宮殿兩百步，在花園中間」（p. 53 註）；方位是示意 */
  const palace = new THREE.Group(); palace.position.set(-60, 0, 95);
  palace.add(box(70, 12, 16, stone, 0, 6, 0), box(72, 1, 18, stoneDark, 0, 12.5, 0));
  palace.add(gable(72, 18, 7, slate, 0, 13, 0));
  yard.add(palace);

  const T = 2.2, S = 16, HB = 31;                 /* 牆厚、邊長、牆身高（公尺，示意） */
  const LV = [0.3, 6.3, 12.3, 18.3, 24.3];       /* 地面、第一到第四層的地板高度 */
  const front = new THREE.Group();                /* 剖開時拿掉的南面 */
  const tower = new THREE.Group(); temple.add(tower);
  tower.add(box(S, HB, T, stone, 0, HB / 2, -S / 2 + T / 2));
  tower.add(box(T, HB, S - 2 * T, stone, -S / 2 + T / 2, HB / 2, 0));
  tower.add(box(T, HB, S - 2 * T, stone, S / 2 - T / 2, HB / 2, 0));
  front.add(box(S, HB, T, stone, 0, HB / 2, S / 2 - T / 2));
  /* 雉堞與頂層走廊 */
  for (let i = -7; i <= 7; i += 2) {
    tower.add(box(1.1, 1.6, T, stone, i, HB + .8, -S / 2 + T / 2));
    front.add(box(1.1, 1.6, T, stone, i, HB + .8, S / 2 - T / 2));
    tower.add(box(T, 1.6, 1.1, stone, -S / 2 + T / 2, HB + .8, i));
    tower.add(box(T, 1.6, 1.1, stone, S / 2 - T / 2, HB + .8, i));
  }
  /* 每層外牆的腰線、頂部的托石帶 */
  [...LV.slice(1), HB - .4].forEach((y, i) => {
    const t2 = i === 4 ? .7 : .35, h2 = i === 4 ? .9 : .35;
    tower.add(box(S + t2, h2, t2, stoneDark, 0, y, -S / 2), box(t2, h2, S + t2, stoneDark, -S / 2, y, 0), box(t2, h2, S + t2, stoneDark, S / 2, y, 0));
    front.add(box(S + t2, h2, t2, stoneDark, 0, y, S / 2));
  });
  tower.add(box(S + .8, 1.2, S + .8, stoneDark, 0, .6, 0));
  tower.add(front);
  const roof = cone((S - 2 * T) / Math.SQRT2 + .4, 15, slate, 0, HB + 7.5, 0, 4); roof.rotation.y = Math.PI / 4;
  const cap = new THREE.Group(); cap.add(roof, cyl(.05, .05, 3, gilt, 0, HB + 16, 0, 6)); tower.add(cap);   /* 剖開時屋頂也掀開 */
  /* 四角的小塔樓 */
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
    const host = b > 0 ? front : tower;          /* 南面兩座跟著南牆一起剖開，看得到樓梯 */
    host.add(cyl(2.7, 2.9, HB + 4, stone, a * S / 2, (HB + 4) / 2, b * S / 2));
    host.add(cone(3.2, 8, slate, a * S / 2, HB + 8, b * S / 2));
  });
  /* 樓梯塔剖開後露出的螺旋梯 */
  const stairs = new THREE.Group(); tower.add(stairs);
  for (let i = 0; i < 64; i++) { const st = box(2.2, .18, .7, stoneDark, 0, 0, 0); const a = i * .55, y = i * (LV[3] / 64); st.position.set(-S / 2 + Math.cos(a) * 1.2, y + .3, S / 2 + Math.sin(a) * 1.2); st.rotation.y = -a; stairs.add(st); }
  stairs.add(cyl(.25, .25, LV[4], stoneDark, -S / 2, LV[4] / 2, S / 2, 10));
  front.add(box(1.4, 2.6, .4, winMat, -S / 2, 1.3, S / 2 + 2.7));   /* 樓梯塔的門 */
  /* 樓板、中間的大柱子 */
  LV.forEach(y => tower.add(box(S - 2 * T, .6, S - 2 * T, wood, 0, y - .3, 0)));
  tower.add(cyl(.9, .9, HB, stoneDark, 0, HB / 2, 0, 16));
  /* 窗：每個房間一扇，外面有鐵條和遮板（p. 52） */
  const glows = { 2: [], 3: [] };
  const windowAt = (x, y, z, face, lv) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = face;
    const w = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.2, .2), winMat.clone()); g.add(w);
    for (let i = -1; i <= 1; i++) g.add(box(.08, 2.2, .08, barMat, i * .38, 0, .16));
    const shade = box(1.7, .1, 1.1, plank, 0, 1.25, .45); shade.rotation.x = .7; g.add(shade);
    if (glows[lv]) glows[lv].push(w.material);
    tower.add(g);
  };
  [1, 2, 3, 4].forEach(lv => [-3.2, 3.2].forEach(o => {
    const y = LV[lv] + 2.6;
    windowAt(o, y, -S / 2 - .05, Math.PI, lv);
    windowAt(-S / 2 - .05, y, o, -Math.PI / 2, lv);
    windowAt(S / 2 + .05, y, o, Math.PI / 2, lv);
  }));
  /* 第二、三層用木板隔成四間（p. 51）；國王那層的餐廳用玻璃隔開 */
  const I = S / 2 - T;
  [2, 3].forEach(lv => {
    /* 隔間畫成娃娃屋那樣的矮牆，才看得到每個房間裡的人（實際高到假天花板） */
    const PH = 1.5, y = LV[lv] + PH / 2;
    [[-I, -3.6], [-2.2, 2.2], [3.6, I]].forEach(([a, b]) => tower.add(box(b - a, PH, .18, plank, (a + b) / 2, y, 0)));
    tower.add(box(.18, PH, I - .1, plank, 0, y, -I / 2 - .05));
    const mat = lv === 2 ? glass : plank;
    [[.1, 2.2], [3.6, I]].forEach(([a, b]) => { const m = box(.18, lv === 2 ? 2.6 : PH, b - a, mat, 0, lv === 2 ? LV[lv] + 1.3 : y, (a + b) / 2); if (lv === 2) m.castShadow = false; tower.add(m); });
  });
  lamp.position.set(2.9, LV[2] + 3, 2.9); tower.add(lamp);

  /* 小塔：靠著大塔、長方形、兩座小塔樓（p. 20、p. 53 註）；畫在北面是示意 */
  const small = new THREE.Group(); small.position.set(0, 0, -S / 2 - 4.6); temple.add(small);
  small.add(box(12, 22, 9, stone, 0, 11, 0));
  const sr = cone(8.1, 8, slate, 0, 26, 0, 4); sr.rotation.y = Math.PI / 4; sr.scale.set(1, 1, .75); small.add(sr);
  [-6, 6].forEach(x => { small.add(cyl(1.9, 2, 24, stone, x, 12, -4.5)); small.add(cone(2.3, 6, slate, x, 27, -4.5)); });
  const smallWin = { 2: [], 3: [] };
  [1, 2, 3, 4].forEach(lv => [-2.8, 2.8].forEach(x => {
    const w = box(1.2, 2, .2, winMat.clone(), x, 1.2 + lv * 4.6, -4.6);
    if (smallWin[lv]) smallWin[lv].push(w.material);
    small.add(w);
  }));
  small.add(box(1.5, 2.6, .3, winMat, 0, 1.3, -4.6));

  /* ---------- 巴黎的地點（模型都是示意） ---------- */
  const landmark = (pos, build) => { const g = new THREE.Group(); g.position.copy(pos); build(g); scene.add(g); return g; };
  const conc = landmark(PL.conc, g => {
    g.add(box(90, 16, 24, stone, 0, 8, 0));
    g.add(gable(90, 25, 11, slate, 0, 16, 0));
    [-32, -18, 6].forEach(x => { g.add(cyl(5, 5.4, 24, stone, x, 12, -13)); g.add(cone(6, 12, slate, x, 30, -13)); });
    g.add(box(11, 34, 11, stone, 46, 17, -10)); const c = cone(8.5, 9, slate, 46, 38.5, -10, 4); c.rotation.y = Math.PI / 4; g.add(c);
  });
  const place = landmark(PL.place, g => {
    const pav = cyl(120, 120, .6, M(0xF2EEE4), 0, .3, 0, 8); pav.rotation.y = Math.PI / 8; g.add(pav);
    g.add(box(9, 2.4, 9, M(0x8A5A44), 0, 1.5, 0));
    g.add(box(.45, 6.5, .45, M(0x6E4434), -.9, 6, 0), box(.45, 6.5, .45, M(0x6E4434), .9, 6, 0), box(2.6, .45, .5, M(0x6E4434), 0, 9.2, 0));
    const blade = box(1.6, .9, .12, M(0x9AA3AE, { metalness: .7, roughness: .3 }), 0, 8.2, 0); blade.rotation.z = .35; g.add(blade);
    g.add(box(3, 1.2, .9, M(0x8A5A44), 0, 3.3, 2.2));
    const gg = pawnGeo(2.2), gm = M(0x6E7688);   /* 圍著刑台的衛兵（示意） */
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, m = new THREE.Mesh(gg, gm); m.position.set(Math.cos(a) * 15, .6, Math.sin(a) * 15); m.castShadow = true; g.add(m); }
  });
  const tuil = landmark(PL.tuil, g => {
    g.rotation.y = -.55;
    g.add(box(24, 18, 260, stone, 0, 9, 0), box(34, 28, 34, stone, 0, 14, 0));
    const gr = gable(260, 25, 9, slate, 0, 18, 0); gr.rotation.y = 0; gr.geometry.rotateY(Math.PI / 2); g.add(gr);
    const r = cone(24, 10, slate, 0, 33, 0, 4); r.rotation.y = Math.PI / 4; g.add(r);
  });
  const SCALED = [temple, conc, place, tuil];

  /* ---------- 瓷偶 ---------- */
  function pawnGeo0(h) { return new THREE.LatheGeometry([[0, 0], [.55, 0], [.56, .1], [.44, .2], [.33, .55], [.25, 1.05], [.37, 1.14], [.38, 1.22], [.2, 1.3], [.27, 1.45], [.29, 1.58], [.25, 1.72], [.14, 1.8], [0, 1.83]].map(([r, y]) => new THREE.Vector2(r, y * h / 1.83)), 28); }
  const porcelain = new THREE.MeshPhysicalMaterial({ color: 0xFCFBF7, roughness: .28, clearcoat: .8, clearcoatRoughness: .2 });
  const layer = document.createElement("div"); layer.className = "ta-labels"; stage.appendChild(layer);
  const label = (cls, html) => { const d = document.createElement("div"); d.className = cls; d.innerHTML = html; layer.appendChild(d); return d; };
  const pawns = {};
  PEOPLE.forEach(p => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(pawnGeo(p.h), porcelain.clone()); body.castShadow = true; body.scale.set(p.w, 1, p.w);
    const band = new THREE.Mesh(new THREE.TorusGeometry(.36 * p.w, .07, 8, 28), M(p.glaze, { roughness: .3 }));
    band.rotation.x = Math.PI / 2; band.position.y = 1.18 * p.h / 1.83;
    const skirt = new THREE.Mesh(new THREE.TorusGeometry(.55 * p.w, .06, 8, 28), M(p.glaze, { roughness: .3 }));
    skirt.rotation.x = Math.PI / 2; skirt.position.y = .1;
    g.add(body, band, skirt);
    g.userData = { p, body, lab: label("ta-who", `<i style="background:#${p.glaze.toString(16).padStart(6, "0")}"></i>${p.name}`) };
    pawns[p.k] = g;
  });

  /* 位置：大塔四個房間、小塔的窗、巴黎的地點 */
  const Q = { nw: [-2.9, -2.9], ne: [2.9, -2.9], sw: [-2.9, 2.9], se: [2.9, 2.9] };
  const spread = { k: [0, 0], q: [-1.4, .6], e: [1.2, -1.1], m: [1.3, 1.1], d: [-.5, -1.5] };
  const where = (k, loc) => {
    const o = spread[k];
    if (/^g[23]/.test(loc)) { const lv = +loc[1], [x, z] = Q[loc.slice(2)]; return { grp: temple, at: V(x + o[0], LV[lv], z + o[1]) }; }
    if (loc === "pt2" || loc === "pt3") return { grp: temple, at: V(-2.8 + "kqemd".indexOf(k) * 1.4, 1.2 + (loc === "pt2" ? 2 : 3) * 4.6, -S / 2 - 4.6 - 4.8), hidden: true };
    if (loc === "conc") return { grp: conc, at: V(-10 + o[0] * 4, 0, 20 + o[1] * 3) };
    if (loc === "place") return { grp: place, at: V(o[0] * 3, 2.7, o[1] * 3) };
    return { grp: scene, at: V(0, 0, 0), hidden: true };
  };
  const put = (k, loc, dead) => {
    const g = pawns[k], w = where(k, loc);
    w.grp.add(g); g.position.copy(w.at); g.rotation.y = 0;
    g.visible = !w.hidden && !(dead && (loc === "place" || loc === "conc"));
    g.userData.loc = loc; g.userData.ptLabel = w.hidden && loc.startsWith("pt");
    const ghost = dead && loc.startsWith("g");
    g.userData.body.material.transparent = ghost; g.userData.body.material.opacity = ghost ? .28 : 1;
    g.userData.dead = !!dead;
  };

  /* 路徑：房間 → 前廳 → 樓梯塔 → 另一層；出塔走樓梯塔的門 */
  const DOOR = V(-8, .3, 11.8), COURT = V(-8, .3, 24), STAIR = y => V(-8, y, 8);
  const exitOf = loc => {
    if (/^g[23]/.test(loc)) { const y = LV[+loc[1]]; return [V(-3.4, y, 3.4), STAIR(y)]; }
    if (loc.startsWith("pt")) return [V(0, .3, -S / 2 - 9.6), V(-13, .3, -S / 2 - 9.6), V(-13, .3, 11.8), DOOR, STAIR(.3)];
    return [COURT, DOOR, STAIR(.3)];
  };
  const path = (k, a, b) => {
    const pt = l => l === "court" ? COURT : l.startsWith("pt") ? null : where(k, l).at;
    const pa = pt(a), pb = pt(b);
    if (pa && pb && a.slice(0, 2) === b.slice(0, 2) && a[0] === "g") return [pa, V(-3.4, pa.y, 3.4), pb];
    return [pa, ...exitOf(a), ...exitOf(b).reverse(), pb].filter(Boolean);
  };

  /* ---------- 馬車 ---------- */
  const carriage = new THREE.Group(); scene.add(carriage);
  const cBody = box(2.2, 1.7, 3.2, M(0x1C2A4A, { roughness: .5 }), 0, 1.9, -.4), cRoof = box(2.4, .2, 3.4, gilt, 0, 2.85, -.4);
  carriage.add(cBody, cRoof, box(2.3, .12, 3.3, gilt, 0, 1.15, -.4));
  [[-1.2, .7], [1.2, .7], [-1.2, -1.6], [1.2, -1.6]].forEach(([x, z]) => { const w = new THREE.Mesh(new THREE.TorusGeometry(.6, .1, 8, 20), M(0x2A2A2A)); w.position.set(x, .7, z); w.rotation.y = Math.PI / 2; carriage.add(w); });
  [-.55, .55].forEach(x => { const h = new THREE.Mesh(new THREE.CapsuleGeometry(.42, 1.5, 4, 10), M(0x7A6450)); h.rotation.x = Math.PI / 2; h.position.set(x, 1.4, 2.6); h.castShadow = true; carriage.add(h); });
  carriage.visible = false;
  const cLab = label("ta-car", "");

  /* 走過的路線留在地圖上 */
  const trails = new THREE.Group(); scene.add(trails);
  const trailMat = new THREE.LineDashedMaterial({ color: 0xA8823F, dashSize: 60, gapSize: 40 });
  const curve = (a, b) => { const m = a.clone().add(b).multiplyScalar(.5), d = b.clone().sub(a); return new THREE.QuadraticBezierCurve3(a, m.add(V(-d.z, 0, d.x).multiplyScalar(.12)), b); };
  const addTrail = (a, b) => { const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve(a, b).getPoints(60).map(p => p.setY(3))), trailMat); l.computeLineDistances(); trails.add(l); };

  /* 地名與紀念文字 */
  const pLab = { temple: label("ta-place", "聖殿塔"), conc: label("ta-place", "古監獄"), place: label("ta-place", "革命廣場<small>今協和廣場</small>"), tuil: label("ta-place", "杜樂麗宮"), east: label("ta-place", "往瑞士巴塞爾 →") };
  const floorLab = ["地面：市政官員", "第一層：衛兵", "第二層：國王", "第三層：王后、公主、伊莉莎白夫人", "第四層：空著，雉堞間的走廊"].map(t => label("ta-floor", t));
  const ptLab = { 2: label("ta-floor", ""), 3: label("ta-floor", "") };
  const dateEl = document.createElement("div"); dateEl.className = "ta-date"; stage.appendChild(dateEl);
  const emptyEl = document.createElement("div"); emptyEl.className = "ta-empty"; emptyEl.textContent = "塔裡已經沒有人了"; stage.appendChild(emptyEl);

  /* ---------- 鏡頭 ---------- */
  const cam = { r: 4200, th: .15, ph: .75, t: V(-1200, 0, 400) };
  let sNow = 1;
  const scaleFor = r => Math.min(9, Math.max(1, r / 520));
  const place3 = () => {
    cam.ph = Math.min(1.45, Math.max(.2, cam.ph));
    camera.position.set(cam.t.x + cam.r * Math.sin(cam.ph) * Math.sin(cam.th), cam.t.y + cam.r * Math.cos(cam.ph), cam.t.z + cam.r * Math.sin(cam.ph) * Math.cos(cam.th));
    camera.lookAt(cam.t);
  };

  /* ---------- 動畫引擎：每一幕有自己的編號，切換時舊的動畫立刻作廢 ---------- */
  let run = 0, alive = true, raf = 0, dirty = true, busy = false;
  const tweens = new Set();
  const ease = u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  const anim = (ms, f, lin) => new Promise(res => { tweens.add({ t0: performance.now(), ms: still() ? 1 : ms, f, res, my: run, lin }); });
  const wait = ms => anim(ms, () => {});
  const camTo = (to, ms = 2000) => {
    if (W() < H() * 1.05 && to.r < 300) to = { ...to, r: to.r * 1.55 };   /* 直式螢幕：拉遠一點，標示才不會出框 */
    const f = { r: cam.r, th: cam.th, ph: cam.ph, t: cam.t.clone() };
    let dth = to.th - f.th; dth = Math.atan2(Math.sin(dth), Math.cos(dth));
    return anim(ms, e => { cam.r = f.r * Math.pow(to.r / f.r, e); cam.th = f.th + dth * e; cam.ph = f.ph + (to.ph - f.ph) * e; cam.t.lerpVectors(f.t, to.t, e); });
  };
  const walk = (k, pts, ms) => {
    const g = pawns[k]; g.visible = true;
    pts = pts.filter((p, i) => i === 0 || p.distanceTo(pts[i - 1]) > .01);
    if (pts.length < 2) return Promise.resolve();
    const c = new THREE.CurvePath(); for (let i = 0; i < pts.length - 1; i++) c.add(new THREE.LineCurve3(pts[i], pts[i + 1]));
    return anim(ms || 900 * pts.length, e => {
      const p = c.getPointAt(e), q = c.getPointAt(Math.min(1, e + .01));
      g.position.copy(p); g.position.y += Math.abs(Math.sin(e * 40)) * .12;
      if (Math.hypot(q.x - p.x, q.z - p.z) > 1e-4) g.rotation.y = Math.atan2(q.x - p.x, q.z - p.z);
    }, true);
  };
  const W2 = (grp, v) => grp.localToWorld(v.clone());
  const ride = (names, from, to, ms, cart) => {
    carriage.visible = true; cRoof.visible = cBody.visible = true;
    if (cart) cRoof.visible = false;
    cLab.textContent = names;
    return anim(ms, e => {
      const a = from(), b = to(), c = curve(a, b), p = c.getPointAt(e), q = c.getPointAt(Math.min(1, e + .01));
      carriage.position.copy(p);
      if (q.distanceTo(p) > 1e-3) carriage.rotation.y = Math.atan2(q.x - p.x, q.z - p.z);
    }).then(() => { carriage.visible = false; });
  };
  const fromCourt = () => W2(temple, COURT), atTemple = () => W2(temple, V(-8, 0, 40));
  const atLand = (g, v = V(0, 0, 30)) => () => W2(g, v);
  const towerShot = (o = {}) => ({ r: 92, th: .12, ph: 1.18, t: V(0, 15, 0), ...o });
  const roomShot = (y, o = {}) => ({ r: 42, th: .18, ph: 1.3, t: V(0, y + 1.5, 0), ...o });
  const northShot = { r: 110, th: Math.PI - .7, ph: 1.12, t: V(0, 12, -12) };
  const cityShot = (a, b, r = 6200) => ({ r, th: .12, ph: .66, t: a.clone().add(b).multiplyScalar(.5).setY(0) });

  /* ---------- 狀態 ---------- */
  let state;
  const stateAt = i => {
    const s = { loc: { k: "gone", q: "gone", e: "gone", m: "gone", d: "gone" }, dead: new Set(), trails: [], mem: { place: [], conc: [] }, cut: false, night: false, empty: false };
    for (let j = 0; j <= i; j++) {
      const st = STEPS[j].set;
      Object.assign(s.loc, st.loc || {});
      (st.dead || []).forEach(k => s.dead.add(k));
      if (st.trail) s.trails.push(["temple", st.trail[0]]);
      if (st.trail2) s.trails.push(st.trail2);
      for (const [p, l] of Object.entries(st.mem || {})) s.mem[p].push(...l);
      if (st.cut) s.cut = true;
    }
    s.trails = s.trails.map(([a, b]) => a === "tuil" || b === "tuil" ? ["tuil", "temple"] : [a, b]);
    if (i >= 0) { s.night = !!STEPS[i].set.night; s.empty = !!STEPS[i].set.empty; }
    return s;
  };
  const LPOS = { temple: PL.temple, conc: PL.conc, place: PL.place, tuil: PL.tuil, east: PL.east };
  const setNight = v => {
    const A = v ? NIGHT : DAY;
    scene.background.copy(A.bg); scene.fog.color.copy(A.bg); groundMat.color.copy(A.ground);
    hemi.intensity = A.hemi; sun.intensity = A.sun; hemi.color.set(v ? 0x9FB3E0 : 0xffffff);
  };
  const fadeNight = (v, ms = 1200) => {
    const A = v ? NIGHT : DAY, f = { bg: scene.background.clone(), g: groundMat.color.clone(), h: hemi.intensity, s: sun.intensity };
    return anim(ms, e => {
      scene.background.lerpColors(f.bg, A.bg, e); scene.fog.color.copy(scene.background); groundMat.color.lerpColors(f.g, A.ground, e);
      hemi.intensity = f.h + (A.hemi - f.h) * e; sun.intensity = f.s + (A.sun - f.s) * e;
      hemi.color.lerpColors(new THREE.Color(v ? 0xffffff : 0x9FB3E0), new THREE.Color(v ? 0x9FB3E0 : 0xffffff), e);
    });
  };
  const lights = s => {
    const alive2 = k => !s.dead.has(k);
    [2, 3].forEach(lv => {
      const on = s.night && Object.entries(s.loc).some(([k, l]) => l.startsWith("g" + lv) && alive2(k));
      glows[lv].forEach(m => { m.emissive.copy(on ? glowOn : new THREE.Color(0)); m.emissiveIntensity = on ? 1.1 : 0; });
      const pon = Object.entries(s.loc).some(([k, l]) => l === "pt" + lv);
      smallWin[lv].forEach(m => { m.emissive.copy(pon ? glowOn : new THREE.Color(0)); m.emissiveIntensity = pon ? (s.night ? 1.1 : .55) : 0; });
    });
  };
  const apply = i => {
    state = stateAt(i);
    PEOPLE.forEach(p => put(p.k, state.loc[p.k], state.dead.has(p.k)));
    trails.clear(); state.trails.forEach(([a, b]) => addTrail(LPOS[a], LPOS[b]));
    front.visible = cap.visible = !state.cut; carriage.visible = false; crowd.visible = false; lamp.intensity = 0;
    setNight(state.night); lights(state);
    pLab.place.innerHTML = "革命廣場<small>今協和廣場</small>" + state.mem.place.map(t => `<em>${t}</em>`).join("");
    pLab.conc.innerHTML = "古監獄" + state.mem.conc.map(t => `<em>${t}</em>`).join("");
    emptyEl.classList.toggle("on", state.empty);
    dirty = true;
  };

  /* 9 月 3 日的人群 */
  const crowd = new THREE.Group(); temple.add(crowd); crowd.visible = false;
  const cg = pawnGeo(1.7), cm = M(0x7E8594);
  const crowdPts = [];
  for (let i = 0; i < 46; i++) { const m = new THREE.Mesh(cg, cm); m.castShadow = true; crowd.add(m); crowdPts.push([(Math.random() - .5) * 40, -60 - Math.random() * 50, (Math.random() - .5) * 26, -30 - Math.random() * 14]); }
  const pike = box(.1, 7, .1, M(0x5A4636), 0, 3.5, 0);

  /* ---------- 每一幕的動畫 ---------- */
  const out = async (my, k, names, dest, opt = {}) => {
    const from = state.loc[k];
    await camTo(opt.shot || roomShot(LV[+from[1]] + 1, { r: 70, th: .3 }), 1600); if (my !== run) return;
    await walk(k, path(k, from, "court")); if (my !== run) return;
    pawns[k].visible = false;
    const B = dest === "east" ? () => PL.east.clone() : atLand(dest === "conc" ? conc : place);
    await Promise.all([camTo(cityShot(PL.temple, LPOS[dest]), 2600), ride(names, fromCourt, B, 5200)]); if (my !== run) return;
  };
  const PLAY = {
    async arrive(my) {
      await camTo(cityShot(PL.tuil, PL.temple, 5200), 1); if (my !== run) return;
      await ride("一家五口", atLand(tuil, V(40, 0, 0)), fromCourt, 5200); if (my !== run) return;
      addTrail(PL.tuil, PL.temple);
      await camTo(northShot, 2600); if (my !== run) return;
      await Promise.all(["k", "q", "e", "m", "d"].map((k, i) => { put(k, "gone"); temple.add(pawns[k]); pawns[k].position.copy(COURT); return wait(i * 350).then(() => my === run && walk(k, [V(-8 + i * .8, .3, 24), ...exitOf("pt2").slice(0, 3).reverse().map(v => v.clone()), V(0, .3, -S / 2 - 9.6)], 5200)); }));
    },
    async crowd(my) {
      await camTo({ r: 150, th: Math.PI - .25, ph: 1.12, t: V(0, 8, -40) }, 1800); if (my !== run) return;
      crowd.visible = true;
      crowd.children[0].add(pike); pike.position.set(0, 3.5, 0);
      await anim(4200, e => crowd.children.forEach((m, i) => { const [x, z0, x1, z1] = crowdPts[i]; m.position.set(x + (x1 - x) * e, .3, z0 + (z1 - z0) * e); m.rotation.y = Math.PI; }));
    },
    async move(my) {
      await camTo(northShot, 1400); if (my !== run) return;
      await walk("k", path("k", "pt3", "g2nw"), 6000); if (my !== run) return;
      front.visible = cap.visible = false;
      await camTo(roomShot(LV[2] + 3, { r: 58 }), 2200); if (my !== run) return;
      await Promise.all(["q", "e", "m", "d"].map((k, i) => wait(i * 400).then(() => my === run && walk(k, path(k, "pt2", stateAt(2).loc[k]), 6400))));
    },
    async trial(my) {
      await camTo(roomShot(LV[2] + 3, { r: 52 }), 1600); if (my !== run) return;
      await walk("d", path("d", "g2nw", "g3nw"), 3800); if (my !== run) return;
      await camTo(roomShot(LV[2], { r: 40, t: V(-2.2, LV[2] + 1.5, -2.2), th: .35, ph: 1.24 }), 2200);
    },
    async farewell(my) {
      await Promise.all([fadeNight(true), camTo(roomShot(LV[2] + 3, { r: 52 }), 1800)]); if (my !== run) return;
      lights({ ...state, night: true }); lamp.intensity = 0;
      await Promise.all(["k", "q", "e", "m", "d"].map((k, i) => wait(i * 250).then(() => my === run && walk(k, path(k, state.loc[k], "g2se"), k === "k" ? 2600 : 5200)))); if (my !== run) return;
      await anim(1200, e => { lamp.intensity = 14 * e; }); if (my !== run) return;
      await camTo(roomShot(LV[2], { r: 30, t: V(2.9, LV[2] + 1.6, 2.9), th: .4, ph: 1.27 }), 2400); if (my !== run) return;
      await wait(2200); if (my !== run) return;
      await anim(900, e => { lamp.intensity = 14 * (1 - e); }); if (my !== run) return;
      await camTo(roomShot(LV[2] + 3, { r: 52 }), 1400); if (my !== run) return;
      await Promise.all(["q", "e", "m", "d"].map((k, i) => wait(i * 250).then(() => my === run && walk(k, path(k, "g2se", state.loc[k]), 5200))));
      walk("k", path("k", "g2se", "g2nw"), 2400);
    },
    async king(my) {
      await out(my, "k", "國王", "place"); if (my !== run) return;
      await camTo({ r: 70, th: .5, ph: .95, t: PL.place.clone().setY(5) }, 2600);
    },
    async son(my) {
      await camTo(roomShot(LV[2] + 3, { r: 54 }), 1600); if (my !== run) return;
      await walk("d", path("d", "g3nw", "g2ne"), 4800); if (my !== run) return;
      await camTo(roomShot(LV[3], { r: 40, t: V(-2.2, LV[3] + 1.5, -2.2), th: .35, ph: 1.24 }), 2200);
    },
    async queen(my) {
      await fadeNight(true, 900); lights({ ...state, night: true }); if (my !== run) return;
      await out(my, "q", "王后", "conc"); if (my !== run) return;
      put("q", "conc"); await camTo({ r: 190, th: .3, ph: .95, t: PL.conc.clone().add(V(-10, 8, 22)) }, 2600);
    },
    async cart(my) {
      await camTo({ r: 190, th: .3, ph: .95, t: PL.conc.clone().add(V(-10, 8, 22)) }, 1600); if (my !== run) return;
      pawns.q.visible = false;
      await Promise.all([camTo(cityShot(PL.conc, PL.place, 3800), 2400), ride("王后", atLand(conc), atLand(place), 5600, true)]); if (my !== run) return;
      addTrail(PL.conc, PL.place);
      await camTo({ r: 70, th: .5, ph: .95, t: PL.place.clone().setY(5) }, 2600);
    },
    async aunt(my) {
      await fadeNight(true, 900); lights({ ...state, night: true }); if (my !== run) return;
      await out(my, "e", "伊莉莎白夫人", "conc"); if (my !== run) return;
      await camTo({ r: 190, th: .3, ph: .95, t: PL.conc.clone().add(V(-10, 8, 22)) }, 2600);
    },
    async dauphin(my) {
      await camTo(roomShot(LV[2], { r: 40, t: V(2.4, LV[2] + 1.5, -2.2), th: .3, ph: 1.24 }), 2200); if (my !== run) return;
      const b = pawns.d.userData.body.material; b.transparent = true;
      await anim(2600, e => { b.opacity = 1 - .72 * e; });
    },
    async daughter(my) {
      await fadeNight(true, 900); if (my !== run) return;
      await out(my, "m", "公主", "east", {}); if (my !== run) return;
      await camTo({ r: 5200, th: .1, ph: .7, t: V(-1000, 0, 600) }, 2400);
    },
  };

  /* ---------- 介面 ---------- */
  const card = fig.querySelector(".ta-card"), nav = fig.querySelector(".ta-nav");
  let cur = -1;
  const show = i => {
    const s = STEPS[i];
    dateEl.textContent = s.date;
    card.innerHTML = `<p class="ta-text">${s.text}</p><p class="pl-src">出處：${s.src.map(([id, pg]) => ref(id) + (pg ? " " + pg : "")).join("；")}</p>`;
    nav.querySelector(".ta-step").textContent = `${i + 1} / ${STEPS.length}`;
    nav.querySelector(".ta-prev").disabled = i === 0;
    nav.querySelector(".ta-next").disabled = i === STEPS.length - 1;
  };
  const go = async i => {
    i = Math.max(0, Math.min(STEPS.length - 1, i));
    run++; const my = run;
    tweens.forEach(t => t.res()); tweens.clear();
    cur = i; show(i); busy = true;
    apply(i - 1);
    if (i > 0 && STEPS[i].set.night !== true) setNight(false);
    await PLAY[STEPS[i].play](my);
    if (my !== run) return;
    apply(i); busy = false;
    if (STEPS[i].play === "farewell") lamp.intensity = 0;
  };
  nav.querySelector(".ta-prev").onclick = () => go(cur - 1);
  nav.querySelector(".ta-next").onclick = () => go(cur + 1);
  nav.querySelector(".ta-again").onclick = () => go(cur);

  /* 拖曳：動畫停下來的時候可以自己轉 */
  const el = renderer.domElement; el.style.touchAction = "pan-y";
  let drag = null;
  el.addEventListener("pointerdown", e => { if (!busy) drag = { x: e.clientX, y: e.clientY }; });
  addEventListener("pointerup", () => { drag = null; });
  el.addEventListener("pointermove", e => { if (!drag) return; cam.th -= (e.clientX - drag.x) * .006; cam.ph -= (e.clientY - drag.y) * .004; drag = { x: e.clientX, y: e.clientY }; dirty = true; });

  /* ---------- 每一格畫面 ---------- */
  const tmp = V(0, 0, 0);
  const proj = (v, el2, show2, side) => {
    tmp.copy(v).project(camera);
    const ok = show2 && tmp.z < 1 && Math.abs(tmp.x) < 1.1 && Math.abs(tmp.y) < 1.1;
    el2.style.visibility = ok ? "visible" : "hidden";
    if (ok) el2.style.transform = `translate(${(tmp.x + 1) / 2 * W()}px, ${(1 - tmp.y) / 2 * H()}px) ${side ? "translate(6px, -50%)" : "translate(-50%, -100%)"}`;
  };
  const labels = () => {
    const far = cam.r > 700, near = cam.r < 260;
    PEOPLE.forEach(p => {
      const g = pawns[p.k], u = g.userData;
      const show2 = g.visible && !far && !(u.dead && u.loc.startsWith("g") && cam.r > 90);
      const inTower = u.loc && u.loc[0] === "g";
      const v = g.localToWorld(V(0, inTower ? p.h * .55 : p.h + .5, 0));
      proj(v, u.lab, show2, inTower);
      u.lab.classList.toggle("dead", u.dead);
    });
    proj(W2(temple, V(0, 50, 0)), pLab.temple, far);
    proj(V(PL.conc.x, 40 * sNow, PL.conc.z), pLab.conc, far);
    proj(V(PL.place.x, 14 * sNow, PL.place.z), pLab.place, far);
    proj(V(PL.tuil.x, 34 * sNow, PL.tuil.z), pLab.tuil, far && cur <= 0);
    proj(V(Math.min(PL.east.x, cam.t.x + 2600), 30, PL.east.z), pLab.east, far && cur === STEPS.length - 1);
    LV.forEach((y, i) => proj(W2(temple, V(I, y, I)), floorLab[i], near && !front.visible, true));
    [2, 3].forEach(lv => {
      const who = PEOPLE.filter(p => pawns[p.k].userData.loc === "pt" + lv).map(p => p.name);
      ptLab[lv].textContent = `小塔第${lv === 2 ? "二" : "三"}層：${who.join("、")}`;
      proj(W2(temple, V(0, 1.2 + lv * 4.6 + 1.5, -S / 2 - 9.6)), ptLab[lv], who.length > 0 && !far);
    });
    proj(carriage.position.clone().setY(carriage.position.y + 4 * sNow), cLab, carriage.visible && cam.r > 300);
  };
  const loop = now => {
    if (!alive) return;
    if (tweens.size) {
      for (const t of tweens) {
        const u = Math.min(1, (now - t.t0) / t.ms);
        t.f(t.lin ? u : ease(u));
        if (u >= 1) { tweens.delete(t); t.res(); }
      }
      dirty = true;
    }
    if (dirty) {
      sNow = scaleFor(cam.r);
      SCALED.forEach(g => g.scale.setScalar(sNow)); carriage.scale.setScalar(sNow);
      sun.castShadow = sNow < 2; yard.visible = sNow < 2.2;
      scene.updateMatrixWorld();
      const nr = Math.max(.5, cam.r / 80);
      if (Math.abs(camera.near - nr) > .01) { camera.near = nr; camera.far = cam.r * 10 + 4000; camera.updateProjectionMatrix(); }
      place3(); renderer.render(scene, camera); labels();
      dirty = false;
    }
    raf = requestAnimationFrame(loop);
  };
  const ro = new ResizeObserver(() => { if (!alive || !W() || !H()) return; renderer.setSize(W(), H()); camera.aspect = W() / H(); camera.updateProjectionMatrix(); dirty = true; });
  ro.observe(stage);
  apply(-1); place3();
  raf = requestAnimationFrame(loop);
  go(0);

  return () => { alive = false; run++; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); scene.traverse(o => { o.geometry?.dispose?.(); }); };
}
