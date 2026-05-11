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
};

const TILE = 48;
const MAX_HEARTS = 3;
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

const levels = [
  {
    name: "Level 1-1",
    mission: "Warm up in the seed path, then find the moon gate.",
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
    name: "Level 1-2",
    mission: "Find the rainbow key before you pass the rainbow door.",
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
    name: "Level 2-1",
    mission: "Blue ponds slow Iris down, so cross them when the shadows are away.",
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
    name: "Level 2-2",
    mission: "Vertical shadows patrol the moon rows. Time your crossings.",
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
    name: "Level 3-1",
    mission: "A heart blooms in the risky lane. Grab it if the garden gets tense.",
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
    name: "Level 3-2",
    mission: "Final garden: collect the far seeds, open the door, and dodge every patrol.",
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
  showToast(`${level.name}: ${level.mission}`, 2.6);
  updateHud();
}

function startGame() {
  hearts = MAX_HEARTS;
  levelIndex = 0;
  runTime = 0;
  levelTime = 0;
  startedFromFirstLevel = true;
  paused = false;
  running = true;
  lastTime = 0;
  keys.clear();
  els.pause.textContent = "Pause";
  loadLevel(levelIndex);
  hideOverlay();
  requestAnimationFrame(loop);
}

function restartLevel() {
  if (!running) {
    if (overlayAction === "retry") retryCurrentLevel();
    else startGame();
    return;
  }
  hearts = MAX_HEARTS;
  startedFromFirstLevel = false;
  loadLevel(levelIndex);
  hideOverlay();
  paused = false;
  keys.clear();
  els.pause.textContent = "Pause";
}

function retryCurrentLevel() {
  hearts = MAX_HEARTS;
  runTime = 0;
  levelTime = 0;
  startedFromFirstLevel = levelIndex === 0;
  paused = false;
  running = true;
  lastTime = 0;
  keys.clear();
  els.pause.textContent = "Pause";
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

  const speed = state.player.speed * currentSpeedMultiplier();
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
    shadow[axis] += shadow.dir * shadow.speed * dt;
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
      const left = state.seeds.filter((item) => !item.collected).length;
      showToast(left === 0 ? "All star seeds collected! Find the glowing gate." : `${left} star seeds left.`);
    }
  });
  if (state.key && !state.key.collected && distance(state.key, state.player) < 0.55) {
    state.key.collected = true;
    state.hasKey = true;
    showToast("Rainbow key found. The door is open!");
  }
  state.heartPickups.forEach((heart) => {
    if (heart.collected || distance(heart, state.player) >= 0.55) return;
    heart.collected = true;
    if (hearts < MAX_HEARTS) {
      hearts += 1;
      showToast("Heart restored.");
    } else {
      showToast("Heart saved. Iris is already full of courage.");
    }
  });
}

function checkShadowHits() {
  if (state.player.invincible > 0) return;
  const hit = state.shadows.some((shadow) => distance(shadow, state.player) < 0.62);
  if (!hit) return;
  hearts -= 1;
  state.player.invincible = 1.4;
  const level = levels[levelIndex];
  level.map.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "I") {
        state.player.x = x + 0.5;
        state.player.y = y + 0.5;
      }
    });
  });
  showToast(hearts > 0 ? "Shadow touch! Back to the start." : "No hearts left.", 1.5);
  if (hearts <= 0) {
    running = false;
    showOverlay("Try again, Iris", "The shadows follow a pattern. Watch their path, take a breath, and step out when the way is clear.", "Restart", "retry");
  }
}

function checkExit() {
  const allSeeds = state.seeds.every((seed) => seed.collected);
  const doorOpen = !state.door || state.hasKey;
  if (distance(state.exit, state.player) < 0.82 && (!allSeeds || !doorOpen) && sparkle - lastGateHint > 1.4) {
    lastGateHint = sparkle;
    showToast(!allSeeds ? "The gate needs every star seed first." : "The rainbow door needs its key.");
  }
  if (allSeeds && doorOpen && distance(state.exit, state.player) < 0.62) {
    showLevelClearToast();
    levelIndex += 1;
    if (levelIndex >= levels.length) {
      running = false;
      els.progress.style.width = "100%";
      showOverlay("Iris lit up the whole garden", completionCopy(), "Play Again", "start");
      return;
    }
    loadLevel(levelIndex);
  }
}

