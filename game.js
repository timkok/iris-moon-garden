const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const els = {
  mission: document.querySelector("#missionText"),
  level: document.querySelector("#levelStat"),
  seeds: document.querySelector("#seedStat"),
  bonus: document.querySelector("#bonusStat"),
  time: document.querySelector("#timeStat"),
  hearts: document.querySelector("#heartStat"),
  progress: document.querySelector("#progressFill"),
  overlay: document.querySelector("#overlay"),
  overlayTitle: document.querySelector("#overlayTitle"),
  overlayCopy: document.querySelector("#overlayCopy"),
  start: document.querySelector("#startBtn"),
  restart: document.querySelector("#restartBtn"),
  pause: document.querySelector("#pauseBtn"),
  toast: document.querySelector("#toast"),
  treasure: document.querySelector("#treasureBtn"),
  treasurePanel: document.querySelector("#treasure-panel"),
  closeTreasure: document.querySelector("#closeTreasureBtn"),
  assist: document.querySelector("#assistBtn"),
  assistPanel: document.querySelector("#assist-panel"),
  closeAssist: document.querySelector("#closeAssistBtn"),
  bot: document.querySelector("#botBtn"),
};

const TILE = 48;
let MAX_HEARTS = 3;
const BEST_TIME_KEY = "irisMoonGardenBestSeconds";
const keys = new Set();
let lastTime = 0;
let running = false;
let paused = false;
let levelIndex = 0;
let hearts = 3;
let runTime = 0;
let levelTime = 0;
let startedFromFirstLevel = true;
let sparkle = 0;
let toastTimer = 0;
let lastGateHint = 0;
let overlayAction = "start";

// --- New Features (Game Modes & Rewards) ---
let gameMode = "story"; // story, practice, challenge
let ownedStickers = JSON.parse(localStorage.getItem('iris_moon_stickers')) || [];
let unlockedCosmetics = JSON.parse(localStorage.getItem('iris_moon_cosmetics')) || [];
let currentCosmetic = localStorage.getItem('iris_moon_current_cosmetic') || null;

