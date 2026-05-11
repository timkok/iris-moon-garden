const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const els = {
  lang: document.querySelector("#langBtn"),
  gameTitle: document.querySelector("#gameTitle"),
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
  levelSelect: document.querySelector("#levelSelectBtn"),
  levelSelectOverlay: document.querySelector("#level-select-overlay"),
  levelSelectTitle: document.querySelector("#levelSelectTitle"),
  levelGrid: document.querySelector("#levelGrid"),
  levelBack: document.querySelector("#levelBackBtn"),
  pauseOverlay: document.querySelector("#pause-overlay"),
  pauseTitle: document.querySelector("#pauseTitle"),
  confirmOverlay: document.querySelector("#confirm-overlay"),
  confirmTitle: document.querySelector("#confirmTitle"),
  confirmCopy: document.querySelector("#confirmCopy"),
  resume: document.querySelector("#resumeBtn"),
  restartLevel: document.querySelector("#restartLevelBtn"),
  mainMenu: document.querySelector("#mainMenuBtn"),
  confirmLeave: document.querySelector("#confirmLeaveBtn"),
  cancelLeave: document.querySelector("#cancelLeaveBtn"),
  restart: document.querySelector("#restartBtn"),
  pause: document.querySelector("#pauseBtn"),
  toast: document.querySelector("#toast"),
  help: document.querySelector("#helpBtn"),
  hud: document.querySelector("#hud"),
  progressBar: document.querySelector("#progressBar"),
  cozyToggle: document.querySelector("#cozyToggle"),
  cozyLabel: document.querySelector("#cozyLabel"),
  cozyNote: document.querySelector("#cozyNote"),
  completeOverlay: document.querySelector("#complete-overlay"),
  completeTitle: document.querySelector("#completeTitle"),
  completeStats: document.querySelector("#complete-stats"),
  nextLevel: document.querySelector("#nextLevelBtn"),
  mobilePause: document.querySelector("#mobilePauseBtn"),
  damageFlash: document.querySelector("#damageFlash"),
  tutorialBubble: document.querySelector("#tutorialBubble"),
  controlHint: document.querySelector("#controlHint"),
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
let tutorialStage = 0;
let tutorialSteps = 0;
let completedStars = 0;
let storyTimer = null;
let currentLang = window.saveManager?.load().language || "en";

const I18N = {
  en: {
    htmlLang: "en",
    langButton: "中文",
    langAria: "Switch to Chinese",
    title: "Iris and the Moonlit Garden",
    shortTitle: "Moonlit Garden",
    story: "Long ago, the moonlit garden was the brightest place in the world.\nThen one day, all the stars fell asleep and the garden grew dark.\nIris set out with her lantern to find every star seed and wake the sleeping moon gate.",
    cozyLabel: "Cozy Mode:",
    cozyNote: "Cozy Mode: infinite lives · no timer",
    start: "Start Adventure",
    chooseLevel: "Choose Level",
    back: "Back",
    paused: "Paused",
    resume: "Resume",
    restartLevel: "Restart Level",
    mainMenu: "Main Menu",
    confirmTitle: "Leave this level?",
    confirmCopy: "Your current run progress will be lost.",
    leave: "Leave",
    keepPlaying: "Keep Playing",
    complete: "Level Complete!",
    nextLevel: "Next Level",
    restart: "Restart",
    pause: "Pause",
    help: "Help me",
    hideHelp: "Hide guide",
    hint: "Use arrow keys or WASD to move. Press Space to pause. Blue ponds slow you down; pink hearts restore lives.",
    findKey: "Find the key",
    keyFound: "Key found",
    seeds: "Seeds",
    time: "Time",
    noTimer: "No timer",
    infinite: "Infinite",
    stats: "Seeds: {seeds}/{total} | Time: {time} | Hits: {hits}",
    levelLabel: "Level {n}",
    mute: "Mute sound",
    unmute: "Unmute sound",
    seedComplete: "All star seeds collected! The moon gate is open!",
    keyToast: "Rainbow key found!",
    cozyProtect: "Cozy Mode keeps Iris safe.",
    tryAgain: "Don't worry, try again!",
    noLives: "No lives left.",
    cozyRetry: "One more try. Iris is closer to the moon tree.",
    retryTitle: "That was a brave try!",
    retryCopy: "Try again. Iris is closer to the moon tree. Want to use Cozy Mode?",
    allDoneTitle: "All done!",
    allDoneCopy: "The moonlit garden is shining again. You finished every adventure.",
    playAgain: "Play Again",
    tutorial: {
      1: "Use the arrow keys to move. Take two steps first.",
      2: "Pick up the star seed to brighten the garden.",
      3: "Grab the key, then walk into the moon gate.",
    },
  },
  zh: {
    htmlLang: "zh-CN",
    langButton: "English",
    langAria: "切换到英文",
    title: "Iris 与月光花园",
    shortTitle: "月光花园",
    story: "很久以前，月光花园是世界上最亮的地方。\n直到有一天，星星都睡着了，花园变得漆黑。\n小女孩 Iris 提着灯笼出发了，她要找回所有星光种子，唤醒沉睡的月亮门。",
    cozyLabel: "温馨模式 (更轻松)：",
    cozyNote: "温馨模式：无限生命 · 不计时",
    start: "开始冒险",
    chooseLevel: "选择关卡",
    back: "返回",
    paused: "暂停中",
    resume: "继续",
    restartLevel: "重新开始本关",
    mainMenu: "返回主菜单",
    confirmTitle: "确定离开本关吗？",
    confirmCopy: "进度会丢失。",
    leave: "确定离开",
    keepPlaying: "继续冒险",
    complete: "闯关成功！",
    nextLevel: "下一关",
    restart: "重新开始",
    pause: "暂停",
    help: "帮我一下",
    hideHelp: "隐藏指引",
    hint: "使用方向键或 WASD 移动。空格暂停。蓝色池塘会减慢速度；粉色爱心可以恢复生命。",
    findKey: "寻找钥匙",
    keyFound: "钥匙已找到",
    seeds: "星种子",
    time: "时间",
    noTimer: "不计时",
    infinite: "无限",
    stats: "种子: {seeds}/{total} | 时间: {time} | 扣血: {hits}",
    levelLabel: "第 {n} 关",
    mute: "关闭声音",
    unmute: "打开声音",
    seedComplete: "星光种子收集完成！月光门打开啦！",
    keyToast: "彩虹钥匙找到了！",
    cozyProtect: "温馨模式会保护 Iris。",
    tryAgain: "别担心，再试一次！",
    noLives: "生命耗尽。",
    cozyRetry: "再试一次，Iris 离月亮树更近啦。",
    retryTitle: "这次飞得很棒！",
    retryCopy: "再试一次，Iris 离月亮树更近啦。要不要用温馨模式试一下？",
    allDoneTitle: "大功告成！",
    allDoneCopy: "月光花园再次闪耀！你完成了所有冒险。",
    playAgain: "再玩一次",
    tutorial: {
      1: "用方向键移动，先走两步试试看",
      2: "捡起星种子，让花园亮一点",
      3: "拿钥匙，再走进月光门",
    },
  },
};

function t(key, values = {}) {
  const parts = key.split(".");
  let value = I18N[currentLang];
  parts.forEach((part) => {
    value = value?.[part];
  });
  if (typeof value !== "string") return key;
  return value.replace(/\{(\w+)\}/g, (_, name) => values[name] ?? "");
}

function levelText(value) {
  if (typeof value === "string") return value;
  return value?.[currentLang] || value?.en || "";
}

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
    name: { en: "Level 1: Tiny Tutorial", zh: "第 1 关：小小教学" },
    mission: { en: "Follow the hints and learn how to explore the moonlit garden.", zh: "跟着提示走，一起学会在月光花园里冒险。" },
    map: [
      "####################",
      "#I..*..............#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..........K.D.E...#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "#..................#",
      "####################",
    ],
    shadows: [],
  },
  {
    name: { en: "Level 2: Misty Ponds", zh: "第 2 关：穿过迷雾池塘" },
    mission: { en: "Blue ponds slow Iris down, so cross them with care.", zh: "蓝色泥潭会减慢 Iris 的速度，看准时机穿过它们。" },
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
    name: { en: "Level 3: Dancing Shadows", zh: "第 3 关：避开跳舞的阴影" },
    mission: { en: "A slow shadow is moving here. Stay careful and slip past it!", zh: "本关引入了一个缓慢移动的阴影，小心避开它！" },
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
    name: { en: "Level 4: Hidden Heart", zh: "第 4 关：寻找隐藏的爱心" },
    mission: { en: "There is a hidden heart in this level. It can restore a life.", zh: "本关增加了一个隐藏的爱心，可以恢复生命哦。" },
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
    name: { en: "Level 5: Light the Moon Bridge", zh: "第 5 关：点亮月亮桥" },
    mission: { en: "The path is trickier now, but patience will light the way.", zh: "路线更复杂了，但依然要保持耐心。" },
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
    name: { en: "Level 6: The Last Moon Gate", zh: "第 6 关：打开最后的月光门" },
    mission: { en: "The final challenge! Collect every seed and reach the gate safely.", zh: "终极挑战！收集所有种子并安全到达终点吧！" },
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
  tutorialStage = index === 0 ? 1 : 0;
  tutorialSteps = 0;
  levelTime = 0;
  livesLostThisLevel = 0;
  els.mission.textContent = levelText(level.mission);
  
  // Update HUD text (even if hidden)
  els.level.textContent = `🌙 ${levelText(level.name)}`;
  els.seeds.textContent = `⭐ ${t("seeds")}: 0 / ${state.totalSeeds}`;
  
  updateHud();
}

