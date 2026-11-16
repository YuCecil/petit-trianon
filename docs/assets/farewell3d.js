/* 最後一晚：1793 年 1 月 20 日，路易十六與家人在聖殿塔告別（rules/site.md「動畫」）。
   全部依克萊里 1798 年日記 pp. 109–110（房間見 pp. 51–52）與瑪麗－泰蕾茲回憶 p. 65 編排：
   誰先進門、誰坐哪裡、誰挽著哪隻手、說了什麼，都照原文；房間尺寸、家具樣式、衣服顏色是示意。
   人物照網站規則不做寫實的臉。 */
import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.160.0/three.module.min.js";

const D2R = Math.PI / 180;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = u => u * u * (3 - 2 * u);
const lerp = (a, b, u) => a + (b - a) * u;

/* ---------- 劇本：字幕、時間卡（秒） ---------- */
const TOTAL = 97;
const CARDS = [[0, 3.4, "1793 年 1 月 20 日", "晚上八點．聖殿塔，國王住的那一層"], [19.6, 22.4, "八點半", ""], [62, 64.6, "十點一刻", ""],
  [88.5, 97, "第二天早上，國王沒有去見她們。", "女兒後來說，他想讓家人少受一次折磨。"]];
const SUBS = [
  [3.4, 8, "克萊里把桌子推到一旁，椅子擺到裡面，空出位置。"],
  [8, 14, "國王說：「拿不冰的水來。王后要是喝了冰水，可能會不舒服。」"],
  [14, 19.6, "等家人下樓的那一刻鐘，國王好幾次走到門口，又走回去。"],
  [22.4, 30, "門開了。王后牽著兒子先進來，公主和伊莉莎白夫人跟在後面，全家撲進國王懷裡。好幾分鐘，只有哭聲。"],
  [30, 36, "王后想把他拉進臥室。國王說：「不，到這間去，我只能在這裡見你們。」"],
  [36, 44, "市政官員只准他們在餐廳見面：門可以關上，但隔著玻璃，要看得到國王。"],
  [44, 52, "國王坐下，王后在他左邊，伊莉莎白夫人在右邊，公主幾乎在正對面，小王子站在父親兩膝之間。"],
  [52, 58, "外面什麼也聽不見。只看得到國王每說一句，她們就哭得更厲害。"],
  [58, 62, "女兒記得，父親叮囑弟弟，要原諒那些害死他的人。"],
  [64.6, 68, "國王先站起來。王后挽著他的右臂，兩人各牽著兒子一隻手；公主從左邊抱住他的腰，伊莉莎白夫人在後面抓著他的左臂。"],
  [68, 70.4, "「我向你們保證，明天早上八點會再見你們。」"],
  [70.4, 72, "「你答應我們？」「答應。」"],
  [72, 74, "「為什麼不是七點？」王后問。「好，七點。再見。」"],
  [74, 77.5, "公主昏倒在父親腳邊。克萊里和伊莉莎白夫人把她扶起來。"],
  [77.5, 82.5, "國王抱了抱她們，掙開身子：「再見……再見……」，走回自己的房間。"],
  [82.5, 88.5, "她們上樓。克萊里想扶公主，在第二級台階被市政官員攔下。門都關上了，樓梯間還傳來哭聲。"],
];

/* ---------- 姿勢（度）：x 正＝往前彎；手臂、大腿 x 負＝往前抬；膝蓋 x 正＝往後彎；手肘 x 負＝前臂往前 ---------- */
const P = {
  stand: { armL: [2, 0, 7], armR: [2, 0, -7], foreL: [-12, 0, 0], foreR: [-12, 0, 0] },
  standSad: { spine: [5, 0, 0], head: [16, 0, 0], armL: [4, 0, 5], armR: [4, 0, -5], foreL: [-18, 0, 0], foreR: [-18, 0, 0] },
  sit: { hipsY: .52, legL: [-86, 0, 4], legR: [-86, 0, -4], kneeL: [86, 0, 0], kneeR: [86, 0, 0], armL: [-18, 0, 6], armR: [-18, 0, -6], foreL: [-55, 0, 0], foreR: [-55, 0, 0] },
  sitLean: { hipsY: .52, legL: [-86, 0, 4], legR: [-86, 0, -4], kneeL: [86, 0, 0], kneeR: [86, 0, 0], spine: [22, 0, 0], chest: [6, 0, 0], head: [8, 0, 0], armL: [-48, 0, -10], armR: [-48, 0, 10], foreL: [-38, 0, 0], foreR: [-38, 0, 0] },
  kingSit: { hipsY: .52, legL: [-86, 0, 12], legR: [-86, 0, -12], kneeL: [86, 0, 0], kneeR: [86, 0, 0], spine: [9, 0, 0], head: [12, 0, 0], armL: [-52, 0, -16], armR: [-52, 0, 16], foreL: [-58, -12, 0], foreR: [-58, 12, 0] },
  childLean: { spine: [12, 0, 0], head: [-4, 0, 0], armL: [-55, 0, -8], armR: [-55, 0, 8], foreL: [-25, 0, 0], foreR: [-25, 0, 0] },
  hug: { spine: [9, 0, 0], head: [12, 0, 0], armL: [-76, 0, -26], armR: [-76, 0, 26], foreL: [-42, -20, 0], foreR: [-42, 20, 0] },
  gesture: { spine: [6, 0, 0], armR: [-58, 0, -18], foreR: [-12, 0, 0], armL: [-30, 0, 10], foreL: [-60, 0, 0] },
  kingWalk: { spine: [4, 0, 0], head: [8, 0, 0], armR: [-18, 0, -10], foreR: [-22, 0, 0], armL: [-6, 0, 14], foreL: [-30, 0, 0] },
  holdArmR: { armL: [-36, 0, -24], foreL: [-78, 0, 0], armR: [-22, 0, -10], foreR: [-28, 0, 0], head: [10, -18, 0] },
  handsUp: { armL: [-30, 0, 26], armR: [-30, 0, -26], foreL: [-12, 0, 0], foreR: [-12, 0, 0], head: [-6, 0, 0] },
  waistHug: { spine: [6, 0, 0], head: [12, 20, 0], armL: [-58, 0, 34], armR: [-58, 0, -40], foreL: [-62, 30, 0], foreR: [-50, -20, 0] },
  holdArmL: { armR: [-48, 0, -26], foreR: [-62, 0, 0], armL: [-34, 0, -8], foreL: [-60, 0, 0], head: [12, -10, 0] },
  faint: { hipsY: .3, spine: [48, 0, 10], chest: [10, 0, 0], head: [34, 0, 0], legL: [-70, 0, 10], legR: [-40, 0, -10], kneeL: [128, 0, 0], kneeR: [100, 0, 0], armL: [10, 0, 26], armR: [10, 0, -26], foreL: [-10, 0, 0], foreR: [-10, 0, 0] },
  support: { hipsY: .8, spine: [40, 0, 0], head: [10, 0, 0], legL: [-34, 0, 0], legR: [-34, 0, 0], kneeL: [40, 0, 0], kneeR: [40, 0, 0], armL: [-64, 0, -8], armR: [-64, 0, 8], foreL: [-30, 0, 0], foreR: [-30, 0, 0] },
  weak: { spine: [14, 0, 0], head: [26, 0, 10], armL: [4, 0, 14], armR: [-10, 0, -10], foreL: [-10, 0, 0], foreR: [-20, 0, 0] },
  push: { spine: [24, 0, 0], armL: [-70, 0, -5], armR: [-70, 0, 5], foreL: [-20, 0, 0], foreR: [-20, 0, 0] },
  watch: { armL: [16, 0, 6], armR: [16, 0, -6], foreL: [-34, 0, 0], foreR: [-34, 0, 0], head: [-3, 0, 0] },
  stop: { armR: [-82, 0, -8], foreR: [-6, 0, 0], armL: [6, 0, 6] },
};
const JOINTS = ["hips", "spine", "chest", "neck", "head", "armL", "foreL", "armR", "foreR", "legL", "kneeL", "legR", "kneeR"];