const levels = [
  {
    name: "第 1 关: 月光小径",
    mission: "在星种子路径中热身，然后找到月光门。",
    map: [
      "####################",
      "#I...*.......#.....#",
      "#.####.#####.#.###.#",
      "#......#...*...#...#",
      "#.##.#.#.#####.#.#.#",
      "#.*..#...#.....#.*.#",
      "#.#######.#.#####..#",
      "#.........#.....*..#",
      "#.######..#####.##.#",
      "#......*.........E.#",
      "#..................#",
      "####################",
    ],
    shadows: [
      { x: 13.5, y: 1.5, minX: 12.5, maxX: 17.5, speed: 1.2 },
    ],
  },
  {
    name: "第 2 关: 萤火虫草地",
    mission: "在穿过彩虹门之前找到彩虹钥匙。",
    map: [
      "####################",
      "#I...#....*....#...#",
      "#.##.#.######..#.#.#",
      "#..*...#....#....#.#",
      "####.#.#.K..####.#.#",
      "#....#...#....D..#.#",
      "#.######.#.#####...#",
      "#.*......#.....*...#",
      "#.##.#########.###.#",
      "#........*.......E.#",
      "#..................#",
      "####################",
    ],
    shadows: [
      { x: 6.5, y: 3.5, minX: 2.5, maxX: 6.5, speed: 1.4 },
      { x: 14.5, y: 6.5, minX: 11.5, maxX: 17.5, speed: 1.6 },
    ],
  },
  {
    name: "第 3 关: 蓝月池塘",
    mission: "蓝色泥潭会减慢 Iris 的速度，趁阴影离开时穿过它们。",
    map: [
      "####################",
      "#I..*....~~~~......#",
      "#.######.####.####.#",
      "#....#...#..*....#.#",
      "####.#.####.###..#.#",
      "#*...#......#....#.#",
      "#.#####.##~~#.####.#",
      "#...~....#..#...*..#",
      "#.#####..#..###.##.#",
      "#.....*..#......E..#",
      "#..~~~~..........~.#",
      "####################",
    ],
    shadows: [
      { x: 12.5, y: 1.5, minX: 9.5, maxX: 17.5, speed: 1.45 },
      { x: 14.5, y: 7.5, minX: 12.5, maxX: 17.5, speed: 1.35 },
    ],
  },
  {
    name: "第 4 关: 蘑菇林",
    mission: "垂直移动的阴影在月亮行巡逻。看准时机穿过。",
    map: [
      "####################",
      "#I....#...*.....#..#",
      "#.###.#.#####.#.#*.#",
      "#...#...#...#.#....#",
      "###.#.###.#.#.####.#",
      "#*..#.....#.#....#.#",
      "#.#.#####.#.####.#.#",
      "#.#.....K.#....D...#",
      "#.#####.#####.####.#",
      "#....*.........*E..#",
      "#..................#",
      "####################",
    ],
    shadows: [
      { x: 3.5, y: 3.5, minY: 1.5, maxY: 6.5, speed: 1.35, axis: "y" },
      { x: 12.5, y: 5.5, minY: 3.5, maxY: 9.5, speed: 1.55, axis: "y" },
      { x: 16.5, y: 9.5, minX: 13.5, maxX: 18.5, speed: 1.25 },
    ],
  },
  {
    name: "第 5 关: 影子花园",
    mission: "在危险的小道上开出一颗爱心。如果花园变得紧张，就抓住它。",
    map: [
      "####################",
      "#I..*....#....*....#",
      "#.#####..#.######..#",
      "#.....#..#......#..#",
      "#####.#.#######.#..#",
      "#*....#...H.....#..#",
      "#.########.####.#..#",
      "#....*.....#..K.D..#",
      "#.##########.####..#",
      "#..~~~~~......*E...#",
      "#..................#",
      "####################",
    ],
    shadows: [
      { x: 6.5, y: 5.5, minX: 1.5, maxX: 8.5, speed: 1.6 },
      { x: 12.5, y: 9.5, minX: 7.5, maxX: 16.5, speed: 1.75 },
      { x: 18.5, y: 4.5, minY: 1.5, maxY: 8.5, speed: 1.3, axis: "y" },
    ],
  },
  {
    name: "第 6 关: 月亮树",
    mission: "最后的月光花园：收集远处的种子，打开门，躲避每一次巡逻。",
    map: [
      "####################",
      "#I..*....#.....*...#",
      "#.######.#.#######.#",
      "#....#...#.....#...#",
      "####.#.#######.#.#.#",
      "#*...#...K.....D.#.#",
      "#.#####.#####.###..#",
      "#.....*.....#...*..#",
      "#.#########.#.####.#",
      "#..H....~~~~#...*E.#",
      "#..................#",
      "####################",
    ],
    shadows: [
      { x: 4.5, y: 3.5, minX: 1.5, maxX: 5.5, speed: 1.7 },
      { x: 9.5, y: 7.5, minX: 6.5, maxX: 11.5, speed: 1.35 },
      { x: 15.5, y: 1.5, minX: 12.5, maxX: 18.5, speed: 1.9 },
      { x: 18.5, y: 6.5, minY: 4.5, maxY: 10.5, speed: 1.45, axis: "y" },
    ],
  },
];

const state = {
  player: { x: 1.5, y: 1.5, radius: 15, speed: 4.1, invincible: 0 },
  seeds: [],
  key: null,
  hasKey: false,
  exit: { x: 18.5, y: 7.5 },
  shadows: [],
  walls: [],
  puddles: [],
  heartPickups: [],
  door: null,
  totalSeeds: 0,
};

function loadLevel(index) {
  const level = levels[index];
  if (!level) return;
  state.seeds = [];
  state.walls = [];
  state.puddles = [];
  state.heartPickups = [];
  state.key = null;
  state.hasKey = false;
  state.door = null;
  state.shadows = level.shadows.map((shadow) => ({ ...shadow, dir: 1 }));

  level.map.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "#") state.walls.push({ x, y });
      if (cell === "I") {
        state.player.x = x + 0.5;
        state.player.y = y + 0.5;
      }
      if (cell === "*") state.seeds.push({ x: x + 0.5, y: y + 0.5, collected: false });
      if (cell === "K") state.key = { x: x + 0.5, y: y + 0.5, collected: false };
      if (cell === "~") state.puddles.push({ x, y });
      if (cell === "H") state.heartPickups.push({ x: x + 0.5, y: y + 0.5, collected: false });
      if (cell === "D") state.door = { x, y };
      if (cell === "E") state.exit = { x: x + 0.5, y: y + 0.5 };
    });
  });

  state.totalSeeds = state.seeds.length;
  state.player.invincible = 1;
  levelTime = 0;
  els.mission.textContent = level.mission;
  
  // HUD Fix: Ensure seeds show correct target on load
  els.seeds.textContent = `⭐ 星种子 0 / ${state.totalSeeds}`;
  
  showToast(`${level.name}: ${level.mission}`, 2.6);
  updateHud();
}