function startGame() {
  startLevel(0);
}

function startLevel(index) {
  unlockAudio();
  levelIndex = index;
  const saved = window.saveManager?.save({ cozyMode: els.cozyToggle.checked, muted: window.audioManager?.muted || false });
  cozyMode = levelIndex === 0 ? true : (saved?.cozyMode ?? els.cozyToggle.checked);
  els.cozyToggle.checked = cozyMode;
  MAX_HEARTS = cozyMode ? 5 : 3;
  hearts = MAX_HEARTS;
  
  runTime = 0;
  levelTime = 0;
  paused = false;
  running = true;
  lastTime = 0;
  keys.clear();
  els.pause.textContent = t("pause");
  els.mobilePause.textContent = t("pause");
  
  // Show HUD ONLY after clicking start
  els.hud.classList.remove("hidden");
  els.progressBar.classList.remove("hidden");
  
  loadLevel(levelIndex);
  hideOverlay();
  hideLevelSelect();
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
  if (!isTutorialLevel() && !cozyMode) {
    runTime += dt;
    levelTime += dt;
  }
  toastTimer = Math.max(0, toastTimer - dt);
  if (toastTimer === 0) els.toast.classList.add("hidden");
  state.player.invincible = Math.max(0, state.player.invincible - dt);
  updateParticles(dt);
  
  movePlayer(dt);
  updateTutorial();
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
  if (isTutorialLevel() && (dx || dy)) tutorialSteps += dt * 4;
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
    if (isTutorialLevel() && tutorialStage < 2) return;
    if (!seed.collected && distance(seed, state.player) < 0.55) {
      seed.collected = true;
      spawnParticles(seed.x, seed.y, "#f2b83d", 8);
      animateHud(els.seeds, "hud-pop");
      window.audioManager?.play("collectSeed");
      const collectedCount = state.seeds.filter((item) => item.collected).length;
      els.seeds.textContent = `⭐ ${t("seeds")}: ${collectedCount} / ${state.totalSeeds}`;
      
      const left = state.totalSeeds - collectedCount;
      if (left === 0) {
        if (isTutorialLevel()) tutorialStage = Math.max(tutorialStage, 3);
        showToast(t("seedComplete"), 2);
      }
    }
  });
  
  if (state.key && !state.key.collected && (!isTutorialLevel() || tutorialStage >= 3) && distance(state.key, state.player) < 0.55) {
    state.key.collected = true;
  state.hasKey = true;
    spawnParticles(state.key.x, state.key.y, "#c865a7", 7);
    window.audioManager?.play("doorOpen");
  showToast(t("keyToast"));
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
  if (isTutorialLevel()) return;
  if (state.player.invincible > 0) return;
  const hit = state.shadows.some((shadow) => distance(shadow, state.player) < 0.62);
  if (!hit) return;
  
  if (cozyMode) {
    state.player.invincible = 1.0;
    triggerDamageFlash();
    animateHud(els.hearts, "hud-shake");
    window.audioManager?.play("hurt");
    showToast(t("cozyProtect"), 1.2);
    return;
  }

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
  
  showToast(hearts > 0 ? t("tryAgain") : t("noLives"), 1.5);
  
  if (hearts <= 0) {
      if (cozyMode) {
          hearts = MAX_HEARTS;
          loadLevel(levelIndex);
          showToast(t("cozyRetry"));
      } else {
          running = false;
          showOverlay(t("retryTitle"), t("retryCopy"), t("restart"), "retry");
      }
  }
}