function updateHud() {
  const collected = state.seeds.filter((seed) => seed.collected).length;
  els.level.textContent = levels[levelIndex]?.name || "Complete";
  els.seeds.textContent = `Seeds ${collected} / ${state.totalSeeds}`;
  els.bonus.textContent = bonusStatus();
  els.time.textContent = `Time ${formatTime(runTime)}`;
  els.hearts.textContent = "♡".repeat(hearts);
  els.progress.style.width = `${Math.round(progressPercent())}%`;
}

function bonusStatus() {
  if (!levels[levelIndex]) return "Garden complete";
  if (state.door) return state.hasKey ? "Key found" : "Find key";
  if (state.puddles.length) return "Ponds slow";
  return "Moon path";
}

function progressPercent() {
  if (!levels[levelIndex]) return 100;
  const seedProgress = state.totalSeeds ? state.seeds.filter((seed) => seed.collected).length / state.totalSeeds : 0;
  const keyProgress = state.door ? (state.hasKey ? 0.18 : 0) : 0.18;
  const perLevel = Math.min(0.94, seedProgress * 0.76 + keyProgress);
  return ((levelIndex + perLevel) / levels.length) * 100;
}

function showLevelClearToast() {
  const next = levelIndex + 1;
  if (next < levels.length) showToast(`${levels[levelIndex].name} clear in ${formatTime(levelTime)}.`, 2);
}

function completionCopy() {
  const time = Math.max(1, Math.round(runTime));
  const best = getBestTime();
  let bestLine = `Finished in ${formatTime(time)}.`;
  if (startedFromFirstLevel && (!best || time < best)) {
    setBestTime(time);
    bestLine = `New best time: ${formatTime(time)}.`;
  } else if (best) {
    bestLine += ` Best: ${formatTime(best)}.`;
  }
  return `Every star seed is shining again. ${bestLine}`;
}

function getBestTime() {
  const value = Number(safeStorageGet(BEST_TIME_KEY));
  return Number.isFinite(value) && value > 0 ? value : null;
}

function setBestTime(seconds) {
  safeStorageSet(BEST_TIME_KEY, String(seconds));
}

function safeStorageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    return false;
  }
  return true;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGarden();
  drawShadowRoutes();
  drawExit();
  drawDoor();
  drawSeeds();
  drawKey();
  drawHeartPickups();
  drawShadows();
  drawPlayer();
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
    roundRect(wall.x * TILE + 4, wall.y * TILE + 4, TILE - 8, TILE - 8, 8, "#5f7f77");
    roundRect(wall.x * TILE + 12, wall.y * TILE + 12, TILE - 24, TILE - 24, 6, "#7fa195");
  });

  state.puddles.forEach((puddle) => {
    const x = puddle.x * TILE;
    const y = puddle.y * TILE;
    ctx.fillStyle = "rgba(67, 145, 190, 0.38)";
    ctx.beginPath();
    ctx.ellipse(x + TILE / 2, y + TILE / 2, 18, 13, Math.sin(sparkle + puddle.x) * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(245, 252, 255, 0.68)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 18, y + 21, 7, 0.2, Math.PI * 1.2);
    ctx.arc(x + 32, y + 28, 6, Math.PI * 1.1, Math.PI * 2.1);
    ctx.stroke();
  });
}