function startGame() {
  // Apply mode settings
  if (gameMode === "practice") {
    MAX_HEARTS = 99;
    hearts = 99;
  } else if (gameMode === "challenge") {
    MAX_HEARTS = 1;
    hearts = 1;
  } else {
    MAX_HEARTS = 3;
    hearts = 3;
  }

  levelIndex = 0;
  runTime = 0;
  levelTime = 0;
  startedFromFirstLevel = true;
  paused = false;
  running = true;
  lastTime = 0;
  keys.clear();
  els.pause.textContent = "暂停";
  loadLevel(levelIndex);
  hideOverlay();
  requestAnimationFrame(loop);
}

function loop(time) {
  const dt = Math.min((time - lastTime) / 1000 || 0, 0.035);
  lastTime = time;
  if (running && !paused) update(dt);
  draw();
  if (running) requestAnimationFrame(loop);
}

function update(dt) {
  sparkle += dt;
  runTime += dt;
  levelTime += dt;
  toastTimer = Math.max(0, toastTimer - dt);
  if (toastTimer === 0) els.toast.classList.add("hidden");
  state.player.invincible = Math.max(0, state.player.invincible - dt);
  movePlayer(dt);
  moveShadows(dt);
  collectItems();
  checkShadowHits();
  checkExit();
  updateHud();
}

function movePlayer(dt) {
  let dx = 0;
  let dy = 0;
  if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
  if (keys.has("arrowright") || keys.has("d")) dx += 1;
  if (keys.has("arrowup") || keys.has("w")) dy -= 1;
  if (keys.has("arrowdown") || keys.has("s")) dy += 1;

  if (dx && dy) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }

  let speedMultiplier = currentSpeedMultiplier();
  if (gameMode === "practice") speedMultiplier *= 1.2; // Move faster in practice
  
  const speed = state.player.speed * speedMultiplier;
  tryMove(dx * speed * dt, 0);
  tryMove(0, dy * speed * dt);
}

function tryMove(dx, dy) {
  const next = { x: state.player.x + dx, y: state.player.y + dy };
  if (!collides(next.x, next.y)) {
    state.player.x = next.x;
    state.player.y = next.y;
  }
}

function collides(x, y) {
  const r = state.player.radius / TILE;
  const probes = [
    [x - r, y - r],
    [x + r, y - r],
    [x - r, y + r],
    [x + r, y + r],
  ];
  return probes.some(([px, py]) => {
    const tx = Math.floor(px);
    const ty = Math.floor(py);
    if (isWall(tx, ty)) return true;
    if (state.door && !state.hasKey && tx === state.door.x && ty === state.door.y) return true;
    return false;
  });
}

function isWall(x, y) {
  const level = levels[levelIndex];
  if (!level || y < 0 || y >= level.map.length || x < 0 || x >= level.map[0].length) return true;
  return state.walls.some((wall) => wall.x === x && wall.y === y);
}

function currentSpeedMultiplier() {
  const tx = Math.floor(state.player.x);
  const ty = Math.floor(state.player.y);
  return state.puddles.some((puddle) => puddle.x === tx && puddle.y === ty) ? 0.58 : 1;
}

function moveShadows(dt) {
  state.shadows.forEach((shadow) => {
    const axis = shadow.axis || "x";
    const min = axis === "x" ? shadow.minX : shadow.minY;
    const max = axis === "x" ? shadow.maxX : shadow.maxY;
    
    let speed = shadow.speed;
    if (gameMode === "practice") speed *= 0.7; // Slower in practice
    if (gameMode === "challenge") speed *= 1.3; // Faster in challenge

    shadow[axis] += shadow.dir * speed * dt;
    if (shadow[axis] > max) {
      shadow[axis] = max;
      shadow.dir = -1;
    }
    if (shadow[axis] < min) {
      shadow[axis] = min;
      shadow.dir = 1;
    }
  });
}