function checkExit() {
  if (isTutorialLevel() && tutorialStage < 3) return;
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
    completedStars = stars;
    window.saveManager?.updateLevel(levelIndex + 1, levelTime, stars);
    
    renderWinStars(stars);
    window.audioManager?.play("win");
    els.completeStats.textContent = t("stats", {
      seeds: state.seeds.filter(s => s.collected).length,
      total: state.totalSeeds,
      time: formatTime(levelTime),
      hits: livesLostThisLevel,
    });
    
    els.completeOverlay.classList.remove("hidden");
    renderLevelGrid();
}

els.nextLevel.addEventListener("click", () => {
    els.completeOverlay.classList.add("hidden");
    levelIndex++;
    if (levelIndex >= levels.length) {
        showOverlay(t("allDoneTitle"), t("allDoneCopy"), t("playAgain"), "start");
        return;
    }
    loadLevel(levelIndex);
    running = true;
    requestAnimationFrame(loop);
});

function updateHud() {
  els.bonus.textContent = state.hasKey ? t("keyFound") : t("findKey");
  els.time.textContent = (isTutorialLevel() || cozyMode) ? `⏱ ${t("noTimer")}` : `⏱ ${t("time")} ${formatTime(runTime)}`;
  els.hearts.textContent = cozyMode ? `💖 ${t("infinite")}` : "💖 " + "♡".repeat(hearts);
  syncMuteButton();
  els.progress.style.width = `${Math.round(progressPercent())}%`;
}

