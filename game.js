const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const els = {
  mission: document.querySelector("#missionText"),
  level: document.querySelector("#levelStat"),
  seeds: document.querySelector("#seedStat"),
  bonus: document.querySelector("#bonusStat"),
  time: document.querySelector("#timeStat"),
  hearts: document.querySelector("#heartStat"),
  mute: document.querySelector("#muteBtn"),
  progress: document.querySelector("#progressFill"),
  overlay: document.querySelector("#overlay"),
  overlayTitle: document.querySelector("#overlayTitle"),
  overlayCopy: document.querySelector("#overlayCopy"),
  start: document.querySelector("#startBtn"),
  restart: document.querySelector("#restartBtn"),
  pause: document.querySelector("#pauseBtn"),
  toast: document.querySelector("#toast"),
  help: document.querySelector("#helpBtn"),
  hud: document.querySelector("#hud"),
  progressBar: document.querySelector("#progressBar"),
  cozyToggle: document.querySelector("#cozyToggle"),
  completeOverlay: document.querySelector("#complete-overlay"),
  completeStats: document.querySelector("#complete-stats"),
  nextLevel: document.querySelector("#nextLevelBtn"),
  mobilePause: document.querySelector("#mobilePauseBtn"),
  damageFlash: document.querySelector("#damageFlash"),
};

const TILE = 48;
const WORLD_WIDTH = 960;
const WORLD_HEIGHT = 576;
let MAX_HEARTS = 3;
const keys = new Set();
let lastTime = 0;
let running = false;
let paused = false;
let levelIndex = 0;
let hearts = 3;
let runTime = 0;
let levelTime = 0;
let sparkle = 0;
let toastTimer = 0;
let lastGateHint = 0;
let overlayAction = "start";

// --- Focused Features ---
let cozyMode = true;
let showHintPath = false;
let livesLostThisLevel = 0;
let particles = [];
let touchVector = null;
let touchStart = null;
let audioUnlocked = false;

function resizeCanvas() {
  const ratio = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.round(WORLD_WIDTH * ratio);
  canvas.height = Math.round(WORLD_HEIGHT * ratio);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

resizeCanvas();

const levels = [
  {
    name: "第 1 关：唤醒沉睡的花朵",
    mission: "收集所有星光种子，然后走进发光的月光门。本关没有敌人哦！",
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
    shadows: [],
  },
  {
    name: "第 2 关：穿过迷雾池塘",
    mission: "蓝色泥潭会减慢 Iris 的速度，看准时机穿过它们。",
    map: [
      "####################",
      "#I...#....*....#...#",
      "#.##.#.######..#.#.#",
      "#..*...#~~~~#....#.#",
      "####.#.#~~~~####.#.#",
      "#....#...#....D..#.#",
      "#.######.#.#####...#",
      "#.*......#.....*...#",
      "#.##.#########.###.#",
      "#........*.......E.#",
      "#..................#",
      "####################",
    ],
    shadows: [],
  },
  {
    name: "第 3 关：避开跳舞的阴影",
    mission: "本关引入了一个缓慢移动的阴影，小心避开它！",
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
      { x: 12.5, y: 1.5, minX: 9.5, maxX: 17.5, speed: 1.0 },
    ],
  },
  {
    name: "第 4 关：寻找隐藏的爱心",
    mission: "本关增加了一个隐藏的爱心，可以恢复生命哦。",
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
      "#..H...............#",
      "####################",
    ],
    shadows: [
      { x: 3.5, y: 3.5, minY: 1.5, maxY: 6.5, speed: 1.2, axis: "y" },
      { x: 12.5, y: 5.5, minY: 3.5, maxY: 9.5, speed: 1.2, axis: "y" },
    ],
  },
  {
    name: "第 5 关：点亮月亮桥",
    mission: "路线更复杂了，但依然要保持耐心。",
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
      { x: 6.5, y: 5.5, minX: 1.5, maxX: 8.5, speed: 1.5 },
      { x: 12.5, y: 9.5, minX: 7.5, maxX: 16.5, speed: 1.5 },
      { x: 18.5, y: 4.5, minY: 1.5, maxY: 8.5, speed: 1.2, axis: "y" },
    ],
  },
  {
    name: "第 6 关：打开最后的月光门",
    mission: "终极挑战！收集所有种子并安全到达终点吧！",
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
      { x: 4.5, y: 3.5, minX: 1.5, maxX: 5.5, speed: 1.5 },
      { x: 9.5, y: 7.5, minX: 6.5, maxX: 11.5, speed: 1.2 },
      { x: 15.5, y: 1.5, minX: 12.5, maxX: 18.5, speed: 1.7 },
      { x: 18.5, y: 6.5, minY: 4.5, maxY: 10.5, speed: 1.3, axis: "y" },
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
  livesLostThisLevel = 0;
  els.mission.textContent = level.mission;
  
  // Update HUD text (even if hidden)
  els.level.textContent = `🌙 ${level.name}`;
  els.seeds.textContent = `⭐ 星种子：0 / ${state.totalSeeds}`;
  
  updateHud();
}