function collectItems() {
  state.seeds.forEach((seed) => {
    if (!seed.collected && distance(seed, state.player) < 0.55) {
      seed.collected = true;
      const collectedCount = state.seeds.filter((item) => item.collected).length;
      els.seeds.textContent = `⭐ 星种子 ${collectedCount} / ${state.totalSeeds}`;
      
      const left = state.totalSeeds - collectedCount;
      if (left === 0) {
        showToast("星种子收集完成！月光门打开啦！", 2);
      } else {
        showToast(`太棒了，Iris！还剩 ${left} 个。`);
      }
    }
  });
  
  if (state.key && !state.key.collected && distance(state.key, state.player) < 0.55) {
    state.key.collected = true;
    state.hasKey = true;
    showToast("彩虹钥匙找到了！");
  }
  
  state.heartPickups.forEach((heart) => {
    if (heart.collected || distance(heart, state.player) >= 0.55) return;
    heart.collected = true;
    if (hearts < MAX_HEARTS) {
      hearts += 1;
      showToast("生命恢复。");
    }
  });
}

function checkShadowHits() {
  if (state.player.invincible > 0) return;
  
  let hitDist = 0.62;
  if (gameMode === "practice") hitDist = 0.4; // More forgiving
  
  const hit = state.shadows.some((shadow) => distance(shadow, state.player) < hitDist);
  if (!hit) return;
  
  hearts -= 1;
  state.player.invincible = 1.4;
  
  // Reset player to start of level
  const level = levels[levelIndex];
  level.map.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "I") {
        state.player.x = x + 0.5;
        state.player.y = y + 0.5;
      }
    });
  });
  
  showToast(hearts > 0 ? "别担心，再试一次！" : "生命耗尽。", 1.5);
  
  if (hearts <= 0) {
    running = false;
    showOverlay("这次飞得很棒！", "再试一次，Iris 离月亮树更近啦。要不要用练习模式试一下？", "重新开始", "retry");
  }
}

function checkExit() {
  const allSeeds = state.seeds.every((seed) => seed.collected);
  const doorOpen = !state.door || state.hasKey;
  
  if (distance(state.exit, state.player) < 0.82 && (!allSeeds || !doorOpen) && sparkle - lastGateHint > 1.4) {
    lastGateHint = sparkle;
    showToast(!allSeeds ? "月光门需要所有星种子才能打开。" : "门还需要要是。");
  }
  
  if (allSeeds && doorOpen && distance(state.exit, state.player) < 0.62) {
    // Unlock sticker for this level
    unlockSticker(levelIndex);
    
    levelIndex += 1;
    if (levelIndex >= levels.length) {
      running = false;
      els.progress.style.width = "100%";
      showOverlay("你完成了所有冒险！", "所有的星种子都在闪闪发光，月亮树被点亮了！", "再玩一次", "start");
      return;
    }
    loadLevel(levelIndex);
  }
}

function updateHud() {
  els.level.textContent = levels[levelIndex]?.name || "完成";
  els.bonus.textContent = state.hasKey ? "钥匙已找到" : "寻找钥匙";
  els.time.textContent = `⏱ 时间 ${formatTime(runTime)}`;
  
  if (gameMode === "practice") {
    els.hearts.textContent = "💖 无限";
  } else {
    els.hearts.textContent = "💖 " + "♡".repeat(hearts);
  }
  
  els.progress.style.width = `${Math.round(progressPercent())}%`;
}

function progressPercent() {
  if (!levels[levelIndex]) return 100;
  const seedProgress = state.totalSeeds ? state.seeds.filter((seed) => seed.collected).length / state.totalSeeds : 0;
  return ((levelIndex + seedProgress) / levels.length) * 100;
}

function showOverlay(title, copy, button, action = "start") {
  els.overlayTitle.textContent = title;
  els.overlayCopy.textContent = copy;
  els.start.textContent = button;
  overlayAction = action;
  els.overlay.classList.remove("hidden");
}

function hideOverlay() {
  els.overlay.classList.add("hidden");
}