/* ---------- 走位：K(秒, x, z, 面向角度, 姿勢, 旗標) ；x 往東、z 往南；面向 0＝朝南 ---------- */
const K = (t, x, z, ry, pose = "stand", f = {}) => ({ t, x, z, ry, pose, ...f });
const H = { hide: true };
const TRACKS = {
  king: [K(0, -1.6, 2.2, 90, "standSad"), K(3, -1.6, 2.2, 125, "standSad"), K(8, -1.6, 2.2, 125, "standSad"), K(10.5, -.4, 2.65, 90), K(13, 1.8, 3.3, 60), K(15, 2.7, 3.9, 0, "standSad"), K(16.5, 2.7, 3.9, 0, "standSad"),
    K(18, 1.7, 3.0, -60, "standSad"), K(19.5, 1.7, 3.0, 20, "standSad"), K(21.5, 2.8, 3.2, 0), K(23.6, 2.8, 3.2, 0), K(24.6, 2.8, 3.2, 0, "hug"), K(30, 2.8, 3.2, 0, "hug"),
    K(31, 2.8, 3.2, -40), K(34, 2.6, 3.0, -80, "stand", { talk: 1 }), K(36, 2.6, 3.0, -90), K(38.5, 0, 2.65, -90), K(40.5, -2.12, 2.65, -90), K(41.3, -2.12, 2.65, 90), K(42.6, -2.3, 2.65, 90, "kingSit"),
    K(62, -2.3, 2.65, 90, "kingSit", { talk: 1 }), K(64.5, -2.3, 2.65, 90), K(65.5, -2.0, 2.65, 90, "kingWalk"), K(68.5, 0, 2.65, 90, "kingWalk"), K(71, 1.9, 2.6, 90, "kingWalk", { talk: 1 }), K(73.6, 1.9, 2.6, 90, "kingWalk", { talk: 1 }),
    K(74.4, 1.9, 2.6, 110, "standSad"), K(77, 1.9, 2.6, 110, "standSad"), K(78, 1.95, 2.5, 150, "hug"), K(79.3, 1.95, 2.5, 150, "hug"), K(80.3, 2.2, 1.5, 180, "standSad"), K(81.6, 2.45, .2, 180), K(82.6, 2.45, -1.0, 180), K(83, 2.45, -1.0, 180, "stand", H)],
  queen: [K(0, 3.3, 6.2, 180, "stand", H), K(21.9, 3.3, 5.7, 180), K(23.6, 3.0, 3.9, 180), K(24.5, 2.85, 3.72, 180, "hug", { sob: 1 }), K(30, 2.85, 3.72, 180, "hug", { sob: 1 }), K(31.5, 2.6, 2.75, 160, "gesture"), K(34, 2.6, 2.4, 170, "gesture"),
    K(36, 2.0, 2.4, -90, "standSad", { sob: 1 }), K(38.5, 0, 2.35, -90, "standSad", { sob: 1 }), K(40.5, -1.95, 1.85, -90, "standSad"), K(41.5, -1.95, 1.85, 30), K(42.8, -2.05, 1.8, 30, "sitLean", { sob: 1 }), K(62, -2.05, 1.8, 30, "sitLean", { sob: 1 }),
    K(64.5, -2.05, 1.8, 60, "standSad", { sob: 1 }), K(65.5, -2.0, 3.1, 90, "holdArmR", { sob: 1 }), K(68.5, 0, 3.05, 90, "holdArmR", { sob: 1 }), K(71, 1.9, 3.05, 90, "holdArmR", { sob: 1 }), K(74, 1.9, 3.05, 90, "holdArmR", { sob: 1 }),
    K(77, 2.1, 3.1, 120, "standSad", { sob: 1 }), K(79, 2.1, 3.1, 150, "hug", { sob: 1 }), K(82, 2.4, 3.6, 0, "standSad", { sob: 1 }), K(84.5, 3.35, 4.8, 0, "standSad", { sob: 1 }), K(85.5, 3.35, 5.8, 0, "standSad", H)],
  dauphin: [K(0, 3.7, 6.2, 180, "stand", H), K(22, 3.7, 5.7, 180), K(23.6, 3.4, 3.95, 180), K(24.5, 3.25, 3.6, 200, "hug"), K(30, 3.25, 3.6, 200, "hug"), K(31.5, 3.0, 2.8, 170), K(36, 2.3, 2.75, -90), K(38.5, 0, 2.6, -90),
    K(40.5, -1.6, 2.65, -90), K(41.5, -1.8, 2.65, -90, "childLean"), K(62, -1.8, 2.65, -90, "childLean"), K(64.5, -1.75, 2.65, 90), K(65.5, -1.6, 2.88, 90, "handsUp"), K(68.5, .4, 2.88, 90, "handsUp"), K(71, 2.3, 2.85, 90, "handsUp"),
    K(74, 2.3, 2.85, 90, "handsUp"), K(77, 2.35, 2.95, 120, "standSad"), K(82, 2.6, 3.7, 0, "standSad"), K(84.5, 3.55, 4.8, 0), K(85.5, 3.55, 5.8, 0, "stand", H)],
  mt: [K(0, 3.0, 6.2, 180, "stand", H), K(22.6, 3.0, 5.7, 180), K(24.6, 2.4, 3.65, 160), K(25.3, 2.35, 3.55, 150, "hug", { sob: 1 }), K(30, 2.35, 3.55, 150, "hug", { sob: 1 }), K(31.5, 2.2, 3.4, 180, "standSad", { sob: 1 }),
    K(36, 1.8, 3.0, -90, "standSad", { sob: 1 }), K(38.5, 0, 2.9, -90, "standSad", { sob: 1 }), K(40.5, -.95, 2.75, -90, "standSad"), K(41.3, -.95, 2.75, -90, "standSad"), K(42.6, -.95, 2.75, -90, "sitLean", { sob: 1 }), K(62, -.95, 2.75, -90, "sitLean", { sob: 1 }),
    K(64.5, -.95, 2.75, 90, "standSad", { sob: 1 }), K(65.5, -1.95, 2.2, 90, "waistHug", { sob: 1 }), K(68.5, .05, 2.25, 90, "waistHug", { sob: 1 }), K(71, 1.95, 2.2, 90, "waistHug", { sob: 1 }), K(73.4, 1.95, 2.2, 90, "waistHug", { sob: 1 }),
    K(74.4, 1.95, 2.45, 110, "faint"), K(75.6, 1.95, 2.45, 110, "faint"), K(76.9, 2.0, 2.35, 110, "weak"), K(79, 2.0, 2.3, 120, "weak", { sob: 1 }), K(82, 2.9, 3.4, 0, "weak", { sob: 1 }), K(85, 3.2, 4.8, 0, "weak", { sob: 1 }), K(86, 3.2, 5.8, 0, "weak", H)],
  elis: [K(0, 3.6, 6.2, 180, "stand", H), K(23.2, 3.6, 5.7, 180), K(25, 3.35, 4.15, 190), K(25.6, 3.3, 4.05, 200, "hug", { sob: 1 }), K(30, 3.3, 4.05, 200, "hug", { sob: 1 }), K(31.5, 3.2, 3.4, 180, "standSad", { sob: 1 }),
    K(36, 2.4, 3.2, -90, "standSad"), K(38.5, 0, 2.45, -90, "standSad"), K(40.5, -1.95, 3.5, -90, "standSad"), K(41.5, -1.95, 3.5, 150, "standSad"), K(42.8, -2.05, 3.5, 150, "sitLean", { sob: 1 }), K(62, -2.05, 3.5, 150, "sitLean", { sob: 1 }),
    K(64.5, -2.05, 3.5, 120, "standSad", { sob: 1 }), K(65.5, -2.45, 2.1, 90, "holdArmL", { sob: 1 }), K(68.5, -.4, 2.15, 90, "holdArmL", { sob: 1 }), K(71, 1.5, 2.1, 90, "holdArmL", { sob: 1 }), K(73.6, 1.5, 2.1, 90, "holdArmL", { sob: 1 }),
    K(74.5, 1.72, 2.2, 110, "support"), K(76.5, 1.72, 2.2, 110, "support"), K(77.3, 1.75, 2.15, 110, "standSad", { sob: 1 }), K(82, 2.55, 3.2, 0, "standSad", { sob: 1 }), K(85, 2.95, 4.8, 0, "standSad", { sob: 1 }), K(86, 2.95, 5.8, 0, "standSad", H)],
  clery: [K(0, -2.0, 3.0, 180), K(3, -2.3, 3.45, 180, "push"), K(6.5, -2.5, 3.85, 180, "push"), K(8, -1.9, 3.5, 40), K(12, -1.9, 3.5, 60), K(14, .7, 1.4, 100), K(42.2, .7, 1.4, 100), K(43, .3, 2.0, -90, "gesture"), K(44, .75, 1.4, -60),
    K(64, .75, 1.4, -60), K(64.6, .45, 2.0, -90, "gesture"), K(65.6, 1.2, .9, -120), K(74, 1.2, .9, -120), K(75, 2.25, 2.05, 140, "support"), K(76.5, 2.25, 2.05, 140, "support"), K(77.2, 2.3, 1.95, 140),
    K(82, 2.7, 2.6, 0), K(85, 3.05, 4.15, 0), K(85.8, 3.05, 4.2, 0), K(88, 2.9, 3.6, -20, "standSad")],
  m1: [K(0, .85, 1.0, -90, "watch"), K(97, .85, 1.0, -90, "watch")],
  m2: [K(0, 1.0, 3.95, -100, "watch"), K(21, 1.0, 3.95, -100, "watch"), K(22.5, .8, 4.3, -80, "watch"), K(97, .8, 4.3, -80, "watch")],
  m3: [K(0, 4.1, 4.0, -135, "watch"), K(84.6, 4.1, 4.0, -135, "watch"), K(85.3, 3.35, 4.42, -10, "stop"), K(88, 3.35, 4.42, -10, "stop")],
};