function drawExit() {
  const x = state.exit.x * TILE;
  const y = state.exit.y * TILE;
  const allSeeds = state.seeds.every((seed) => seed.collected);
  const doorOpen = !state.door || state.hasKey;
  const unlocked = allSeeds && doorOpen;
  const pulse = 0.5 + Math.sin(sparkle * 5) * 0.08;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = unlocked ? `rgba(255, 215, 105, ${pulse})` : "rgba(120, 132, 150, 0.28)";
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = unlocked ? "#fff8c8" : "rgba(255, 255, 255, 0.56)";
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  if (!unlocked) {
    ctx.strokeStyle = "rgba(70, 78, 96, 0.62)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-9, -9);
    ctx.lineTo(9, 9);
    ctx.moveTo(9, -9);
    ctx.lineTo(-9, 9);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDoor() {
  if (!state.door || state.hasKey) return;
  const x = state.door.x * TILE;
  const y = state.door.y * TILE;
  roundRect(x + 7, y + 5, TILE - 14, TILE - 10, 8, "#7b5dc8");
  ctx.fillStyle = "#f7d879";
  ctx.beginPath();
  ctx.arc(x + TILE / 2, y + TILE / 2, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawSeeds() {
  state.seeds.forEach((seed) => {
    if (seed.collected) return;
    const x = seed.x * TILE;
    const y = seed.y * TILE + Math.sin(sparkle * 4 + seed.x) * 3;
    drawStar(x, y, 12, "#f2b83d");
  });
}

function drawKey() {
  if (!state.key || state.key.collected) return;
  const x = state.key.x * TILE;
  const y = state.key.y * TILE;
  ctx.strokeStyle = "#c865a7";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x - 7, y, 8, 0, Math.PI * 2);
  ctx.moveTo(x + 1, y);
  ctx.lineTo(x + 18, y);
  ctx.moveTo(x + 11, y);
  ctx.lineTo(x + 11, y + 8);
  ctx.stroke();
}

function drawHeartPickups() {
  state.heartPickups.forEach((heart) => {
    if (heart.collected) return;
    const x = heart.x * TILE;
    const y = heart.y * TILE + Math.sin(sparkle * 5 + heart.x) * 2;
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = "#d85f76";
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.bezierCurveTo(-22, -4, -12, -22, 0, -10);
    ctx.bezierCurveTo(12, -22, 22, -4, 0, 10);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.arc(-5, -8, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawShadows() {
  state.shadows.forEach((shadow) => {
    const x = shadow.x * TILE;
    const y = shadow.y * TILE;
    ctx.fillStyle = "rgba(62, 69, 94, 0.72)";
    ctx.beginPath();
    ctx.ellipse(x, y, 20, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d7efff";
    ctx.beginPath();
    ctx.arc(x - 6, y - 3, 3, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 3, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawShadowRoutes() {
  ctx.save();
  ctx.strokeStyle = "rgba(62, 69, 94, 0.22)";
  ctx.lineWidth = 4;
  ctx.setLineDash([8, 10]);
  state.shadows.forEach((shadow) => {
    ctx.beginPath();
    if ((shadow.axis || "x") === "x") {
      ctx.moveTo(shadow.minX * TILE, shadow.y * TILE);
      ctx.lineTo(shadow.maxX * TILE, shadow.y * TILE);
    } else {
      ctx.moveTo(shadow.x * TILE, shadow.minY * TILE);
      ctx.lineTo(shadow.x * TILE, shadow.maxY * TILE);
    }
    ctx.stroke();
  });
  ctx.restore();
}

function drawPlayer() {
  const x = state.player.x * TILE;
  const y = state.player.y * TILE;
  ctx.save();
  ctx.globalAlpha = state.player.invincible > 0 && Math.floor(sparkle * 12) % 2 === 0 ? 0.55 : 1;
  ctx.fillStyle = "#2d6957";
  ctx.beginPath();
  ctx.arc(x, y + 9, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd8bd";
  ctx.beginPath();
  ctx.arc(x, y - 8, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#493326";
  ctx.beginPath();
  ctx.arc(x - 7, y - 13, 7, 0, Math.PI * 2);
  ctx.arc(x + 7, y - 13, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e293b";
  ctx.beginPath();
  ctx.arc(x - 4, y - 9, 2, 0, Math.PI * 2);
  ctx.arc(x + 4, y - 9, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 16, y + 5);
  ctx.lineTo(x - 25, y + 14);
  ctx.moveTo(x + 16, y + 5);
  ctx.lineTo(x + 25, y + 14);
  ctx.stroke();
  ctx.restore();
}

function drawStar(x, y, radius, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(sparkle);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 10; i += 1) {
    const r = i % 2 ? radius * 0.45 : radius;
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function roundRect(x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
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

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", "arrowdown", "a", "s", "d", "w"].includes(key)) {
    event.preventDefault();
    keys.add(key);
  }
  if (key === " " && running) {
    paused = !paused;
    els.pause.textContent = paused ? "Resume" : "Pause";
    showToast(paused ? "Paused" : "Back to the garden");
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

document.querySelectorAll(".pad button").forEach((button) => {
  const map = { up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright" };
  const key = map[button.dataset.dir];
  button.addEventListener("pointerdown", () => keys.add(key));
  button.addEventListener("pointerup", () => keys.delete(key));
  button.addEventListener("pointerleave", () => keys.delete(key));
});

els.start.addEventListener("click", () => {
  if (overlayAction === "retry") retryCurrentLevel();
  else startGame();
});
els.restart.addEventListener("click", restartLevel);
els.pause.addEventListener("click", () => {
  if (!running) return;
  paused = !paused;
  els.pause.textContent = paused ? "Resume" : "Pause";
  showToast(paused ? "Paused" : "Back to the garden");
});

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

loadLevel(0);
draw();