function showToast(message, seconds = 1.7) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  toastTimer = seconds;
}

function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(whole / 60);
  const secs = String(whole % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// --- Sticker System ---
const stickerIds = ['moon', 'star', 'firefly', 'pond', 'mushroom', 'tree'];

function unlockSticker(index) {
    const id = stickerIds[index];
    if (id && !ownedStickers.includes(id)) {
        ownedStickers.push(id);
        localStorage.setItem('iris_moon_stickers', JSON.stringify(ownedStickers));
        showToast(`解锁了新贴纸！`, 2);
    }
    updateStickersUI();
}

function updateStickersUI() {
    stickerIds.forEach(id => {
        const el = document.getElementById(`sticker-${id}`);
        if (el) {
            if (ownedStickers.includes(id)) el.classList.remove('locked');
            else el.classList.add('locked');
        }
    });
}

// --- Drawing Functions ---

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGarden();
  drawExit();
  drawDoor();
  drawSeeds();
  drawKey();
  drawHeartPickups();
  drawShadows();
  drawPlayer();
  drawGuidance();
}

function drawGarden() {
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#cfe9f2");
  gradient.addColorStop(0.48, "#d9ead1");
  gradient.addColorStop(1, "#f4e3ca");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < canvas.height / TILE; y += 1) {
    for (let x = 0; x < canvas.width / TILE; x += 1) {
      ctx.fillStyle = (x + y) % 2 ? "rgba(255,255,255,0.12)" : "rgba(70,130,110,0.08)";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
    }
  }

  state.walls.forEach((wall) => {
    ctx.fillStyle = "#5f7f77";
    ctx.fillRect(wall.x * TILE + 4, wall.y * TILE + 4, TILE - 8, TILE - 8);
  });

  state.puddles.forEach((puddle) => {
    ctx.fillStyle = "rgba(67, 145, 190, 0.38)";
    ctx.fillRect(puddle.x * TILE, puddle.y * TILE, TILE, TILE);
  });
}

function drawExit() {
  const x = state.exit.x * TILE;
  const y = state.exit.y * TILE;
  const allSeeds = state.seeds.every((seed) => seed.collected);
  
  // Make gate brighter when unlocked
  ctx.fillStyle = allSeeds ? `rgba(255, 215, 105, ${0.5 + Math.sin(sparkle * 5) * 0.2})` : "rgba(120, 132, 150, 0.28)";
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = allSeeds ? "#fff8c8" : "rgba(255, 255, 255, 0.56)";
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();
}

function drawDoor() {
  if (!state.door || state.hasKey) return;
  const x = state.door.x * TILE;
  const y = state.door.y * TILE;
  ctx.fillStyle = "#7b5dc8";
  ctx.fillRect(x + 5, y + 5, TILE - 10, TILE - 10);
}