/* 鏡頭：每一個鏡位 [開始, 結束, 起點, 終點, 看向起, 看向終, 視角] */
const SHOTS = [
  [0, 8, [3.9, 2.3, 4.3], [3.3, 1.95, 3.7], [-1.8, 1.0, 2.6], [-1.9, 1.0, 2.8], 44],
  [8, 14, [-.5, 1.45, 4.25], [-.75, 1.35, 4.2], [-2.55, .86, 4.15], [-2.55, .86, 4.15], 32],
  [14, 22.4, [.8, 1.55, .9], [1.0, 1.5, 1.3], [3.1, 1.2, 4.3], [3.0, 1.2, 4.2], 42],
  [22.4, 30, [.55, 1.65, 1.6], [.95, 1.6, 2.05], [3.0, 1.15, 3.7], [2.9, 1.15, 3.6], 40],
  [30, 44, [4.2, 2.1, .7], [3.9, 2.0, 1.0], [.6, 1.0, 2.8], [-1.4, 1.0, 2.6], 46],
  [44, 52, [1.2, 2.05, 3.9], [.7, 2.0, 3.75], [-2.0, .85, 2.45], [-2.0, .85, 2.5], 40],
  [52, 58, [-.55, 1.3, 1.25], [-.7, 1.25, 1.75], [-2.0, .9, 2.65], [-2.05, .9, 2.65], 38],
  [58, 64.6, [-.6, 1.45, 4.2], [-.8, 1.4, 3.9], [-2.1, .9, 2.6], [-2.2, .9, 2.6], 40],
  [64.6, 74, [3.4, 1.6, .7], [3.4, 1.6, 1.3], [.4, 1.0, 2.7], [1.6, 1.0, 2.7], 44],
  [74, 82.6, [4.2, 1.45, 2.9], [4.25, 1.7, 2.5], [1.95, .7, 2.45], [2.35, 1.1, .7], 46],
  [82.6, 97, [1.0, 1.6, 1.7], [1.3, 1.6, 2.2], [3.3, 1.2, 4.7], [3.3, 1.1, 4.9], 42],
];