function isTutorialLevel() {
  return levelIndex === 0;
}

function updateTutorial() {
  if (!isTutorialLevel()) {
    els.tutorialBubble.classList.add("hidden");
    return;
  }
  if (tutorialStage === 1 && tutorialSteps >= 2) tutorialStage = 2;
  const messages = {
    1: t("tutorial.1"),
    2: t("tutorial.2"),
    3: t("tutorial.3"),
  };
  els.tutorialBubble.textContent = messages[tutorialStage] || "";
  els.tutorialBubble.classList.toggle("hidden", !messages[tutorialStage]);
}

function progressPercent() {
  if (!levels[levelIndex]) return 100;
  const seedProgress = state.totalSeeds ? state.seeds.filter((seed) => seed.collected).length / state.totalSeeds : 0;
  return ((levelIndex + seedProgress) / levels.length) * 100;
}

function hideOverlay() {
  els.overlay.classList.add("hidden");
}

function hideLevelSelect() {
  els.levelSelectOverlay.classList.add("hidden");
}

function showOverlay(title, copy, button, action = "start") {
  els.overlayTitle.textContent = title;
  els.overlayCopy.textContent = copy;
  els.start.textContent = button;
  overlayAction = action;
  els.overlay.classList.remove("hidden");
  if (action === "start") startStoryTypewriter(copy || t("story"));
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
  els.mute.setAttribute("aria-label", window.audioManager.muted ? t("unmute") : t("mute"));
  els.mute.setAttribute("aria-pressed", String(window.audioManager.muted));
}