function startGame() {
  unlockAudio();
  cozyMode = els.cozyToggle.checked;
  MAX_HEARTS = cozyMode ? 5 : 3;
  hearts = MAX_HEARTS;
  
  levelIndex = 0;
  runTime = 0;
  levelTime = 0;
  paused = false;
  running = true;
  lastTime = 0;
  keys.clear();
  els.pause.textContent = "暂停";
  
  // Show HUD ONLY after clicking start
  els.hud.classList.remove("hidden");
  els.progressBar.classList.remove("hidden");
  
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
  updateParticles(dt);
  
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
  if (touchVector) {
    dx += touchVector.x;
    dy += touchVector.y;
  }

  if (dx && dy) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }

  let speedMultiplier = currentSpeedMultiplier();
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
    if (cozyMode) speed *= 0.7; // 30% slower in Cozy Mode

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
      spawnParticles(seed.x, seed.y, "#f2b83d", 8);
      animateHud(els.seeds, "hud-pop");
      window.audioManager?.play("collectSeed");
      const collectedCount = state.seeds.filter((item) => item.collected).length;
      els.seeds.textContent = `⭐ 星种子：${collectedCount} / ${state.totalSeeds}`;
      
      const left = state.totalSeeds - collectedCount;
      if (left === 0) {
        showToast("星光种子收集完成！月光门打开啦！", 2);
      }
    }
  });
  
  if (state.key && !state.key.collected && distance(state.key, state.player) < 0.55) {
    state.key.collected = true;
    state.hasKey = true;
    spawnParticles(state.key.x, state.key.y, "#c865a7", 7);
    window.audioManager?.play("doorOpen");
    showToast("彩虹钥匙找到了！");
  }
  
  state.heartPickups.forEach((heart) => {
    if (heart.collected || distance(heart, state.player) >= 0.55) return;
    heart.collected = true;
    spawnParticles(heart.x, heart.y, "#d85f76", 8);
    animateHud(els.hearts, "hud-shake");
    window.audioManager?.play("collectHeart");
    if (hearts < MAX_HEARTS) {
      hearts += 1;
      createFloatingText("+1 ❤️", state.player.x, state.player.y);
    }
  });
}

function checkShadowHits() {
  if (state.player.invincible > 0) return;
  const hit = state.shadows.some((shadow) => distance(shadow, state.player) < 0.62);
  if (!hit) return;
  
  hearts -= 1;
  livesLostThisLevel++;
  state.player.invincible = 1.0;
  triggerDamageFlash();
  animateHud(els.hearts, "hud-shake");
  window.audioManager?.play("hurt");
  
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
      if (cozyMode) {
          hearts = MAX_HEARTS;
          loadLevel(levelIndex);
          showToast("再试一次，Iris 离月亮树更近啦。");
      } else {
          running = false;
          showOverlay("这次飞得很棒！", "再试一次，Iris 离月亮树更近啦。要不要用温馨模式试一下？", "重新开始", "retry");
      }
  }
}

function checkExit() {
  const allSeeds = state.seeds.every((seed) => seed.collected);
  const doorOpen = !state.door || state.hasKey;
  
  if (allSeeds && doorOpen && distance(state.exit, state.player) < 0.62) {
    running = false;
    showLevelCompleteScreen();
  }
}