export async function mount(fig, opts = {}) {
  const ref = opts.ref || (id => id);
  const stage = fig.querySelector(".ta-stage");
  stage.innerHTML = "";
  const W = () => stage.clientWidth, Hh = () => stage.clientHeight;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W(), Hh());
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  stage.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1E2433);
  scene.fog = new THREE.Fog(0x1E2433, 9, 22);
  const camera = new THREE.PerspectiveCamera(42, W() / Hh(), .05, 60);

  /* ---------- 材質：卡通分階上色＋淡淡的墨線，像粉彩速寫 ---------- */
  const grad = new THREE.DataTexture(new Uint8Array([70, 125, 185, 235, 255]), 5, 1, THREE.RedFormat);
  grad.minFilter = grad.magFilter = THREE.NearestFilter; grad.needsUpdate = true;
  const toon = (color, map) => new THREE.MeshToonMaterial({ color, map: map || null, gradientMap: grad });
  const olCache = {};
  const olMat = th => olCache[th] ||= (() => {
    const m = new THREE.MeshBasicMaterial({ color: 0x2E3A4B, side: THREE.BackSide, transparent: true, opacity: .6 });
    m.onBeforeCompile = s => { s.vertexShader = s.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\n transformed += normalize(normal) * ${th.toFixed(4)};`); };
    m.customProgramCacheKey = () => "ol" + th;
    return m;
  })();
  const mesh = (geo, mat, th = .01, shadow = true) => {
    const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true;
    if (th) { const o = new THREE.Mesh(geo, olMat(th)); o.raycast = () => {}; m.add(o); }
    return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  /* ---------- 用程式畫的紋理 ---------- */
  const tex = (w, h, draw, rep = [1, 1]) => {
    const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); t.anisotropy = 4; return t;
  };
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();
  const grain = (g, w, h, a = .06) => { for (let i = 0; i < w * h / 18; i++) { g.fillStyle = `rgba(60,45,30,${rnd() * a})`; g.fillRect(rnd() * w, rnd() * h, 1 + rnd() * 2, 1); } };
  const woodTex = tex(512, 512, (g, w, h) => {
    for (let i = 0; i < 8; i++) { const y = i * h / 8; g.fillStyle = ["#B88E62", "#C29A6C", "#AE865B", "#BD9466"][i % 4]; g.fillRect(0, y, w, h / 8);
      g.strokeStyle = "rgba(70,45,25,.55)"; g.lineWidth = 2; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke();
      const cut = (i * 173) % w; g.beginPath(); g.moveTo(cut, y); g.lineTo(cut, y + h / 8); g.stroke();
      for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(90,60,35,${.08 + rnd() * .12})`; g.lineWidth = 1; g.beginPath(); const yy = y + rnd() * h / 8; g.moveTo(0, yy); g.bezierCurveTo(w * .3, yy + 3, w * .6, yy - 3, w, yy + 1); g.stroke(); } }
    grain(g, w, h);
  }, [3, 3]);
  /* 餐廳的壁紙：克萊里只說「貼了壁紙」，花樣是示意 */
  const paperD = tex(256, 256, (g, w, h) => {
    g.fillStyle = "#E9E4D3"; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 64) { g.fillStyle = "rgba(169,203,140,.35)"; g.fillRect(x + 6, 0, 14, h); g.fillStyle = "rgba(169,203,140,.18)"; g.fillRect(x + 26, 0, 3, h); }
    for (let i = 0; i < 6; i++) { const x = 44 + (i % 2) * 64 + 64 * Math.floor(i / 2) % w, y = 30 + i * 40; g.fillStyle = "rgba(235,163,174,.55)"; g.beginPath(); g.arc(x % w, y % h, 4, 0, 7); g.fill(); g.strokeStyle = "rgba(110,140,90,.5)"; g.beginPath(); g.moveTo(x % w, y % h + 4); g.lineTo(x % w - 3, y % h + 12); g.stroke(); }
    grain(g, w, h, .05);
  }, [3, 1.5]);
  /* 前廳的壁紙：「畫的是監獄的內部」（克萊里 p. 52） */
  const paperA = tex(512, 256, (g, w, h) => {
    g.fillStyle = "#CFC8BA"; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const x = c * 64 + (r % 2) * 32, y = r * 32; g.fillStyle = `rgba(${150 + rnd() * 30},${142 + rnd() * 25},${128 + rnd() * 20},.55)`; g.fillRect(x + 2, y + 2, 60, 28); g.strokeStyle = "rgba(80,72,62,.45)"; g.strokeRect(x + 1, y + 1, 62, 30); }
    g.fillStyle = "rgba(40,36,34,.75)"; g.fillRect(200, 60, 110, 130);
    g.strokeStyle = "rgba(25,22,20,.9)"; g.lineWidth = 6; for (let x = 212; x < 310; x += 18) { g.beginPath(); g.moveTo(x, 60); g.lineTo(x, 190); g.stroke(); }
    g.lineWidth = 5; g.beginPath(); g.moveTo(200, 100); g.lineTo(310, 100); g.stroke();
    grain(g, w, h, .07);
  }, [2, 1.2]);
  const stoneTex = tex(256, 256, (g, w, h) => {
    g.fillStyle = "#BDB5A6"; g.fillRect(0, 0, w, h);
    for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) { const x = c * 64 + (r % 2) * 32, y = r * 43; g.fillStyle = `rgba(${165 + rnd() * 25},${158 + rnd() * 20},${145 + rnd() * 18},1)`; g.fillRect(x + 2, y + 2, 60, 39); }
    grain(g, w, h, .1);
  }, [1, 1]);
  const canvasTex = tex(128, 128, (g, w, h) => { g.fillStyle = "#E8E2D2"; g.fillRect(0, 0, w, h); for (let i = 0; i < w; i += 3) { g.fillStyle = "rgba(120,100,70,.06)"; g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); } }, [6, 6]);
  const tileTex = tex(128, 128, (g, w, h) => { g.fillStyle = "#F2EEE4"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(46,79,152,.35)"; for (let i = 0; i <= w; i += 32) { g.strokeRect(i, 0, 32, h); g.strokeRect(0, i, w, 32); } for (let x = 16; x < w; x += 32) for (let y = 16; y < h; y += 32) { g.fillStyle = "rgba(46,79,152,.45)"; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); } }, [2, 3]);
  const declTex = tex(256, 340, (g, w, h) => {
    g.fillStyle = "#F1E9D2"; g.fillRect(0, 0, w, h);
    [["#2E4F98", 0], ["#FFFFFF", 8], ["#B8323A", 16]].forEach(([c, o]) => { g.strokeStyle = c; g.lineWidth = 8; g.strokeRect(4 + o, 4 + o, w - 8 - 2 * o, h - 8 - 2 * o); });
    g.fillStyle = "rgba(40,30,25,.7)"; g.fillRect(60, 46, 136, 14); g.fillRect(80, 66, 96, 8);
    for (let y = 92; y < h - 40; y += 13) { const l = 150 + rnd() * 30; g.fillRect((w - l) / 2, y, l, 4); }
  });

  /* ---------- 房間（克萊里 pp. 51–52）：餐廳在西、前廳在東，中間是玻璃隔間 ---------- */
  const R = 4.85, CH = 3.6;
  const room = new THREE.Group(); scene.add(room);
  const floor = mesh(new THREE.PlaneGeometry(2 * R, 2 * R), toon(0xffffff, woodTex), 0, false); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, R / 2 - .1); floor.scale.y = .55; room.add(floor);
  const ceil = mesh(new THREE.PlaneGeometry(2 * R, R + .2), toon(0xffffff, canvasTex), 0, false); ceil.rotation.x = Math.PI / 2; ceil.position.set(0, CH, R / 2); room.add(ceil);
  const wall = (w, h, d, mat, x, y, z) => { const m = mesh(B(w, h, d), mat, .012); m.position.set(x, y, z); room.add(m); return m; };
  const matD = toon(0xffffff, paperD), matA = toon(0xffffff, paperA), matStone = toon(0xffffff, stoneTex), matWood = toon(0x8A5E3C), matDark = toon(0x5B3F2A);
  /* 外牆：南面（兩間都有）、餐廳西面開窗、前廳東面開窗 */
  wall(R, CH, .2, matD, -R / 2, CH / 2, R + .1);
  wall(.9, CH, .2, matA, .45 + .1, CH / 2, R + .1); wall(1.05, CH, .2, matA, 4.33, CH / 2, R + .1); wall(.9, CH - 2.3, .2, matA, 3.35, 2.3 + (CH - 2.3) / 2, R + .1);
  wall(1.95, CH, .2, matA, 1.95, CH / 2, R + .1);
  /* 南牆上的門外：通往樓梯塔的暗處 */
  const stair = mesh(B(1.2, 2.6, 1.6), toon(0x2A2622), 0); stair.position.set(3.35, 1.3, R + 1.0); room.add(stair);
  /* 有深窗洞的牆：窗洞九呎深，窗外有鐵條和遮板（p. 52） */
  const windowWall = (sx, mat) => {
    const x = sx * (R + .1), cz = 2.6, ww = 1.0, y0 = .95, y1 = 2.55;
    wall(.2, CH, cz - ww / 2, mat, x, CH / 2, (cz - ww / 2) / 2);
    wall(.2, CH, R - cz - ww / 2, mat, x, CH / 2, cz + ww / 2 + (R - cz - ww / 2) / 2);
    wall(.2, y0, ww, mat, x, y0 / 2, cz); wall(.2, CH - y1, ww, mat, x, y1 + (CH - y1) / 2, cz);
    const depth = 2.9, ex = x + sx * depth / 2;
    [[ex, (y0 + y1) / 2, cz - ww / 2 - .05, .1, y1 - y0, depth], [ex, (y0 + y1) / 2, cz + ww / 2 + .05, .1, y1 - y0, depth]].forEach(([px, py, pz, d, h, w]) => { const m = mesh(B(w, h, d), matStone, .01); m.position.set(px, py, pz); room.add(m); });
    [[y0 - .05], [y1 + .05]].forEach(([py]) => { const m = mesh(B(depth, .1, ww + .2), matStone, .01); m.position.set(ex, py, cz); room.add(m); });
    const far = x + sx * depth;
    const glass = mesh(B(.04, y1 - y0, ww), new THREE.MeshBasicMaterial({ color: 0x1B2338 }), 0); glass.position.set(far, (y0 + y1) / 2, cz); room.add(glass);
    for (let i = -2; i <= 2; i++) { const b = mesh(B(.04, y1 - y0, .04), toon(0x2B2B2B), .004); b.position.set(far - sx * .12, (y0 + y1) / 2, cz + i * .2); room.add(b); }
    const shade = mesh(B(.06, .9, ww + .1), toon(0x4A3A2C), .006); shade.position.set(far + sx * .25, y1 - .2, cz); shade.rotation.z = sx * .5; room.add(shade);
  };
  windowWall(-1, matD); windowWall(1, matA);
  /* 北面：餐廳後面是克萊里的房間；前廳北面有通往國王臥室的門 */
  wall(R - .55, CH, .15, matD, -(R + .55) / 2, CH / 2, -.075);
  wall(1.45, CH, .15, matA, .55 + .725, CH / 2, -.075); wall(R - 2.9, CH, .15, matA, 2.9 + (R - 2.9) / 2, CH / 2, -.075); wall(.9, CH - 2.3, .15, matA, 2.45, 2.3 + (CH - 2.3) / 2, -.075);
  /* 中間的大柱子 */
  const pillar = mesh(new THREE.CylinderGeometry(.55, .55, CH, 24), matStone, .012); pillar.position.set(0, CH / 2, 0); room.add(pillar);
  /* 玻璃隔間：下半是木板，上半是玻璃格（p. 51「一道玻璃隔間」），門在中間 */
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xCFE0E8, transparent: true, opacity: .14, roughness: .05, metalness: 0, side: THREE.DoubleSide });
  const partition = (z0, z1) => {
    const len = z1 - z0, zc = (z0 + z1) / 2;
    const low = mesh(B(.08, .85, len), matWood, .01); low.position.set(0, .425, zc); room.add(low);
    const g = new THREE.Mesh(B(.02, 1.75, len), glassMat); g.position.set(0, .85 + .875, zc); room.add(g);
    for (let z = z0; z <= z1 + .01; z += len / Math.max(1, Math.round(len / .45))) { const m = mesh(B(.07, 1.75, .05), matWood, .006); m.position.set(0, 1.725, z); room.add(m); }
    [.85, 1.45, 2.05, 2.6].forEach(y => { const m = mesh(B(.07, .05, len), matWood, .006); m.position.set(0, y, zc); room.add(m); });
    const top = mesh(B(.08, CH - 2.6, len), matD, .01); top.position.set(0, 2.6 + (CH - 2.6) / 2, zc); room.add(top);
  };
  partition(.55, 2.2); partition(3.1, R);
  const lintel = mesh(B(.08, CH - 2.6, .9), matD, .01); lintel.position.set(0, 2.6 + (CH - 2.6) / 2, 2.65); room.add(lintel);
  /* 門：玻璃門、國王臥室的門、樓梯的門 */
  const door = (w, h, glassy) => {
    const g = new THREE.Group();
    const frame = mesh(B(w, .07, .05), matWood, .005); frame.position.set(w / 2, h - .035, 0); g.add(frame);
    if (glassy) {
      const low = mesh(B(w, .85, .05), matWood, .006); low.position.set(w / 2, .425, 0); g.add(low);
      const gl = new THREE.Mesh(B(w - .1, h - .95, .015), glassMat); gl.position.set(w / 2, .85 + (h - .95) / 2, 0); g.add(gl);
      [0, w].forEach(x => { const s = mesh(B(.05, h, .05), matWood, .005); s.position.set(x + (x ? -.025 : .025), h / 2, 0); g.add(s); });
      [1.45, 2.05].forEach(y => { const s = mesh(B(w, .04, .05), matWood, .004); s.position.set(w / 2, y, 0); g.add(s); });
    } else { const p = mesh(B(w, h, .06), matDark, .008); p.position.set(w / 2, h / 2, 0); g.add(p); const k = mesh(new THREE.SphereGeometry(.035, 8, 8), toon(0xB08D4E), 0); k.position.set(w - .1, 1.05, .05); g.add(k); }
    room.add(g); return g;
  };
  const gDoor = door(.9, 2.6, true); gDoor.position.set(0, 0, 3.1); gDoor.rotation.y = Math.PI / 2;
  const kDoor = door(.9, 2.3, false); kDoor.position.set(2.0, 0, -.075);
  const sDoor = door(.9, 2.3, false); sDoor.position.set(3.8, 0, R + .1); sDoor.rotation.y = Math.PI;
  /* 前廳的大火爐（p. 51）、牆上用三色框貼的《人權宣言》（p. 52）、照明的燈（示意） */
  const stove = new THREE.Group(); stove.position.set(4.35, 0, 1.0); room.add(stove);
  { const b = mesh(B(.75, 1.15, .65), toon(0xffffff, tileTex), .012); b.position.y = .575; stove.add(b);
    const t = mesh(B(.85, .08, .75), toon(0xD9D3C6), .008); t.position.y = 1.19; stove.add(t);
    const p = mesh(new THREE.CylinderGeometry(.08, .08, CH - 1.2, 12), toon(0x3A3A3A), .006); p.position.y = 1.2 + (CH - 1.2) / 2; stove.add(p); }
  const decl = mesh(new THREE.PlaneGeometry(.8, 1.06), toon(0xffffff, declTex), 0, false); decl.position.set(1.7, 1.7, R - .005); decl.rotation.y = Math.PI; room.add(decl);
  const lantern = new THREE.Group(); lantern.position.set(4.3, 1.27, 1.0); room.add(lantern);
  { const f = mesh(B(.18, .26, .18), toon(0x3A332B), .006); f.position.y = .13; lantern.add(f); const gl = new THREE.Mesh(B(.13, .18, .13), new THREE.MeshBasicMaterial({ color: 0xFFD08A })); gl.position.y = .13; lantern.add(gl); }

  /* 餐廳的家具：桌子（被推到一旁）、水瓶和杯子（p. 109）、燭台、椅子 */
  const table = new THREE.Group(); room.add(table);
  { const top = mesh(B(1.25, .05, .78), matWood, .01); top.position.y = .74; table.add(top);
    const apron = mesh(B(1.15, .1, .68), matWood, .008); apron.position.y = .67; table.add(apron);
    [[-.55, -.32], [.55, -.32], [-.55, .32], [.55, .32]].forEach(([x, z]) => { const l = mesh(new THREE.CylinderGeometry(.03, .018, .7, 8), matWood, .006); l.position.set(x, .35, z); table.add(l); });
    const cloth = mesh(B(.5, .006, .3), toon(0xF4F0E6), 0); cloth.position.set(-.2, .768, 0); table.add(cloth);
    const glassyMat = new THREE.MeshPhysicalMaterial({ color: 0xDDEBF0, transparent: true, opacity: .45, roughness: .05 });
    const carafe = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [.055, 0], [.065, .06], [.06, .13], [.025, .19], [.022, .24], [.03, .25]].map(([r, y]) => new THREE.Vector2(r, y)), 20), glassyMat); carafe.position.set(-.3, .77, -.05); table.add(carafe);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(.058, .06, .1, 16), new THREE.MeshBasicMaterial({ color: 0xBFD8E2, transparent: true, opacity: .5 })); water.position.set(-.3, .82, -.05); table.add(water);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.03, .024, .09, 14, 1, true), glassyMat); cup.position.set(-.12, .815, .06); table.add(cup);
  }
  const candles = [];
  [[.25, -.18], [.45, .15]].forEach(([x, z]) => {
    const c = new THREE.Group(); c.position.set(x, .77, z); table.add(c);
    const base = mesh(new THREE.LatheGeometry([[0, 0], [.06, 0], [.05, .02], [.015, .05], [.012, .16], [.03, .18], [.03, .19]].map(([r, y]) => new THREE.Vector2(r, y)), 16), toon(0xC9A85E), .004); c.add(base);
    const wax = mesh(new THREE.CylinderGeometry(.013, .013, 1, 10), toon(0xF6F0E2), .003); c.add(wax);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(.012, .045, 8), new THREE.MeshBasicMaterial({ color: 0xFFD27A })); c.add(flame);
    candles.push({ wax, flame });
  });
  const tableA = [-2.3, 3.0], tableB = [-2.55, 4.15];
  const chair = (x, z, ry) => {
    const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = ry * D2R; room.add(g);
    const seat = mesh(B(.46, .07, .44), toon(0xD9C9A0), .006); seat.position.y = .45; g.add(seat);
    const back = mesh(B(.44, .5, .05), toon(0xD9C9A0), .006); back.position.set(0, .75, -.21); g.add(back);
    const bf = mesh(B(.48, .56, .04), matWood, .005); bf.position.set(0, .74, -.235); g.add(bf);
    [[-.2, -.19], [.2, -.19], [-.2, .19], [.2, .19]].forEach(([a, b]) => { const l = mesh(new THREE.CylinderGeometry(.022, .015, .42, 8), matWood, .004); l.position.set(a, .21, b); g.add(l); });
  };
  /* 椅子放在坐下的人身後（大腿往前伸） */
  const seatAt = (x, z, ry) => { const r = ry * D2R; chair(x + Math.sin(r) * .12, z + Math.cos(r) * .12, ry); };
  seatAt(-2.3, 2.65, 90); seatAt(-2.05, 1.8, 30); seatAt(-2.05, 3.5, 150); seatAt(-.95, 2.75, -90);

  /* ---------- 光：只有燭光和前廳的燈（1 月晚上八點，窗外有遮板） ---------- */
  scene.add(new THREE.HemisphereLight(0x8A98BC, 0x3C3128, .55));
  const candleLight = new THREE.PointLight(0xFFB15C, 5.5, 9, 1.5);
  candleLight.castShadow = true; candleLight.shadow.mapSize.set(1024, 1024); candleLight.shadow.bias = -.004; candleLight.shadow.normalBias = .03; candleLight.shadow.radius = 4;
  scene.add(candleLight);
  const fill = new THREE.PointLight(0xFFC88A, 1.6, 7, 1.6); fill.position.set(-1.2, 2.4, 2.4); scene.add(fill);
  const lampLight = new THREE.PointLight(0xFFC27A, 4.2, 9, 1.5); lampLight.position.set(4.1, 1.75, 1.05); lampLight.castShadow = true; lampLight.shadow.mapSize.set(512, 512); lampLight.shadow.bias = -.004; lampLight.shadow.normalBias = .03; scene.add(lampLight);
  const roomFill = new THREE.PointLight(0xE8D6B8, 1.2, 8, 1.6); roomFill.position.set(2.4, 3.2, 2.6); scene.add(roomFill);

  /* ---------- 人物：有關節的人體，穿 1790 年代的衣服（顏色是示意） ---------- */
  const SKIN = 0xF1D9C8, WHITE = 0xF5F1E8;
  const lathe = (pts, seg = 22, p0 = 0, pl = Math.PI * 2) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg, p0, pl);
  const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 5, 12);
  function human(o) {
    const k = o.h / 1.75, J = {}, root = new THREE.Group();
    const jn = (n, p, x, y, z) => { const g = new THREE.Group(); g.position.set(x * k, y * k, z * k); p.add(g); J[n] = g; return g; };
    const add = (p, geo, color, x = 0, y = 0, z = 0, th = .007, s) => { const m = mesh(geo, toon(color), th); m.position.set(x * k, y * k, z * k); if (s) m.scale.set(...s); p.add(m); return m; };
    jn("hips", root, 0, .95, 0); jn("spine", J.hips, 0, .02, 0); jn("chest", J.spine, 0, .24, 0); jn("neck", J.chest, 0, .2, 0); jn("head", J.neck, 0, .06, 0);
    jn("armL", J.chest, .19, .16, 0); jn("foreL", J.armL, 0, -.29, 0); jn("armR", J.chest, -.19, .16, 0); jn("foreR", J.armR, 0, -.29, 0);
    jn("legL", J.hips, .09, -.04, 0); jn("kneeL", J.legL, 0, -.44, 0); jn("legR", J.hips, -.09, -.04, 0); jn("kneeR", J.legR, 0, -.44, 0);
    const G = (pts, p0, pl) => lathe(pts.map(([r, y]) => [r * k, y * k]), 22, p0, pl);
    /* 軀幹 */
    const torso = add(J.spine, G(o.f ? [[.12, 0], [.13, .08], [.145, .2], [.155, .3], [.15, .38], [.1, .44], [.04, .46]] : [[.15, 0], [.16, .1], [.17, .25], [.18, .36], [.13, .44], [.05, .46]]), o.top);
    torso.scale.z = .74;
    if (o.f) { const fichu = add(J.chest, new THREE.TorusGeometry(.13 * k, .045 * k, 8, 24), WHITE, 0, .13, .005, .005); fichu.rotation.x = Math.PI / 2; fichu.scale.set(1, .8, 1); }
    else { add(J.chest, new THREE.ConeGeometry(.045 * k, .12 * k, 10), WHITE, 0, .14, .1, .004).rotation.x = Math.PI; }
    if (o.sash) [0xB8323A, 0xF5F1E8, 0x2E4F98].forEach((c, i) => { const s = add(J.spine, new THREE.TorusGeometry(.16 * k, .012 * k, 6, 24), c, 0, .2 - i * .025, 0, .002); s.rotation.set(Math.PI / 2 + .5, 0, 0); s.scale.z = .74; });
    /* 頭、頭髮、帽子 */
    add(J.neck, new THREE.CylinderGeometry(.045 * k, .05 * k, .08 * k, 10), SKIN, 0, .02, 0, .004);
    const head = add(J.head, new THREE.SphereGeometry(.1 * k, 20, 16), SKIN, 0, .1, .005, .006, [1, 1.16, 1.05]);
    add(J.head, new THREE.SphereGeometry(.02 * k, 8, 8), SKIN, 0, .09, .1, .003);   /* 鼻子的方向，不畫五官 */
    if (o.hair) { const hh = add(J.head, new THREE.SphereGeometry(.106 * k, 20, 12, 0, Math.PI * 2, 0, Math.PI * .55), o.hair, 0, .115, -.008, .006); hh.scale.set(1, 1.1, 1.08); }
    if (o.wig) { [-1, 1].forEach(s => { const r = add(J.head, cap(.03 * k, .06 * k), o.hair, s * .1, .1, -.02, .004); r.rotation.x = Math.PI / 2; }); const q = add(J.head, cap(.025 * k, .12 * k), o.hair, 0, .02, -.12, .004); q.rotation.x = .3; add(J.head, new THREE.SphereGeometry(.028 * k, 8, 8), 0x1F1F1F, 0, .08, -.115, .003); }
    if (o.long) { const l = add(J.head, cap(.07 * k, .2 * k), o.hair, 0, -.02, -.07, .005); l.scale.set(1.2, 1, .7); }
    if (o.capW) { add(J.head, new THREE.SphereGeometry(.125 * k, 20, 12, 0, Math.PI * 2, 0, Math.PI * .55), WHITE, 0, .12, -.015, .006).scale.set(1, 1.05, 1.08); const ru = add(J.head, new THREE.TorusGeometry(.118 * k, .022 * k, 6, 28), WHITE, 0, .13, .0, .004); ru.rotation.x = Math.PI / 2 - .25; }
    if (o.hat) { add(J.head, new THREE.CylinderGeometry(.11 * k, .115 * k, .14 * k, 20), 0x24242A, 0, .27, 0, .006); add(J.head, new THREE.CylinderGeometry(.19 * k, .19 * k, .015 * k, 24), 0x24242A, 0, .2, 0, .006); }
    /* 手臂 */
    ["L", "R"].forEach(s => {
      add(J["arm" + s], cap(.045 * k, .22 * k), o.sleeve, 0, -.145, 0);
      add(J["fore" + s], cap(.04 * k, .2 * k), o.sleeve, 0, -.12, 0);
      const cuff = add(J["fore" + s], new THREE.TorusGeometry(.043 * k, .016 * k, 6, 16), WHITE, 0, -.235, 0, .003); cuff.rotation.x = Math.PI / 2;
      add(J["fore" + s], new THREE.SphereGeometry(.042 * k, 10, 10), SKIN, 0, -.29, .005, .004, [.75, 1.25, .55]);
    });
    /* 腿、鞋；裙子或外套下擺 */
    ["L", "R"].forEach(s => {
      add(J["leg" + s], cap(.065 * k, .32 * k), o.legs || o.skirt || o.coat, 0, -.22, 0);
      add(J["knee" + s], cap(.05 * k, .34 * k), o.stock || WHITE, 0, -.21, 0, .006);
      add(J["knee" + s], B(.085 * k, .06 * k, .22 * k), 0x2A2522, 0, -.43, .05, .005);
    });
    let skirt = null, coatTail = null;
    if (o.skirt) { skirt = add(J.hips, G([[.46, -.95], [.47, -.88], [.41, -.6], [.3, -.3], [.2, -.08], [.14, .02]]), o.skirt, 0, 0, 0, .009); skirt.material.side = THREE.DoubleSide; if (o.apron) { const ap = add(J.hips, B(.34 * k, .6 * k, .01 * k), WHITE, 0, -.33, .3, .004); ap.rotation.x = -.42; skirt.userData.apron = ap; } }
    if (o.coat) { coatTail = add(J.hips, G([[.22, -.5], [.2, -.32], [.18, -.15], [.16, .02]], .55, Math.PI * 2 - 1.1), o.coat, 0, 0, 0, .006); coatTail.material.side = THREE.DoubleSide; }
    if (o.breeches) ["L", "R"].forEach(s => { const b = J["leg" + s].children.find(c => c.geometry?.type === "CapsuleGeometry"); b.material = toon(o.breeches); });
    root.userData = { J, k, skirt, coatTail, o };
    return root;
  }
  const people = {
    king: human({ h: 1.92, top: 0x6E7C92, sleeve: 0x6E7C92, coat: 0x6E7C92, vest: 0xEDE4CF, breeches: 0x6E7C92, hair: 0xE7E1D4, wig: true }),
    queen: human({ h: 1.68, f: 1, top: 0x9C8FAE, sleeve: 0x9C8FAE, skirt: 0x9C8FAE, capW: true }),
    elis: human({ h: 1.64, f: 1, top: 0x8B9DB6, sleeve: 0x8B9DB6, skirt: 0x8B9DB6, capW: true }),
    mt: human({ h: 1.6, f: 1, top: 0xF1EDE4, sleeve: 0xF1EDE4, skirt: 0xF1EDE4, hair: 0x7E5C3E, long: true }),
    dauphin: human({ h: 1.22, top: 0xB9CDE2, sleeve: 0xB9CDE2, coat: 0xB9CDE2, legs: 0xF1EDE4, hair: 0xD9BC7E }),
    clery: human({ h: 1.74, top: 0x5A4636, sleeve: 0x5A4636, coat: 0x5A4636, vest: 0xD9CFB6, breeches: 0x4A3A2E, hair: 0xE2DCD0, wig: true }),
    m1: human({ h: 1.76, top: 0x34343C, sleeve: 0x34343C, coat: 0x34343C, breeches: 0x34343C, hair: 0x4A3A30, hat: true, sash: true }),
    m2: human({ h: 1.72, top: 0x3E3A36, sleeve: 0x3E3A36, coat: 0x3E3A36, breeches: 0x3E3A36, hair: 0x5A4636, hat: true, sash: true }),
    m3: human({ h: 1.78, top: 0x2F333B, sleeve: 0x2F333B, coat: 0x2F333B, breeches: 0x2F333B, hair: 0x3A3028, hat: true, sash: true }),
  };
  Object.values(people).forEach(p => scene.add(p));

  /* ---------- 依時間算出每個人的位置與姿勢 ---------- */
  const blendPose = (a, b, u, k) => {
    const out = { hipsY: lerp(a.hipsY ?? .95 * k, b.hipsY ?? .95 * k, u) };
    JOINTS.forEach(j => { const x = a[j] || [0, 0, 0], y = b[j] || [0, 0, 0]; out[j] = [lerp(x[0], y[0], u), lerp(x[1], y[1], u), lerp(x[2], y[2], u)]; });
    return out;
  };
  const angLerp = (a, b, u) => { let d = ((b - a + 540) % 360) - 180; return a + d * u; };
  const pose = (name, k) => { const p = P[name] || {}; return p.hipsY != null ? p : { ...p }; };
  const evalPerson = (key, T) => {
    const p = people[key], ks = TRACKS[key], { J, k, skirt, coatTail } = p.userData;
    let i = ks.findLastIndex(q => q.t <= T); if (i < 0) i = 0;
    const a = ks[i], b = ks[Math.min(i + 1, ks.length - 1)];
    const u = b.t > a.t ? clamp((T - a.t) / (b.t - a.t)) : 0, e = smooth(u);
    p.visible = !a.hide;
    const x = lerp(a.x, b.x, e), z = lerp(a.z, b.z, e);
    p.position.set(x, 0, z); p.rotation.y = angLerp(a.ry, b.ry, e) * D2R;
    const ps = blendPose(pose(a.pose, k), pose(b.pose, k), e, k);
    const dist = Math.hypot(b.x - a.x, b.z - a.z);
    if (dist > .05 && !a.hide) {
      const amt = Math.min(1, u * 5, (1 - u) * 5), ph = e * dist / .62 * Math.PI, s = Math.sin(ph);
      ps.legL[0] += -s * 24 * amt; ps.legR[0] += s * 24 * amt;
      ps.kneeL[0] += Math.max(0, s) * 30 * amt; ps.kneeR[0] += Math.max(0, -s) * 30 * amt;
      ps.armL[0] += s * 10 * amt; ps.armR[0] += -s * 10 * amt;
      ps.hipsY += Math.abs(Math.cos(ph)) * .025 * amt;
    }
    const sob = lerp(a.sob || 0, b.sob || 0, e), talk = lerp(a.talk || 0, b.talk || 0, e);
    if (sob) { ps.head[0] += 10 * sob + Math.sin(T * 7.3 + k * 9) * 2.5 * sob; ps.chest[0] += 4 * sob + Math.sin(T * 9.1 + k * 5) * 1.6 * sob; ps.armL[2] += Math.sin(T * 9.1) * 1.5 * sob; ps.armR[2] -= Math.sin(T * 9.1) * 1.5 * sob; }
    if (talk) { ps.head[0] += Math.sin(T * 2.3) * 4 * talk; ps.head[1] += Math.sin(T * 1.3) * 6 * talk; }
    J.hips.position.y = ps.hipsY * (ps.hipsY > .9 ? 1 : 1);
    if (!(P[a.pose]?.hipsY != null || P[b.pose]?.hipsY != null)) J.hips.position.y = ps.hipsY;
    JOINTS.forEach(j => { if (j === "hips") return; const r = ps[j]; J[j].rotation.set(r[0] * D2R, r[1] * D2R, r[2] * D2R); });
    /* 坐下時，裙子和外套下擺往前攤在腿上 */
    const sitAmt = clamp((.95 * k - J.hips.position.y) / (.95 * k - .52));
    [skirt, coatTail].forEach(m => { if (!m) return; m.scale.set(1 + sitAmt * .12, 1 - sitAmt * (m === skirt ? .45 : .35), 1 + sitAmt * .9); m.position.z = sitAmt * .2; if (m.userData.apron) m.userData.apron.visible = false; });
  };

  /* 道具：桌子、門、蠟燭 */
  const doorAng = (T, keys) => { let v = keys[0][1]; for (let i = 0; i < keys.length - 1; i++) { const [t0, a0] = keys[i], [t1, a1] = keys[i + 1]; if (T >= t0) v = T >= t1 ? a1 : lerp(a0, a1, smooth((T - t0) / (t1 - t0))); } return v; };
  const evalProps = T => {
    const u = smooth(clamp((T - 3) / 3.5));
    table.position.set(lerp(tableA[0], tableB[0], u), 0, lerp(tableA[1], tableB[1], u)); table.rotation.y = lerp(0, .25, u);
    gDoor.rotation.y = Math.PI / 2 + doorAng(T, [[0, -80], [42.8, -80], [43.8, 0], [64.1, 0], [64.9, -80]]) * D2R;
    kDoor.rotation.y = doorAng(T, [[0, 0], [80.5, 0], [81.4, 85], [82.7, 85], [83.5, 0]]) * D2R;
    sDoor.rotation.y = Math.PI + doorAng(T, [[0, 0], [21.5, 0], [22.3, -95], [25.6, -95], [26.6, 0], [82.2, 0], [83, -95], [86.6, -95], [87.6, 0]]) * D2R;
    const burn = lerp(.24, .13, clamp((T - 8) / 56));
    candles.forEach(({ wax, flame }, i) => {
      wax.scale.y = burn; wax.position.y = .19 + burn / 2;
      const f = 1 + Math.sin(T * 13 + i * 2) * .08 + Math.sin(T * 23 + i) * .05;
      flame.position.y = .19 + burn + .03; flame.scale.set(1, f, 1);
    });
    const wp = new THREE.Vector3(); candles[0].flame.getWorldPosition(wp); candleLight.position.copy(wp).add(new THREE.Vector3(.1, .08, -.1));
    candleLight.intensity = 5.5 * (1 + Math.sin(T * 11) * .06 + Math.sin(T * 17.3) * .04);
  };

  /* 鏡頭 */
  const v3 = a => new THREE.Vector3(...a);
  const evalCam = T => {
    const s = SHOTS.find(q => T >= q[0] && T < q[1]) || SHOTS[SHOTS.length - 1];
    const u = smooth(clamp((T - s[0]) / (s[1] - s[0])));
    camera.position.lerpVectors(v3(s[2]), v3(s[3]), u);
    camera.lookAt(v3(s[4]).lerp(v3(s[5]), u));
    const narrow = W() < Hh() * 1.05;
    const fov = s[6] * (narrow ? 1.35 : 1);
    if (Math.abs(camera.fov - fov) > .01) { camera.fov = fov; camera.updateProjectionMatrix(); }
  };

  /* ---------- 畫面上的字：時間卡、字幕；紙張紋理 ---------- */
  const paper = document.createElement("div"); paper.className = "fw-paper"; stage.appendChild(paper);
  { const c = document.createElement("canvas"); c.width = c.height = 220; const g = c.getContext("2d"); for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(90,70,50,${Math.random() * .16})`; g.fillRect(Math.random() * 220, Math.random() * 220, 1 + Math.random() * 1.5, 1); } paper.style.backgroundImage = `url(${c.toDataURL()})`; }
  const cardEl = document.createElement("div"); cardEl.className = "fw-cardtitle"; stage.appendChild(cardEl);
  const subEl = document.createElement("div"); subEl.className = "fw-sub"; stage.appendChild(subEl);
  const fade = document.createElement("div"); fade.className = "fw-fade"; stage.appendChild(fade);
  let lastCard = "", lastSub = "";
  const evalText = T => {
    const c = CARDS.find(q => T >= q[0] && T < q[1]);
    const ch = c ? `<b>${c[2]}</b>${c[3] ? `<span>${c[3]}</span>` : ""}` : "";
    if (ch !== lastCard) { cardEl.innerHTML = ch; lastCard = ch; }
    cardEl.classList.toggle("on", !!c);
    const f = c ? Math.min(1, (T - c[0]) / .6, (c[1] - T) / .6) : 0;
    fade.style.opacity = c && (c[0] === 0 || c[0] >= 88) ? Math.max(.0, f) * .92 : (c ? f * .55 : 0);
    const s = SUBS.find(q => T >= q[0] && T < q[1]);
    const sh = s ? s[2] : "";
    if (sh !== lastSub) { subEl.textContent = sh; lastSub = sh; }
    subEl.classList.toggle("on", !!s);
  };

  /* ---------- 播放控制 ---------- */
  const ctl = fig.querySelector(".fw-ctl"), btn = ctl.querySelector(".fw-play"), bar = ctl.querySelector(".fw-bar"), tl = ctl.querySelector(".fw-time");
  fig.querySelector(".ta-card").innerHTML = `<p class="pl-src">出處：${ref("s-1798-clery-journal")} pp. 51–52、109–110；${ref("s-1852-marie-therese-temple")} p. 65。字幕是本站依原文翻譯、濃縮。</p>`;
  bar.max = TOTAL;
  let T = 0, playing = !still, last = performance.now(), alive = true, raf = 0, dirty = true;
  const setBtn = () => { btn.textContent = playing ? "暫停" : (T >= TOTAL ? "重播" : "播放"); };
  btn.onclick = () => { if (T >= TOTAL) T = 0; playing = !playing; last = performance.now(); setBtn(); };
  bar.oninput = () => { T = +bar.value; dirty = true; };
  ctl.querySelector(".fw-restart").onclick = () => { T = 0; playing = true; last = performance.now(); setBtn(); };
  setBtn();
  const fmt = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const frame = now => {
    if (!alive) return;
    const dt = Math.min(.1, (now - last) / 1000); last = now;
    if (playing) { T += dt; if (T >= TOTAL) { T = TOTAL; playing = false; setBtn(); } dirty = true; }
    if (dirty) {
      evalProps(T); Object.keys(people).forEach(k => evalPerson(k, T)); evalCam(T); evalText(T);
      renderer.render(scene, camera);
      bar.value = T; tl.textContent = `${fmt(T)} / ${fmt(TOTAL)}`;
      dirty = playing;
    }
    raf = requestAnimationFrame(frame);
  };
  const ro = new ResizeObserver(() => { if (!alive || !W() || !Hh()) return; renderer.setSize(W(), Hh()); camera.aspect = W() / Hh(); camera.updateProjectionMatrix(); dirty = true; });
  ro.observe(stage);
  /* 測試用：可以跳到某一秒 */
  fig._seek = s => { T = s; playing = false; setBtn(); dirty = true; };
  raf = requestAnimationFrame(frame);
  return () => { alive = false; cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); scene.traverse(o => { o.geometry?.dispose?.(); }); };
}