function applyLanguage({ restartStory = false } = {}) {
  if (!I18N[currentLang]) currentLang = "en";
  document.documentElement.lang = t("htmlLang");
  document.title = t("title");
  els.lang.textContent = t("langButton");
  els.lang.setAttribute("aria-label", t("langAria"));
  els.gameTitle.textContent = t("title");
  els.overlayTitle.textContent = t("shortTitle");
  els.cozyLabel.textContent = t("cozyLabel");
  els.cozyNote.textContent = t("cozyNote");
  els.start.textContent = overlayAction === "retry" ? t("restart") : t("start");
  els.levelSelect.textContent = t("chooseLevel");
  els.levelSelectTitle.textContent = t("chooseLevel");
  els.levelBack.textContent = t("back");
  els.pauseTitle.textContent = t("paused");
  els.resume.textContent = t("resume");
  els.restartLevel.textContent = t("restartLevel");
  els.mainMenu.textContent = t("mainMenu");
  els.confirmTitle.textContent = t("confirmTitle");
  els.confirmCopy.textContent = t("confirmCopy");
  els.confirmLeave.textContent = t("leave");
  els.cancelLeave.textContent = t("keepPlaying");
  els.completeTitle.textContent = t("complete");
  els.nextLevel.textContent = t("nextLevel");
  els.restart.textContent = t("restart");
  els.pause.textContent = paused ? t("resume") : t("pause");
  els.mobilePause.textContent = paused ? t("resume") : t("pause");
  els.mobilePause.setAttribute("aria-label", t("pause"));
  els.help.textContent = showHintPath ? t("hideHelp") : t("help");
  els.controlHint.textContent = t("hint");
  renderLevelGrid();
  if (levels[levelIndex]) {
    els.mission.textContent = levelText(levels[levelIndex].mission);
    els.level.textContent = `🌙 ${levelText(levels[levelIndex].name)}`;
    const collectedCount = state.seeds.filter((item) => item.collected).length;
    els.seeds.textContent = `⭐ ${t("seeds")}: ${collectedCount} / ${state.totalSeeds}`;
  }
  updateHud();
  if (restartStory && !els.overlay.classList.contains("hidden")) startStoryTypewriter();
  syncMuteButton();
}

function setLanguage(language) {
  currentLang = language;
  window.saveManager?.save({ language });
  applyLanguage({ restartStory: true });
}

function renderLevelGrid() {
  if (!els.levelGrid) return;
  const save = window.saveManager?.load() || { unlockedLevel: 1, bestStars: {} };
  els.levelGrid.innerHTML = "";
  levels.forEach((level, index) => {
    const levelNumber = index + 1;
    const unlocked = levelNumber <= save.unlockedLevel;
    const stars = save.bestStars[String(levelNumber)] || 0;
    const button = document.createElement("button");
    button.type = "button";
    button.className = `level-card${unlocked ? "" : " locked"}`;
    button.disabled = !unlocked;
    const starText = unlocked ? "⭐".repeat(stars) + "☆".repeat(3 - stars) : "🔒";
    button.innerHTML = `<strong>${t("levelLabel", { n: levelNumber })}</strong><span>${starText}</span>`;
    button.addEventListener("click", () => {
      if (unlocked) startLevel(index);
    });
    els.levelGrid.appendChild(button);
  });
}

function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  window.audioManager?.unlock();
  syncMuteButton();
}