function showLevelCompleteScreen() {
    let stars = 0;
    const allSeeds = state.seeds.every(s => s.collected);
    if (allSeeds) stars++;
    if (livesLostThisLevel === 0) stars++;
    // 3rd star for finding flower removed as requested to keep it simple
    if (stars === 2) stars++; // Give 3 stars if both conditions met, since flower is removed
    
    renderWinStars(stars);
    window.audioManager?.play("win");
    els.completeStats.textContent = `种子: ${state.seeds.filter(s => s.collected).length}/${state.totalSeeds} | 时间: ${formatTime(levelTime)} | 扣血: ${livesLostThisLevel}`;
    
    els.completeOverlay.classList.remove("hidden");
}

els.nextLevel.addEventListener("click", () => {
    els.completeOverlay.classList.add("hidden");
    levelIndex++;
    if (levelIndex >= levels.length) {
        showOverlay("大功告成！", "月光花园再次闪耀！你完成了所有冒险。", "再玩一次", "start");
        return;
    }
    loadLevel(levelIndex);
    running = true;
    requestAnimationFrame(loop);
});

function updateHud() {
  els.bonus.textContent = state.hasKey ? "钥匙已找到" : "寻找钥匙";
  els.time.textContent = `⏱ 时间 ${formatTime(runTime)}`;
  els.hearts.textContent = "💖 " + "♡".repeat(hearts);
  syncMuteButton();
  els.progress.style.width = `${Math.round(progressPercent())}%`;
}

function progressPercent() {
  if (!levels[levelIndex]) return 100;
  const seedProgress = state.totalSeeds ? state.seeds.filter((seed) => seed.collected).length / state.totalSeeds : 0;
  return ((levelIndex + seedProgress) / levels.length) * 100;
}

function hideOverlay() {
  els.overlay.classList.add("hidden");
}

function showOverlay(title, copy, button, action = "start") {
  els.overlayTitle.textContent = title;
  els.overlayCopy.textContent = copy;
  els.start.textContent = button;
  overlayAction = action;
  els.overlay.classList.remove("hidden");
}

function showToast(message, seconds = 1.7) {
  els.toast.textContent = message;
  els.toast.classList.remove("hidden");
  toastTimer = seconds;
}

function animateHud(element, className) {
  if (!element) return;
  element.classList.remove(className);
  void element.offsetWidth;
  element.classList.add(className);
}

function triggerDamageFlash() {
  if (!els.damageFlash) return;
  els.damageFlash.classList.remove("hidden", "hit");
  void els.damageFlash.offsetWidth;
  els.damageFlash.classList.add("hit");
  window.setTimeout(() => els.damageFlash.classList.add("hidden"), 170);
}

function spawnParticles(x, y, color, count = 7) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.45;
    const speed = 90 + Math.random() * 90;
    particles.push({
      x: x * TILE,
      y: y * TILE,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.22 + Math.random() * 0.18,
      age: 0,
      color,
    });
  }
}

function updateParticles(dt) {
  particles = particles.filter((particle) => {
    particle.age += dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 180 * dt;
    return particle.age < particle.life;
  });
}