function drawSeeds() {
  state.seeds.forEach((seed) => {
    if (seed.collected) return;
    const x = seed.x * TILE;
    const y = seed.y * TILE + Math.sin(sparkle * 4 + seed.x) * 3;
    
    // Draw star
    ctx.fillStyle = "#f2b83d";
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawKey() {
  if (!state.key || state.key.collected) return;
  const x = state.key.x * TILE;
  const y = state.key.y * TILE;
  ctx.fillStyle = "#c865a7";
  ctx.fillRect(x - 5, y - 5, 10, 10);
}

function drawHeartPickups() {
  state.heartPickups.forEach((heart) => {
    if (heart.collected) return;
    const x = heart.x * TILE;
    const y = heart.y * TILE;
    ctx.fillStyle = "#d85f76";
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawShadows() {
  state.shadows.forEach((shadow) => {
    const x = shadow.x * TILE;
    const y = shadow.y * TILE;
    ctx.fillStyle = "rgba(62, 69, 94, 0.72)";
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawPlayer() {
  const x = state.player.x * TILE;
  const y = state.player.y * TILE;
  
  ctx.globalAlpha = state.player.invincible > 0 && Math.floor(sparkle * 12) % 2 === 0 ? 0.55 : 1;
  
  // Customization
  if (currentCosmetic === "star-wings") ctx.fillStyle = "#ffd700";
  else ctx.fillStyle = "#ff758c";
  
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 1;
}

// --- Guidance ---
function drawGuidance() {
    const allSeeds = state.seeds.every(seed => seed.collected);
    
    if (!allSeeds) {
        // Find nearest seed
        let nearest = null;
        let minDist = Infinity;
        state.seeds.forEach(seed => {
            if (!seed.collected) {
                const d = distance(seed, state.player);
                if (d < minDist) { minDist = d; nearest = seed; }
            }
        });
        
        if (nearest) {
            // Draw pulse around nearest seed
            const x = nearest.x * TILE;
            const y = nearest.y * TILE;
            ctx.strokeStyle = `rgba(255, 215, 105, ${0.5 + Math.sin(sparkle * 5) * 0.5})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, 15 + Math.sin(sparkle * 5) * 3, 0, Math.PI * 2);
            ctx.stroke();
        }
    } else {
        // Draw arrow to gate
        const x = state.exit.x * TILE;
        const y = state.exit.y * TILE;
        const px = state.player.x * TILE;
        const py = state.player.y * TILE;
        
        const angle = Math.atan2(y - py, x - px);
        
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.fillStyle = "#ffd700";
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(20, -5);
        ctx.lineTo(20, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        
        // Label
        ctx.fillStyle = "#ffd700";
        ctx.font = "bold 14px sans-serif";
        ctx.fillText("去月光门！", x - 30, y - 30);
    }
}

// --- Event Listeners ---

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === " " && running) {
    paused = !paused;
    els.pause.textContent = paused ? "继续" : "暂停";
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

els.start.addEventListener("click", () => {
  startGame();
});

// Mode Selection
document.querySelectorAll(".btn-diff").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".btn-diff").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        gameMode = e.target.dataset.diff;
    });
});

// Treasure & Assist Panels
els.treasure.addEventListener("click", () => { els.treasurePanel.classList.remove("hidden"); updateStickersUI(); });
els.closeTreasure.addEventListener("click", () => els.treasurePanel.classList.add("hidden"));
els.assist.addEventListener("click", () => els.assistPanel.classList.remove("hidden"));
els.closeAssist.addEventListener("click", () => els.assistPanel.classList.add("hidden"));

// Tabs
document.getElementById("tab-stickers").addEventListener("click", () => {
    document.getElementById("tab-stickers").classList.add("active");
    document.getElementById("tab-cosmetics").classList.remove("active");
    document.getElementById("stickers-content").style.display = "block";
    document.getElementById("cosmetics-content").style.display = "none";
});

document.getElementById("tab-cosmetics").addEventListener("click", () => {
    document.getElementById("tab-cosmetics").classList.add("active");
    document.getElementById("tab-stickers").classList.remove("active");
    document.getElementById("cosmetics-content").style.display = "block";
    document.getElementById("stickers-content").style.display = "none";
});

// Cosmetics Buy/Use
document.querySelectorAll(".cosmetic-item").forEach(item => {
    const id = item.dataset.id;
    const btn = item.querySelector(".btn-buy");
    
    if (unlockedCosmetics.includes(id)) {
        btn.textContent = currentCosmetic === id ? "使用中" : "使用";
    }
    
    btn.addEventListener("click", () => {
        if (!unlockedCosmetics.includes(id)) {
            unlockedCosmetics.push(id);
            localStorage.setItem('iris_moon_cosmetics', JSON.stringify(unlockedCosmetics));
            btn.textContent = "使用";
        } else {
            currentCosmetic = id;
            localStorage.setItem('iris_moon_current_cosmetic', id);
            document.querySelectorAll(".btn-buy").forEach(b => {
                if (unlockedCosmetics.includes(b.parentElement.dataset.id)) b.textContent = "使用";
            });
            btn.textContent = "使用中";
        }
    });
});

// D-Pad
document.querySelectorAll(".pad button").forEach((button) => {
  const map = { up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright" };
  const key = map[button.dataset.dir];
  button.addEventListener("pointerdown", () => keys.add(key));
  button.addEventListener("pointerup", () => keys.delete(key));
  button.addEventListener("pointerleave", () => keys.delete(key));
});

// Bot/Auto Play (Now in Assist Panel)
els.bot.addEventListener("click", () => {
    // Toggle bot
    if (typeof toggleBot === "function") toggleBot();
});

// Init
updateStickersUI();
loadLevel(0);
draw();