function startStoryTypewriter(text = t("story")) {
  window.clearInterval(storyTimer);
  let index = 0;
  const render = () => {
    els.overlayCopy.innerHTML = text.slice(0, index).replace(/\n/g, "<br>");
  };
  render();
  storyTimer = window.setInterval(() => {
    index += 1;
    render();
    if (index >= text.length) window.clearInterval(storyTimer);
  }, 50);
}

function skipStoryTypewriter() {
  window.clearInterval(storyTimer);
  els.overlayCopy.innerHTML = t("story").replace(/\n/g, "<br>");
}

function showPauseMenu() {
  if (!running) return;
  paused = true;
  els.pause.textContent = t("resume");
  els.mobilePause.textContent = t("resume");
  els.pauseOverlay.classList.remove("hidden");
}

function hidePauseMenu() {
  els.pauseOverlay.classList.add("hidden");
  if (!running) return;
  paused = false;
  els.pause.textContent = t("pause");
  els.mobilePause.textContent = t("pause");
}

function askReturnToMenu() {
  els.confirmOverlay.classList.remove("hidden");
}

function returnToMainMenu() {
  running = false;
  paused = false;
  keys.clear();
  els.pauseOverlay.classList.add("hidden");
  els.confirmOverlay.classList.add("hidden");
  els.completeOverlay.classList.add("hidden");
  els.hud.classList.add("hidden");
  els.progressBar.classList.add("hidden");
  showOverlay(t("shortTitle"), t("story"), t("start"), "start");
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
  if (isTutorialLevel() && tutorialStage < 3) return;
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
  if (isTutorialLevel() && tutorialStage < 3) return;
  if (!state.door || state.hasKey) return;
  const x = state.door.x * TILE;
  const y = state.door.y * TILE;
  ctx.fillStyle = "#7b5dc8";
  ctx.fillRect(x + 5, y + 5, TILE - 10, TILE - 10);
}

function drawSeeds() {
  state.seeds.forEach((seed) => {
    if (isTutorialLevel() && tutorialStage < 2) return;
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
  if (isTutorialLevel() && tutorialStage < 3) return;
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
    event.preventDefault();
    if (paused) hidePauseMenu();
    else showPauseMenu();
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

els.levelSelect.addEventListener("click", () => {
  renderLevelGrid();
  els.levelSelectOverlay.classList.remove("hidden");
});

els.levelBack.addEventListener("click", hideLevelSelect);

els.restart.addEventListener("click", () => {
    startLevel(levelIndex);
});

els.pause.addEventListener("click", () => {
    togglePause();
});

els.mobilePause.addEventListener("click", () => togglePause());

els.resume.addEventListener("click", hidePauseMenu);

els.restartLevel.addEventListener("click", () => {
  els.pauseOverlay.classList.add("hidden");
  startLevel(levelIndex);
});

els.mainMenu.addEventListener("click", askReturnToMenu);
els.cancelLeave.addEventListener("click", () => els.confirmOverlay.classList.add("hidden"));
els.confirmLeave.addEventListener("click", returnToMainMenu);
els.overlayCopy.addEventListener("click", skipStoryTypewriter);

els.mute.addEventListener("click", () => {
  unlockAudio();
  window.audioManager?.toggleMuted();
  syncMuteButton();
});

els.lang.addEventListener("click", () => {
  setLanguage(currentLang === "en" ? "zh" : "en");
});

els.help.addEventListener("click", () => {
    showHintPath = !showHintPath;
    els.help.textContent = showHintPath ? t("hideHelp") : t("help");
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
  if (paused) hidePauseMenu();
  else showPauseMenu();
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
const savedGame = window.saveManager?.load();
if (savedGame) {
  currentLang = savedGame.language || "en";
  els.cozyToggle.checked = savedGame.cozyMode;
}
loadLevel(0);
applyLanguage();
startStoryTypewriter();
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./service-worker.js").catch((error) => {
    console.warn("Service worker registration failed.", error);
  });
}
draw();