function drawParticles() {
  particles.forEach((particle) => {
    const alpha = Math.max(0, 1 - particle.age / particle.life);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 4 + alpha * 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function renderWinStars(stars) {
  const holder = document.querySelector(".stars-display");
  holder.innerHTML = "";
  for (let i = 0; i < 3; i += 1) {
    const star = document.createElement("span");
    star.textContent = i < stars ? "⭐" : "☆";
    holder.appendChild(star);
    window.setTimeout(() => {
      star.classList.add("pop");
      if (i < stars) window.audioManager?.play("win", { volume: 0.35, rate: 1 + i * 0.08 });
    }, i * 300);
  }
}

function syncMuteButton() {
  if (!els.mute || !window.audioManager) return;
  els.mute.textContent = window.audioManager.muted ? "🔇" : "🔊";
  els.mute.setAttribute("aria-label", window.audioManager.muted ? "打开声音" : "关闭声音");
  els.mute.setAttribute("aria-pressed", String(window.audioManager.muted));
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  window.audioManager?.unlock();
  syncMuteButton();
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

function createFloatingText(text, x, y) {
    const el = document.createElement('div');
    el.className = 'floating-text';
    el.textContent = text;
    const container = document.getElementById('floating-text-container');
    if (container) {
        el.style.left = `${x * TILE}px`;
        el.style.top = `${y * TILE}px`;
        container.appendChild(el);
        setTimeout(() => el.remove(), 1000);
    }
}

// --- Drawing Functions ---

function draw() {
  ctx.clearRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  drawGarden();
  drawExit();
  drawDoor();
  drawSeeds();
  drawKey();
  drawHeartPickups();
  drawParticles();
  drawShadows();
  drawPlayer();
  drawHintPath();
}

function drawGarden() {
  const gradient = ctx.createLinearGradient(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  gradient.addColorStop(0, "#cfe9f2");
  gradient.addColorStop(0.48, "#d9ead1");
  gradient.addColorStop(1, "#f4e3ca");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

  for (let y = 0; y < WORLD_HEIGHT / TILE; y += 1) {
    for (let x = 0; x < WORLD_WIDTH / TILE; x += 1) {
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
  ctx.fillStyle = "#ff758c";
  
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.globalAlpha = 1;
}

function drawHintPath() {
    if (!showHintPath) return;
    
    let nearest = null;
    let minDist = Infinity;
    state.seeds.forEach(seed => {
        if (!seed.collected) {
            const d = distance(seed, state.player);
            if (d < minDist) { minDist = d; nearest = seed; }
        }
    });
    
    if (nearest) {
        ctx.strokeStyle = "rgba(255, 215, 105, 0.5)";
        ctx.lineWidth = 4;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(state.player.x * TILE, state.player.y * TILE);
        ctx.lineTo(nearest.x * TILE, nearest.y * TILE);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

// --- Event Listeners ---

window.addEventListener("keydown", (event) => {
  unlockAudio();
  const key = event.key.toLowerCase();
  keys.add(key);
  if (key === " " && running) {
    paused = !paused;
    els.pause.textContent = paused ? "继续" : "暂停";
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

els.start.addEventListener("click", () => {
  unlockAudio();
  if (overlayAction === "retry") {
    levelIndex = 0;
    startGame();
  } else {
    startGame();
  }
});

els.restart.addEventListener("click", () => {
    levelIndex = 0;
    startGame();
});

els.pause.addEventListener("click", () => {
    togglePause();
});

els.mobilePause.addEventListener("click", () => togglePause());

els.mute.addEventListener("click", () => {
  unlockAudio();
  window.audioManager?.toggleMuted();
  syncMuteButton();
});

els.help.addEventListener("click", () => {
    showHintPath = !showHintPath;
    els.help.textContent = showHintPath ? "隐藏指引" : "帮我一下";
});

// D-Pad
document.querySelectorAll(".pad button, .mobile-pad button").forEach((button) => {
  const map = { up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright" };
  const key = map[button.dataset.dir];
  button.addEventListener("pointerdown", (event) => {
    unlockAudio();
    event.currentTarget.setPointerCapture(event.pointerId);
    keys.add(key);
  });
  button.addEventListener("pointerup", () => keys.delete(key));
  button.addEventListener("pointercancel", () => keys.delete(key));
  button.addEventListener("pointerleave", () => keys.delete(key));
});

function togglePause() {
  if (!running) return;
  paused = !paused;
  els.pause.textContent = paused ? "继续" : "暂停";
  els.mobilePause.textContent = paused ? "继续" : "暂停";
}

canvas.addEventListener("pointerdown", (event) => {
  unlockAudio();
  touchStart = { x: event.clientX, y: event.clientY };
  touchVector = null;
  canvas.setPointerCapture(event.pointerId);
});

canvas.addEventListener("pointermove", (event) => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart.x;
  const dy = event.clientY - touchStart.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 18) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    touchVector = { x: Math.sign(dx), y: 0 };
  } else {
    touchVector = { x: 0, y: Math.sign(dy) };
  }
});

function endTouchMove() {
  touchStart = null;
  touchVector = null;
}

canvas.addEventListener("pointerup", endTouchMove);
canvas.addEventListener("pointercancel", endTouchMove);
window.addEventListener("resize", resizeCanvas);

// Init
syncMuteButton();
loadLevel(0);
draw();
