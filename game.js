const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");

const els = {
  surface: document.querySelector(".game-surface"),
  mission: document.querySelector("#missionText"),
  level: document.querySelector("#levelStat"),
  seeds: document.querySelector("#seedStat"),
  time: document.querySelector("#timeStat"),
  hearts: document.querySelector("#heartStat"),
  progress: document.querySelector("#progressFill"),
  overlay: document.querySelector("#overlay"),
  overlayTitle: document.querySelector("#overlayTitle"),
  overlayCopy: document.querySelector("#overlayCopy"),
  start: document.querySelector("#startBtn"),
  restart: document.querySelector("#restartBtn"),
  pause: document.querySelector("#pauseBtn"),
  magicHelp: document.querySelector("#magicHelpBtn"),
  magicPanel: document.querySelector("#magic-help-panel"),
  magicTitle: document.querySelector("#magicHelpTitle"),
  magicHeart1: document.querySelector("#magicHeart1Btn"),
  magicHeart3: document.querySelector("#magicHeart3Btn"),
  magicSlow: document.querySelector("#magicSlowBtn"),
  magicPath: document.querySelector("#magicPathBtn"),
  magicSkip: document.querySelector("#magicSkipBtn"),
  magicCozy: document.querySelector("#magicCozyBtn"),
  toast: document.querySelector("#toast"),
  help: document.querySelector("#helpBtn"),
  hud: document.querySelector("#hud"),
  progressBar: document.querySelector("#progressBar"),
  cozyToggle: document.querySelector("#cozyToggle"),
  completeOverlay: document.querySelector("#complete-overlay"),
  completeTitle: document.querySelector("#complete-title"),
  completeStats: document.querySelector("#complete-stats"),
  nextLevel: document.querySelector("#nextLevelBtn"),
  langBtn: document.querySelector("#langBtn"),
  continue: document.querySelector("#continueBtn"),
  muteBtn: document.querySelector("#muteBtn"),
  titleText: document.querySelector("#title-text"),
  cozyLabel: document.querySelector("#cozy-label"),
  hintText: document.querySelector("#hint-text"),
  hudTitle: document.querySelector("#hud-title"),
  storyTitle: document.querySelector("#story-title"),
  coopBtn: document.querySelector("#coopModeBtn"),
  coopHelp: document.querySelector("#coopHelp"),
  selectLevelLabel: document.querySelector("#selectLevelLabel"),
  endOverlay: document.querySelector("#end-overlay"),
  endTitle: document.querySelector("#end-title"),
  endStats: document.querySelector("#end-stats"),
  endFlowers: document.querySelector("#end-flowers"),
  endStickers: document.querySelector("#end-stickers"),
  endBadge: document.querySelector("#end-badge"),
  playAgain: document.querySelector("#playAgainBtn"),
  levelMap: document.querySelector("#levelMapBtn"),
  showStickers: document.querySelector("#showStickersBtn"),
  endLang: document.querySelector("#endLangBtn"),
  stickerContainer: document.querySelector("#sticker-container"),
  levelSelector: document.querySelector("#level-selector"),
  starsDisplay: document.querySelector(".stars-display"),
  modeCozy: document.querySelector("#modeCozyBtn"),
  modeAdventure: document.querySelector("#modeAdventureBtn"),
  modeChallenge: document.querySelector("#modeChallengeBtn"),
};

const TILE = 48;
let MAX_HEARTS = 3;
const HEART_CAP = 9;
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
let hintTimer = 0;
let livesLostThisLevel = 0;
let currentLang = "en"; // Default to English as requested
let coopMode = false;
let difficultyMode = "cozy";
let levelAssist = {};
let recentHitTimes = [];
const restartCounts = {};

const i18n = {
    zh: {
        title: "Iris 与月光花园",
        intro: "帮助 Iris 唤醒沉睡的星星，打开月光门。",
        storyTitle: "沉睡的星星",
        cozyLabel: "温馨模式：更多生命 · 阴影更慢 · 没有计时压力",
        startBtn: "开始新冒险",
        continueBtn: "继续游戏",
        continueFrom: "从第 {n} 关继续",
        restartBtn: "重新开始",
        pauseBtn: "暂停",
        pauseBtnActive: "继续",
        helpBtn: "提示 / 帮我一下",
        helpBtnActive: "隐藏指引",
        magicHelpBtn: "✨ 魔法帮助",
        magicHelpTitle: "✨ 魔法帮助",
        magicHeart1: "+1 颗爱心",
        magicHeart3: "+3 颗爱心",
        magicSlow: "影子变慢",
        magicPath: "显示路线",
        magicSkip: "跳过本关",
        magicCozy: "开启温馨辅助",
        magicHeartToast: "月光给你多一颗爱心！",
        magicThreeToast: "月光给你三颗爱心！",
        magicSlowToast: "影子慢下来啦。",
        magicCozyToast: "温馨辅助已经打开。",
        magicSkipToast: "月光帮你轻轻跳到下一关。",
        assistComplete: "你用了月光魔法完成本关。",
        tryMoreStars: "想要更多星星的话，可以以后再试一次。",
        greatJob: "太棒了！",
        gardenHelp: "月光花园想帮帮你！",
        extraHeartOffer: "要不要多一颗爱心？",
        hintSolo: "单人：方向键或 WASD 移动 · 空格暂停",
        hintCoop: "双人：Iris 小女孩 = WASD · Luna 小猫 = 方向键 · 空格 = 暂停",
        completeTitle: "闯关成功！",
        nextLevelBtn: "下一关",
        playAgainBtn: "再玩一次",
        stickerBookBtn: "贴纸册",
        seeds: "星种子",
        time: "时间",
        hearts: "生命",
        hits: "扣血",
        collectSeedsLabel: "收集星种子",
        toastSeedsDone: "星光种子收集完成！月光门打开啦！",
        toastKeyFound: "彩虹钥匙找到了！",
        toastHeartRefill: "生命恢复。",
        toastShadowHit: "别担心，再试一次！",
        toastGameOver: "生命耗尽。",
        toastGateNeedSeeds: "大门需要集齐所有星光种子才能打开。",
        toastGateNeedKey: "彩虹门需要钥匙。",
        toastFlower: "你找到一朵月光花！",
        missionText: "寻找钥匙",
        keyFoundText: "钥匙已找到",
        readyTitle: "准备好了吗，Iris？",
        retryTitle: "这次飞得很棒！",
        retryCopy: "再试一次，Iris 离月亮树更近啦。要不要用温馨模式试一下？",
        endTitle: "月光花园再次闪耀！",
        endCopy: "Iris 和 Luna 小猫完成了所有冒险。",
        endBadge: "最喜欢的章节：{name}",
        totalStars: "总星星",
        levelMapBtn: "关卡地图",
        changeLanguageBtn: "切换语言",
        coopBtnOff: "☐ 双人合作：Iris + Luna",
        coopBtnOn: "☑ 双人合作：Iris + Luna",
        coopHelp: "Iris 小女孩和 Luna 小猫一起收集星种子，打开月光门。",
        flowersFound: "找到的月光花：{n} / {total}",
        stickersUnlocked: "解锁的贴纸：{n} / {total}",
        flowerFound: "月光花：已找到",
        flowerMissing: "月光花：还没找到",
        chapter1: "第 1 章：月光花园基础",
        chapter2: "第 2 章：星星迷宫",
        chapter3: "第 3 章：梦月之境",
        modeCozy: "温馨模式",
        modeAdventure: "冒险模式",
        modeChallenge: "挑战模式",
        modeChallengeLocked: "挑战模式 🔒",
        challengeLockedToast: "完成第 1 章后解锁挑战模式。",
        switchToast: "月光开关亮起来了！",
        hintReady: "月光指引亮起来了。",
        irisLabel: "Iris",
        lunaLabel: "Luna",
        selectLevel: "选择关卡",
        muteOn: "开启声音",
        muteOff: "静音",
        keyLine: "先找到月亮钥匙，再收集所有星种子打开月光门。"
    },
    en: {
        title: "Iris and the Moonlit Garden",
        intro: "Help Iris wake the sleeping stars and open the moon gate.",
        storyTitle: "The Sleeping Stars",
        cozyLabel: "Cozy Mode: more lives, slower shadows, and no timer pressure.",
        startBtn: "Start Adventure",
        continueBtn: "Continue",
        continueFrom: "Continue from Level {n}",
        restartBtn: "Restart",
        pauseBtn: "Pause",
        pauseBtnActive: "Resume",
        helpBtn: "Hint / Help me",
        helpBtnActive: "Hide Hint",
        magicHelpBtn: "✨ Magic Help",
        magicHelpTitle: "✨ Magic Help",
        magicHeart1: "+1 Heart",
        magicHeart3: "+3 Hearts",
        magicSlow: "Slow Shadows",
        magicPath: "Show Path",
        magicSkip: "Skip Level",
        magicCozy: "Turn on Cozy Assist",
        magicHeartToast: "Moon magic added one heart!",
        magicThreeToast: "Moon magic added three hearts!",
        magicSlowToast: "The shadows are slower now.",
        magicCozyToast: "Cozy Assist is on.",
        magicSkipToast: "Moon magic gently skipped this level.",
        assistComplete: "You used moon magic to finish the level.",
        tryMoreStars: "Try again for more stars if you want.",
        greatJob: "Great job!",
        gardenHelp: "The Moon Garden wants to help you!",
        extraHeartOffer: "Would you like an extra heart?",
        hintSolo: "Solo: Arrow Keys or WASD to move · Space to pause",
        hintCoop: "Two-player: Iris the girl = WASD · Luna the cat = Arrow Keys · Space = Pause",
        completeTitle: "Level Complete!",
        nextLevelBtn: "Next Level",
        playAgainBtn: "Play Again",
        stickerBookBtn: "Sticker Book",
        seeds: "Seeds",
        time: "Time",
        hearts: "Hearts",
        hits: "Hits",
        collectSeedsLabel: "Collect star seeds",
        toastSeedsDone: "All star seeds collected! Moon gate opened!",
        toastKeyFound: "Rainbow key found!",
        toastHeartRefill: "Hearts refilled.",
        toastShadowHit: "Don't worry, try again!",
        toastGameOver: "No hearts left.",
        toastGateNeedSeeds: "Collect all star seeds to open the gate.",
        toastGateNeedKey: "The gate requires a key.",
        toastFlower: "You found a hidden moon flower!",
        missionText: "Find Key",
        keyFoundText: "Key Found",
        readyTitle: "Ready, Iris?",
        retryTitle: "Great flight!",
        retryCopy: "Try again, Iris is getting closer to the Moon Tree. Want to try Cozy Mode?",
        endTitle: "The Moon Garden is glowing again!",
        endCopy: "Iris and Luna the cat completed every adventure.",
        endBadge: "Favorite chapter badge: {name}",
        totalStars: "Total Stars",
        levelMapBtn: "Level Map",
        changeLanguageBtn: "Change Language",
        coopBtnOff: "☐ Two-player Co-op: Iris + Luna",
        coopBtnOn: "☑ Two-player Co-op: Iris + Luna",
        coopHelp: "Iris the girl and Luna the cat collect star seeds and open the moon gate together.",
        flowersFound: "Moon Flowers Found: {n} / {total}",
        stickersUnlocked: "Stickers Unlocked: {n} / {total}",
        flowerFound: "Moon Flower: Found",
        flowerMissing: "Moon Flower: Not found yet",
        chapter1: "Chapter 1: Moon Garden Basics",
        chapter2: "Chapter 2: Star Maze",
        chapter3: "Chapter 3: Dream Moon",
        modeCozy: "Cozy Mode",
        modeAdventure: "Adventure",
        modeChallenge: "Challenge",
        modeChallengeLocked: "Challenge 🔒",
        challengeLockedToast: "Complete Chapter 1 to unlock Challenge Mode.",
        switchToast: "The moon switch is glowing!",
        hintReady: "A moonlight hint is glowing.",
        irisLabel: "Iris",
        lunaLabel: "Luna",
        selectLevel: "Select Level",
        muteOn: "Sound on",
        muteOff: "Sound off",
        keyLine: "Find the moon key first, then collect every star seed to open the gate."
    }
};

let levels = [
  {
    names: { zh: "第 1 关：唤醒沉睡的花朵", en: "Level 1: Wake the sleeping flowers" },
    missions: { zh: "收集所有星光种子，然后走进发光的月光门。本关没有敌人哦！", en: "Collect all star seeds and enter the glowing gate. No enemies here!" },
    map: [
      "####################",
      "#I...*.......#....F#",
      "#.####.#####.#.###.#",
      "#......#...*...#...#",
      "#.##.#.#.#####.#.#.#",
      "#.*..#...#.....#.*.#",
      "#.#######.#.#####..#",
      "#.........#.....*..#",
      "#.######..#####.##.#",
      "#......*.........E.#",
      "#....#....#....#...#", // Cut the highway
      "####################",
    ],
    shadows: [],
    sticker: "Moon Cat"
  },
  {
    names: { zh: "第 2 关：穿过迷雾池塘", en: "Level 2: Cross the misty pond" },
    missions: { zh: "蓝色泥潭会减慢 Iris 的速度，看准时机穿过它们。", en: "Blue ponds slow Iris down. Cross them carefully." },
    map: [
      "####################",
      "#I...#....*....#...#",
      "#.##.#.######..#.#.#",
      "#..*...#~~~~#....#.#",
      "####.#.#~~~~####.#.#",
      "#F...#...#....D..#.#",
      "#.######.#.#####...#",
      "#.*......#.....*...#",
      "#.##.#########.###.#",
      "#........*.......E.#",
      "#....#....#....#...#", // Cut the highway
      "####################",
    ],
    shadows: [],
    sticker: "Star Bunny"
  },
  {
    names: { zh: "第 3 关：避开跳舞的阴影", en: "Level 3: Dodge the dancing shadows" },
    missions: { zh: "本关引入了一个缓慢移动的阴影，小心避开它！", en: "Avoid the slow moving shadow!" },
    map: [
      "####################",
      "#I..*....~~~~.....F#",
      "#.######.####.####.#",
      "#....#...#..*....#.#",
      "####.#.####.###..#.#",
      "#*...#......#....#.#",
      "#.#####.##~~#.####.#",
      "#...~....#..#...*..#",
      "#.#####..#..###.##.#",
      "#.....*..#......E..#",
      "#..~~~~..#.......~.#", // Cut the highway
      "####################",
    ],
    shadows: [
      { x: 12.5, y: 1.5, minX: 9.5, maxX: 17.5, speed: 1.0 },
    ],
    sticker: "Sleepy Owl"
  },
  {
    names: { zh: "第 4 关：寻找隐藏的爱心", en: "Level 4: Find the hidden heart" },
    missions: { zh: "本关增加了一个隐藏的爱心，可以恢复生命哦。", en: "A hidden heart restores your life." },
    map: [
      "####################",
      "#I....#...*.....#..#",
      "#.###.#.#####.#.#*.#",
      "#...#...#...#.#...F#",
      "###.#.###.#.#.####.#",
      "#*..#.....#.#....#.#",
      "#.#.#####.#.####.#.#",
      "#.#.....K.#....D...#",
      "#.#####.#####.####.#",
      "#....*.........*E..#",
      "#..H..#....#....#..#", // Cut the highway
      "####################",
    ],
    shadows: [
      { x: 3.5, y: 3.5, minY: 1.5, maxY: 6.5, speed: 1.2, axis: "y" },
      { x: 12.5, y: 5.5, minY: 3.5, maxY: 9.5, speed: 1.2, axis: "y" },
    ],
    sticker: "Crystal Fox"
  },
  {
    names: { zh: "第 5 关：点亮月亮桥", en: "Level 5: Light the moon bridge" },
    missions: { zh: "路线更复杂了，但依然要保持耐心。", en: "Complex paths but still fair." },
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
      "#F.~~~~~......*E...#",
      "#....#....#....#...#", // Cut the highway
      "####################",
    ],
    shadows: [
      { x: 6.5, y: 5.5, minX: 1.5, maxX: 8.5, speed: 1.5 },
      { x: 12.5, y: 9.5, minX: 7.5, maxX: 16.5, speed: 1.5 },
      { x: 18.5, y: 4.5, minY: 1.5, maxY: 8.5, speed: 1.2, axis: "y" },
    ],
    sticker: "Glow Frog"
  },
  {
    names: { zh: "第 6 关：打开最后的月光门", en: "Level 6: Open the final moon gate" },
    missions: { zh: "终极挑战！收集所有种子并安全到达终点吧！", en: "Final challenge! Collect all seeds and reach the exit." },
    map: [
      "####################",
      "#I..*....#.....*...#",
      "#.######.#.#######.#",
      "#....#...#.....#..F#",
      "####.#.#######.#.#.#",
      "#*...#...K.....D.#.#",
      "#.#####.#####.###..#",
      "#.....*.....#...*..#",
      "#.#########.#.####.#",
      "#..H....~~~~#...*E.#",
      "#....#....#....#...#", // Cut the highway
      "####################",
    ],
    shadows: [
      { x: 4.5, y: 3.5, minX: 1.5, maxX: 5.5, speed: 1.5 },
      { x: 9.5, y: 7.5, minX: 6.5, maxX: 11.5, speed: 1.2 },
      { x: 15.5, y: 1.5, minX: 12.5, maxX: 18.5, speed: 1.7 },
      { x: 18.5, y: 6.5, minY: 4.5, maxY: 10.5, speed: 1.3, axis: "y" },
    ],
    sticker: "Tiny Dragon"
  },
  {
    names: { zh: "第 7 关：阴影迷宫", en: "Level 7: Labyrinth of Shadows" },
    missions: { zh: "这里有很多阴影，小心穿过迷宫！", en: "Many shadows here! Navigate the labyrinth carefully." },
    map: [
      "####################",
      "#I...#...*........F#",
      "#.##.#.##########.##",
      "#..#...#...*...#...#",
      "##.#####.#####.#.###",
      "#......#.#.....#...#",
      "#.####.#.#.#######.#",
      "#.*..#.#.#.....*...#",
      "#.##.###.#########.#",
      "#..H......*......E.#",
      "#....#....#....#...#", // Cut the highway
      "####################",
    ],
    shadows: [
      { x: 5.5, y: 3.5, minY: 1.5, maxY: 7.5, speed: 1.5, axis: "y" },
      { x: 13.5, y: 5.5, minX: 9.5, maxX: 17.5, speed: 1.5 },
    ],
    sticker: "Mystic Owl"
  },
  {
    names: { zh: "第 8 关：迷雾迷宫", en: "Level 8: The Misty Maze" },
    missions: { zh: "到处都是池塘，寻找钥匙吧！", en: "Puddles everywhere! Find the key." },
    map: [
      "####################",
      "#I...~~~~...*.....F#",
      "#.######.##########",
      "#....#...#~~~~~#...#",
      "####.#.###~~~~~#.###",
      "#*...#.....#.....#.#",
      "#.#####.##.#######.#",
      "#...H....#...K.D...#",
      "#.#####.#####.####.#",
      "#.....*..........E.#",
      "#....#....#....#...#", // Cut the highway
      "####################",
    ],
    shadows: [
      { x: 3.5, y: 5.5, minY: 3.5, maxY: 8.5, speed: 1.2, axis: "y" },
    ],
    sticker: "Aqua Deer"
  },
  {
    names: { zh: "第 9 关：终极挑战", en: "Level 9: The Ultimate Challenge" },
    missions: { zh: "你能通过最后一关吗？", en: "Can you beat the final level?" },
    map: [
      "####################",
      "#I..*....#.....*..F#",
      "#.######.#.#######.#",
      "#....#...#~~~~~#...#",
      "####.#.###~~~~~#.#.#",
      "#*...#...K.....D.#.#",
      "#.#####.#####.###..#",
      "#.....*.....#...*..#",
      "#.#########.#.####.#",
      "#..H....~~~~#...*E.#",
      "#....#....#....#...#", // Cut the highway
      "####################",
    ],
    shadows: [
      { x: 4.5, y: 3.5, minX: 1.5, maxX: 5.5, speed: 1.5 },
      { x: 9.5, y: 7.5, minX: 6.5, maxX: 11.5, speed: 1.2 },
      { x: 15.5, y: 1.5, minX: 12.5, maxX: 18.5, speed: 1.7 },
      { x: 18.5, y: 6.5, minY: 4.5, maxY: 10.5, speed: 1.3, axis: "y" },
    ],
    sticker: "Sun Phoenix"
  },
  {
    names: { zh: "第 10 关：暗影试炼", en: "Level 10: The Shadow Gauntlet" },
    missions: { zh: "快速移动的暗影！你能穿过去吗？", en: "Fast moving shadows! Can you make it through?" },
    map: [
      "####################",
      "#I..*....#.....*..F#",
      "#.######.#.#######.#",
      "#....#...#.....#...#",
      "####.#.#######.#.#.#",
      "#*...#...K.....D.#.#",
      "#.#####.#####.###..#",
      "#.....*.....#...*..#",
      "#.#########.#.####.#",
      "#..H....~~~~#...*E.#",
      "#....#....#....#...#",
      "####################",
    ],
    shadows: [
      { x: 4.5, y: 3.5, minX: 1.5, maxX: 5.5, speed: 2.5 }, // Faster!
      { x: 9.5, y: 7.5, minX: 6.5, maxX: 11.5, speed: 2.2 }, // Faster!
      { x: 15.5, y: 1.5, minX: 12.5, maxX: 18.5, speed: 2.7 }, // Faster!
      { x: 18.5, y: 6.5, minY: 4.5, maxY: 10.5, speed: 2.3, axis: "y" }, // Faster!
    ],
    sticker: "Thunder Eagle"
  },
  {
    names: { zh: "第 11 关：冰封迷宫", en: "Level 11: The Frozen Maze" },
    missions: { zh: "池塘会让你减速，小心影子！", en: "Puddles slow you down. Beware the shadows!" },
    map: [
      "####################",
      "#I...~~~~...*~~~~~F#",
      "#.######.##########",
      "#~~~~#...#~~~~~#...#",
      "####.#.###~~~~~#.###",
      "#*~~~#.....#.....#.#",
      "#.#####.##.#######.#",
      "#...H....#...K.D...#",
      "#.#####.#####.####.#",
      "#.....*..........E.#",
      "#....#....#....#...#",
      "####################",
    ],
    shadows: [
      { x: 3.5, y: 5.5, minY: 3.5, maxY: 8.5, speed: 1.5, axis: "y" },
      { x: 12.5, y: 1.5, minX: 9.5, maxX: 15.5, speed: 1.8 },
    ],
    sticker: "Ice Wolf"
  },
  {
    names: { zh: "第 12 关：终极对决", en: "Level 12: The Grand Finale" },
    missions: { zh: "最后一关！祝你好运！", en: "The final level! Good luck!" },
    map: [
      "####################",
      "#I..*..#.*...#..*..#",
      "#.####.#.###.#.###.#",
      "#.#..#.#.#...#.#...#",
      "#.#.##.#.#.###.#.###",
      "#.#..#...#...#.#..F#",
      "#.##.#######.#.###.#",
      "#..*...#...K.#.D.*.#",
      "#.######.#####.###.#",
      "#..H...*.......*..E#",
      "#....#....#....#...#",
      "####################",
    ],
    shadows: [
      { x: 2.5, y: 3.5, minY: 1.5, maxY: 5.5, speed: 2.0, axis: "y" },
      { x: 7.5, y: 5.5, minX: 5.5, maxX: 10.5, speed: 2.0 },
      { x: 12.5, y: 1.5, minX: 11.5, maxX: 15.5, speed: 2.2 },
      { x: 16.5, y: 7.5, minY: 5.5, maxY: 9.5, speed: 2.5, axis: "y" },
    ],
    sticker: "Star Goddess"
  }
];

const chapterMeta = [
  { start: 0, end: 5, key: "chapter1" },
  { start: 6, end: 11, key: "chapter2" },
  { start: 12, end: 17, key: "chapter3" },
];

const stickerNames = [
  "Moon Cat", "Star Bunny", "Sleepy Owl", "Crystal Fox", "Glow Frog", "Tiny Dragon",
  "Firefly Friend", "Moon Fox", "Cloud Whale", "Star Deer", "Dream Owl", "Garden Guardian",
  "Comet Kitten", "Bridge Sprite", "Mirror Moth", "Storm Star", "Lost Flower", "Moon Crown",
];

function makeLevel(index, en, zh, missionEn, missionZh, map, shadows = [], options = {}) {
  return {
    chapter: Math.floor(index / 6),
    names: { en: `Level ${index + 1}: ${en}`, zh: `第 ${index + 1} 关：${zh}` },
    missions: { en: missionEn, zh: missionZh },
    map,
    shadows,
    sticker: stickerNames[index],
    requiresSwitch: options.requiresSwitch || false,
    movingBridge: options.movingBridge || false,
    fireflies: options.fireflies || false,
    stormSeeds: options.stormSeeds || false,
    guardian: options.guardian || false,
  };
}

function createAdventureLevels() {
  return [
    makeLevel(0, "Wake the Sleeping Stars", "唤醒沉睡的星星",
      "Learn to move, collect every star seed, and step into the moon gate.",
      "学习移动，收集所有星光种子，然后走进月光门。",
      [
        "####################",
        "#I..*.............F#",
        "#..................#",
        "#......*...........#",
        "#..................#",
        "#..........*.......#",
        "#..................#",
        "#....*.............#",
        "#..................#",
        "#...............E..#",
        "#..................#",
        "####################",
      ]),
    makeLevel(1, "Misty Pond", "迷雾池塘",
      "Blue ponds slow Iris and Luna down. Cross them calmly.",
      "蓝色池塘会让 Iris 和 Luna 变慢，慢慢穿过去。",
      [
        "####################",
        "#I..*.......F......#",
        "#..~~~~............#",
        "#..~~~~....*.......#",
        "#..................#",
        "#......~~~~........#",
        "#......~~~~..*.....#",
        "#..................#",
        "#....*.......~~~~..#",
        "#............~~~~E.#",
        "#..................#",
        "####################",
      ]),
    makeLevel(2, "Dancing Shadow", "跳舞的阴影",
      "A slow shadow dances back and forth. Watch its path.",
      "一个慢慢移动的阴影来回跳舞，观察它的路线。",
      [
        "####################",
        "#I..*.............F#",
        "#..................#",
        "#......*...........#",
        "#..................#",
        "#..........*.......#",
        "#..................#",
        "#....*.............#",
        "#..................#",
        "#...............E..#",
        "#..................#",
        "####################",
      ],
      [{ x: 10.5, y: 5.5, minX: 7.5, maxX: 14.5, speed: 0.9 }]),
    makeLevel(3, "Hidden Heart", "隐藏爱心",
      "Hearts gently refill lives. There is still time to explore.",
      "爱心会温柔地恢复生命，可以放心探索。",
      [
        "####################",
        "#I..*.........H...F#",
        "#..####............#",
        "#.....#...*........#",
        "#.....#............#",
        "#.....#......*.....#",
        "#.....#............#",
        "#..*..#............#",
        "#.....#............#",
        "#.....#.........E..#",
        "#..................#",
        "####################",
      ],
      [{ x: 8.5, y: 7.5, minY: 4.5, maxY: 9.5, speed: 0.9, axis: "y" }]),
    makeLevel(4, "Moon Bridge", "月亮桥",
      "Narrow paths and ponds make a gentle bridge challenge.",
      "窄路和池塘组成温柔的月亮桥挑战。",
      [
        "####################",
        "#I..*..#.......*..F#",
        "#.....#..~~~~......#",
        "#.....#..~~~~......#",
        "#.....#............#",
        "#..*..######..*....#",
        "#............~~~~..#",
        "#............~~~~..#",
        "#....H.............#",
        "#...............E..#",
        "#..................#",
        "####################",
      ],
      [
        { x: 12.5, y: 5.5, minX: 9.5, maxX: 16.5, speed: 1.1 },
        { x: 4.5, y: 8.5, minY: 5.5, maxY: 9.5, speed: 0.9, axis: "y" },
      ]),
    makeLevel(5, "First Moon Gate", "第一道月光门",
      "A small milestone: seeds, ponds, shadows, key, and gate.",
      "一个小小里程碑：星种子、池塘、阴影、钥匙和月光门。",
      [
        "####################",
        "#I..*....#.....*..F#",
        "#.####...#..~~~~...#",
        "#....#...#..~~~~...#",
        "#....#...#.........#",
        "#.*..#...K.....D...#",
        "#....#####.........#",
        "#.........*........#",
        "#..H........~~~~...#",
        "#...........~~~~E..#",
        "#..................#",
        "####################",
      ],
      [
        { x: 5.5, y: 3.5, minY: 1.5, maxY: 6.5, speed: 1.0, axis: "y" },
        { x: 14.5, y: 8.5, minX: 10.5, maxX: 17.5, speed: 1.0 },
      ]),
    makeLevel(6, "Twinkling Maze", "闪烁迷宫",
      "A simple maze asks you to choose your path.",
      "简单迷宫会让你练习选择路线。",
      [
        "####################",
        "#I..#...*......#..F#",
        "#...#..####....#...#",
        "#...#.....#....#...#",
        "#.*.#####.#.####...#",
        "#.........#....*...#",
        "#.#########........#",
        "#.....*............#",
        "#..#######..####...#",
        "#...............E..#",
        "#..................#",
        "####################",
      ],
      [
        { x: 11.5, y: 5.5, minX: 8.5, maxX: 15.5, speed: 1.1 },
        { x: 3.5, y: 8.5, minY: 6.5, maxY: 9.5, speed: 1.0, axis: "y" },
      ]),
    makeLevel(7, "Moon Key", "月亮钥匙",
      "Find the moon key first, then collect every star seed to open the gate.",
      "先找到月亮钥匙，再收集所有星种子打开月光门。",
      [
        "####################",
        "#I..*.....#.......F#",
        "#.........#..K.....#",
        "#..####...#........#",
        "#.....#...#..D.....#",
        "#.*...#............#",
        "#.....#####........#",
        "#..........*.......#",
        "#..H...............#",
        "#...............E..#",
        "#..................#",
        "####################",
      ],
      [{ x: 9.5, y: 7.5, minX: 6.5, maxX: 12.5, speed: 1.1 }]),
    makeLevel(8, "Shadow Patrol", "阴影巡逻",
      "Patrol shadows move on predictable paths.",
      "巡逻阴影会沿着固定路线移动。",
      [
        "####################",
        "#I..*..........*..F#",
        "#..####............#",
        "#........####......#",
        "#..................#",
        "#.*....~~~~....*...#",
        "#......~~~~........#",
        "#........####......#",
        "#..H...............#",
        "#...............E..#",
        "#..................#",
        "####################",
      ],
      [
        { x: 6.5, y: 3.5, minX: 3.5, maxX: 10.5, speed: 1.3 },
        { x: 14.5, y: 7.5, minX: 10.5, maxX: 17.5, speed: 1.3 },
        { x: 9.5, y: 5.5, minY: 3.5, maxY: 8.5, speed: 1.0, axis: "y" },
      ]),
    makeLevel(9, "Glow Switches", "发光开关",
      "Step on the moon switch to open the glowing bridge.",
      "踩亮月光开关，打开发光的桥。",
      [
        "####################",
        "#I..*.......B....EF#",
        "#...........B......#",
        "#..####.....B......#",
        "#.....#.....B......#",
        "#.*...#.....B..*...#",
        "#.....#............#",
        "#.....####.........#",
        "#..S.....H.........#",
        "#.............*....#",
        "#..................#",
        "####################",
      ],
      [{ x: 7.5, y: 8.5, minX: 4.5, maxX: 10.5, speed: 1.1 }],
      { requiresSwitch: true }),
    makeLevel(10, "Frozen Stars", "冰封星星",
      "Some frozen stars wake up after the switch glows.",
      "有些冰封星星要等开关亮起后才会苏醒。",
      [
        "####################",
        "#I..*.......L....EF#",
        "#.........~~~~.....#",
        "#..####...~~~~.....#",
        "#.....#............#",
        "#.*...#.....L......#",
        "#.....#............#",
        "#.....####.........#",
        "#..S.....H.........#",
        "#.............*....#",
        "#..................#",
        "####################",
      ],
      [
        { x: 7.5, y: 4.5, minX: 4.5, maxX: 11.5, speed: 1.1 },
        { x: 14.5, y: 7.5, minY: 5.5, maxY: 9.5, speed: 1.0, axis: "y" },
      ],
      { requiresSwitch: true }),
    makeLevel(11, "Garden Guardian", "花园守护者",
      "The gentle guardian moves aside when all star seeds are awake.",
      "温柔的守护者会在星种子全部醒来后让开。",
      [
        "####################",
        "#I..*.........*...F#",
        "#..####............#",
        "#........####......#",
        "#..................#",
        "#.*....~~~~....*...#",
        "#......~~~~........#",
        "#..........G.......#",
        "#..H...............#",
        "#...............E..#",
        "#..................#",
        "####################",
      ],
      [
        { x: 6.5, y: 3.5, minX: 3.5, maxX: 10.5, speed: 1.2 },
        { x: 14.5, y: 5.5, minY: 3.5, maxY: 8.5, speed: 1.1, axis: "y" },
      ],
      { guardian: true }),
    makeLevel(12, "Firefly Trail", "萤火虫小路",
      "Fireflies sparkle near the path toward your next objective.",
      "萤火虫会在通往下一个目标的路上闪闪发光。",
      [
        "####################",
        "#I..*.....#......F.#",
        "#.........#........#",
        "#..####...#..*.....#",
        "#.....#...#........#",
        "#.*...#...#....K.D.#",
        "#.....#####........#",
        "#..........*.......#",
        "#..H...............#",
        "#...............E..#",
        "#..................#",
        "####################",
      ],
      [
        { x: 6.5, y: 7.5, minX: 3.5, maxX: 10.5, speed: 1.2 },
        { x: 13.5, y: 3.5, minY: 1.5, maxY: 6.5, speed: 1.0, axis: "y" },
      ],
      { fireflies: true }),
    makeLevel(13, "Moving Moon Bridges", "移动月亮桥",
      "Moon bridges softly shimmer. Wait for the safe moment.",
      "月亮桥会轻轻闪烁，等安全的时机通过。",
      [
        "####################",
        "#I..*.......B....EF#",
        "#..~~~~.....B......#",
        "#..~~~~.....B......#",
        "#...........B......#",
        "#.*...S.....B..*...#",
        "#..................#",
        "#.....####.........#",
        "#.........H........#",
        "#.............*....#",
        "#..................#",
        "####################",
      ],
      [
        { x: 5.5, y: 8.5, minY: 5.5, maxY: 9.5, speed: 1.1, axis: "y" },
        { x: 15.5, y: 4.5, minX: 12.5, maxX: 17.5, speed: 1.2 },
      ],
      { requiresSwitch: true, movingBridge: true }),
    makeLevel(14, "Mirror Garden", "镜子花园",
      "A symmetric garden works well for solo play or co-op.",
      "对称花园适合单人，也适合双人合作。",
      [
        "####################",
        "#I..*....#....*..F.#",
        "#..###...#...###...#",
        "#........#.........#",
        "#..*.....#.....*...#",
        "#........K.........#",
        "#..*.....D.....*...#",
        "#........#.........#",
        "#..###...#...###...#",
        "#..H..........E....#",
        "#..................#",
        "####################",
      ],
      [
        { x: 5.5, y: 3.5, minY: 1.5, maxY: 8.5, speed: 1.2, axis: "y" },
        { x: 14.5, y: 8.5, minY: 1.5, maxY: 8.5, speed: 1.2, axis: "y" },
      ]),
    makeLevel(15, "Star Storm", "星星风暴",
      "Shimmering seeds drift softly in the stormy moonlight.",
      "星星风暴里，星种子会轻轻闪动。",
      [
        "####################",
        "#I..*..........*..F#",
        "#..~~~~............#",
        "#.........*........#",
        "#....####..........#",
        "#.*..#..K.....D....#",
        "#....#.............#",
        "#....####......*...#",
        "#..H.......~~~~....#",
        "#...........~~~~E..#",
        "#..................#",
        "####################",
      ],
      [
        { x: 4.5, y: 3.5, minY: 1.5, maxY: 6.5, speed: 1.4, axis: "y" },
        { x: 12.5, y: 8.5, minX: 8.5, maxX: 17.5, speed: 1.4 },
        { x: 16.5, y: 4.5, minY: 2.5, maxY: 8.5, speed: 1.1, axis: "y" },
      ],
      { stormSeeds: true }),
    makeLevel(16, "The Lost Flower", "走失的花",
      "A hidden moon flower is tucked away off the main path.",
      "一朵月光花藏在主路之外的小角落。",
      [
        "####################",
        "#I..*.....#.......F#",
        "#.........#..#######",
        "#..####...#........#",
        "#.....#...#..*.....#",
        "#.*...#...K.....D..#",
        "#.....#####........#",
        "#..........*.......#",
        "#..H....~~~~.......#",
        "#........~~~~...E..#",
        "#..................#",
        "####################",
      ],
      [
        { x: 6.5, y: 7.5, minX: 3.5, maxX: 10.5, speed: 1.3 },
        { x: 15.5, y: 5.5, minY: 3.5, maxY: 9.5, speed: 1.2, axis: "y" },
      ]),
    makeLevel(17, "Final Moon Gate", "最终月光门",
      "The final adventure combines seeds, pond, shadow, key, switch, heart, moon flower, and gate.",
      "最后的冒险会结合星种子、池塘、阴影、钥匙、开关、爱心、月光花和月光门。",
      [
        "####################",
        "#I..*....#....*..F.#",
        "#..~~~~..#..~~~~...#",
        "#..~~~~..#..~~~~...#",
        "#....#...#....S....#",
        "#.*..#...KBBBBBD...#",
        "#....#####.........#",
        "#..........*...G...#",
        "#..H.......~~~~....#",
        "#...........~~~~E..#",
        "#..................#",
        "####################",
      ],
      [
        { x: 4.5, y: 3.5, minY: 1.5, maxY: 6.5, speed: 1.4, axis: "y" },
        { x: 10.5, y: 7.5, minX: 7.5, maxX: 14.5, speed: 1.4 },
        { x: 16.5, y: 5.5, minY: 3.5, maxY: 9.5, speed: 1.2, axis: "y" },
      ],
      { requiresSwitch: true, guardian: true }),
  ];
}

levels = createAdventureLevels();

const state = {
  player: { id: "p1", name: "Iris", x: 1.5, y: 1.5, radius: 15, speed: 4.1, score: 0, invincible: 0 },
  player2: { id: "p2", name: "Luna", x: 1.5, y: 1.5, radius: 15, speed: 4.1, score: 0, invincible: 0 },
  seeds: [],
  key: null,
  hasKey: false,
  exit: { x: 18.5, y: 7.5 },
  shadows: [],
  walls: [],
  puddles: [],
  heartPickups: [],
  flowers: [],
  switches: [],
  bridges: [],
  guardians: [],
  safeZones: [],
  door: null,
  totalSeeds: 0,
  particles: [],
  screenShake: 0,
};

const SAVE_KEY = "iris-moon-garden:v1";

const defaultSave = {
  version: 1,
  unlockedLevel: 1,
  bestTimes: {},
  bestStars: {},
  flowers: {},
  stickers: {},
  muted: true,
  cozyMode: true,
  difficulty: "cozy",
};

function readSave() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (parsed && parsed.version === 1) return { ...defaultSave, ...parsed };
  } catch (error) {
    console.warn("Could not read save data", error);
  }
  const legacyProgress = parseInt(localStorage.getItem("moonGardenProgress") || "0", 10);
  return { ...defaultSave, unlockedLevel: Math.max(1, legacyProgress + 1) };
}

function writeSave(patch) {
  const next = { ...readSave(), ...patch };
  localStorage.setItem(SAVE_KEY, JSON.stringify(next));
  return next;
}

function challengeUnlocked() {
  return readSave().unlockedLevel > 6;
}

const difficultySettings = {
  cozy: { hearts: 5, shadowSpeed: 0.7, invincible: 2.0, heartLimit: Infinity },
  adventure: { hearts: 3, shadowSpeed: 1, invincible: 1.4, heartLimit: Infinity },
  challenge: { hearts: 3, shadowSpeed: 1.18, invincible: 1.0, heartLimit: 1 },
};

function activeDifficulty() {
  if (difficultyMode === "challenge" && !challengeUnlocked()) return difficultySettings.cozy;
  return difficultySettings[difficultyMode] || difficultySettings.cozy;
}

function tt(key, vars = {}) {
  const v = i18n[currentLang][key] ?? i18n.en[key] ?? "";
  return v.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : ""));
}

function setHidden(el, hidden) {
  if (!el) return;
  el.classList.toggle("hidden", hidden);
  el.hidden = hidden;
  el.setAttribute("aria-hidden", hidden ? "true" : "false");
}

function clearCompleteOverlay() {
  if (els.completeTitle) els.completeTitle.textContent = "";
  if (els.starsDisplay) els.starsDisplay.textContent = "";
  if (els.completeStats) els.completeStats.textContent = "";
  if (els.nextLevel) els.nextLevel.textContent = "";
}

function clearEndOverlay() {
  if (els.endTitle) els.endTitle.textContent = "";
  if (els.endStats) els.endStats.textContent = "";
  if (els.endFlowers) els.endFlowers.textContent = "";
  if (els.endStickers) els.endStickers.textContent = "";
  if (els.endBadge) els.endBadge.textContent = "";
  if (els.playAgain) els.playAgain.textContent = "";
  if (els.levelMap) els.levelMap.textContent = "";
  if (els.showStickers) els.showStickers.textContent = "";
  if (els.endLang) els.endLang.textContent = "";
  if (els.stickerContainer) {
    els.stickerContainer.innerHTML = "";
    els.stickerContainer.hidden = true;
  }
}

function hideCompleteOverlay() {
  setHidden(els.completeOverlay, true);
  clearCompleteOverlay();
}

function hideEndOverlay() {
  setHidden(els.endOverlay, true);
  clearEndOverlay();
}

function levelLabel(index) {
  return currentLang === "zh" ? `第 ${index + 1} 关` : `Level ${index + 1}`;
}

function levelCompletionStars() {
  let stars = 0;
  const allSeeds = state.seeds.every((s) => s.collected);
  if (allSeeds) stars++;
  if (livesLostThisLevel <= 1) stars++;
  const flowerCollected = state.flowers.length > 0 && state.flowers.every((f) => f.collected);
  if (flowerCollected) stars++;
  if (levelAssist.skip || levelAssist.cozyAssist || levelAssist.add3) stars = Math.min(stars, 1);
  else if (levelAssist.add1 || levelAssist.slow) stars = Math.min(stars, 2);
  return stars;
}

function renderCompleteOverlayContent(stars = levelCompletionStars()) {
  const t = i18n[currentLang];
  if (els.completeTitle) els.completeTitle.textContent = t.completeTitle;
  if (els.nextLevel) els.nextLevel.textContent = t.nextLevelBtn;
  if (els.starsDisplay) els.starsDisplay.textContent = "⭐".repeat(stars) + "☆".repeat(3 - stars);
  if (!els.completeStats) return;
  const collected = state.seeds.filter((s) => s.collected).length;
  const flowerText = state.flowers.some((f) => f.collected) ? t.flowerFound : t.flowerMissing;
  const assistText = levelAssist.skip || levelAssist.cozyAssist || levelAssist.add3 || levelAssist.add1 || levelAssist.slow
    ? ` · ${t.assistComplete} ${t.tryMoreStars}`
    : ` · ${t.greatJob}`;
  if (coopMode) {
    els.completeStats.textContent = `${t.seeds}: ${collected}/${state.totalSeeds} · ${t.irisLabel}: ${state.player.score} · ${t.lunaLabel}: ${state.player2.score} · ${t.hits}: ${livesLostThisLevel} · ${t.time}: ${formatTime(levelTime)} · ${flowerText}${assistText}`;
  } else {
    els.completeStats.textContent = `${t.seeds}: ${collected}/${state.totalSeeds} · ${t.hits}: ${livesLostThisLevel} · ${t.time}: ${formatTime(levelTime)} · ${flowerText}${assistText}`;
  }
}

function renderEndOverlayContent(stars = levelCompletionStars()) {
  const t = i18n[currentLang];
  const totalLevels = levels.length;
  if (els.endTitle) els.endTitle.textContent = t.endTitle;
  if (els.playAgain) els.playAgain.textContent = t.playAgainBtn;
  if (els.levelMap) els.levelMap.textContent = t.levelMapBtn;
  if (els.showStickers) els.showStickers.textContent = t.stickerBookBtn;
  if (els.endLang) els.endLang.textContent = t.changeLanguageBtn;
  const save = readSave();
  const totalStars = Object.values(save.bestStars || {}).reduce((sum, value) => sum + Number(value || 0), 0);
  const chapterScores = chapterMeta.map((chapter) => {
    let score = 0;
    for (let i = chapter.start; i <= chapter.end; i++) score += Number(save.bestStars[i + 1] || 0);
    return score;
  });
  const bestChapter = chapterScores.indexOf(Math.max(...chapterScores));
  if (els.endStats) {
    if (coopMode) {
      els.endStats.textContent = `${t.totalStars}: ${totalStars} / ${levels.length * 3} · ⭐ ${stars}★ · ${t.irisLabel}: ${state.player.score} · ${t.lunaLabel}: ${state.player2.score} · ${t.hits}: ${livesLostThisLevel}`;
    } else {
      els.endStats.textContent = `${t.totalStars}: ${totalStars} / ${levels.length * 3} · ⭐ ${stars}★ · ${t.time}: ${formatTime(levelTime)} · ${t.hits}: ${livesLostThisLevel}`;
    }
  }
  if (els.endFlowers) els.endFlowers.textContent = tt("flowersFound", { n: countFoundFlowers(), total: totalLevels });
  if (els.endStickers) els.endStickers.textContent = tt("stickersUnlocked", { n: countUnlockedStickers(), total: totalLevels });
  if (els.endBadge) els.endBadge.textContent = tt("endBadge", { name: tt(chapterMeta[bestChapter]?.key || "chapter1") });
}

function switchLanguage(lang) {
    currentLang = lang;
    els.langBtn.textContent = lang === "zh" ? "English" : "中文";
    els.langBtn.setAttribute("aria-label", lang === "zh" ? "Switch to English" : "切换到中文");
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    const t = i18n[lang];
    els.hudTitle.textContent = t.title;
    if (els.surface) els.surface.setAttribute("aria-label", t.title);
    if (els.storyTitle) els.storyTitle.textContent = t.storyTitle;
    els.overlayCopy.textContent = t.intro;
    els.start.textContent = t.startBtn;
    els.restart.textContent = t.restartBtn;
    els.pause.textContent = paused ? t.pauseBtnActive : t.pauseBtn;
    els.help.textContent = showHintPath ? t.helpBtnActive : t.helpBtn;
    if (els.magicHelp) els.magicHelp.textContent = t.magicHelpBtn;
    if (els.magicTitle) els.magicTitle.textContent = t.magicHelpTitle;
    if (els.magicHeart1) els.magicHeart1.textContent = t.magicHeart1;
    if (els.magicHeart3) els.magicHeart3.textContent = t.magicHeart3;
    if (els.magicSlow) els.magicSlow.textContent = t.magicSlow;
    if (els.magicPath) els.magicPath.textContent = t.magicPath;
    if (els.magicSkip) els.magicSkip.textContent = t.magicSkip;
    if (els.magicCozy) els.magicCozy.textContent = t.magicCozy;
    if (els.coopHelp) els.coopHelp.textContent = t.coopHelp;
    if (els.selectLevelLabel) els.selectLevelLabel.textContent = `${t.selectLevel}:`;
    document.title = t.title;
    if (els.completeOverlay && !els.completeOverlay.hidden) renderCompleteOverlayContent();
    if (els.endOverlay && !els.endOverlay.hidden) renderEndOverlayContent();
    updateContinueButton();
    updateModeUI();
    updateDifficultyUI();
    populateLevelSelector();

    if (running && levels[levelIndex]) {
        els.level.textContent = `🌙 ${levelLabel(levelIndex)}`;
        els.mission.textContent = state.key && !state.hasKey ? t.keyLine : levels[levelIndex].missions[lang];
        updateSeedsDisplay();
        updateHud();
    } else {
        els.mission.textContent = "";
    }
}

function updateModeUI() {
  const t = i18n[currentLang];
  if (els.coopBtn) {
    els.coopBtn.textContent = coopMode ? t.coopBtnOn : t.coopBtnOff;
    els.coopBtn.setAttribute("aria-pressed", String(coopMode));
    els.coopBtn.style.background = coopMode ? "#e0aaff" : "#fff";
    els.coopBtn.style.borderColor = coopMode ? "#7b5dc8" : "#ddd1c0";
  }
  if (els.hintText) els.hintText.textContent = coopMode ? t.hintCoop : t.hintSolo;
}

function updateDifficultyUI() {
  const t = i18n[currentLang];
  const items = [
    [els.modeCozy, "cozy", t.modeCozy],
    [els.modeAdventure, "adventure", t.modeAdventure],
    [els.modeChallenge, "challenge", challengeUnlocked() ? t.modeChallenge : t.modeChallengeLocked],
  ];
  items.forEach(([button, mode, label]) => {
    if (!button) return;
    button.textContent = label;
    const active = difficultyMode === mode;
    button.setAttribute("aria-pressed", String(active));
    button.disabled = mode === "challenge" && !challengeUnlocked();
    button.style.background = active ? "#e8f6ef" : "#fff";
    button.style.borderColor = active ? "#7bb99a" : "#ddd1c0";
    button.style.opacity = button.disabled ? "0.55" : "1";
  });
}

function updateContinueButton() {
  if (!els.continue) return;
  const t = i18n[currentLang];
  const saved = readSave().unlockedLevel;
  if (saved > 1 && saved <= levels.length) {
    els.continue.hidden = false;
    els.continue.removeAttribute("aria-hidden");
    els.continue.classList.remove("hidden");
    els.continue.textContent = tt("continueFrom", { n: saved });
  } else {
    els.continue.hidden = true;
    els.continue.setAttribute("aria-hidden", "true");
    els.continue.classList.add("hidden");
  }
}

function updateSeedsDisplay() {
  const collectedCount = state.seeds.filter((s) => s.collected).length;
  const t = i18n[currentLang];
  if (!running) {
    els.seeds.textContent = `⭐ ${t.seeds}: — / —`;
    return;
  }
  if (coopMode) {
    els.seeds.textContent = `⭐ ${t.seeds}: ${collectedCount} / ${state.totalSeeds} · ${t.irisLabel}: ${state.player.score} · ${t.lunaLabel}: ${state.player2.score}`;
  } else {
    els.seeds.textContent = `⭐ ${t.seeds}: ${collectedCount} / ${state.totalSeeds}`;
  }
}

function loadLevel(index) {
  const level = levels[index];
  if (!level) return;
  state.seeds = [];
  state.walls = [];
  state.puddles = [];
  state.heartPickups = [];
  state.flowers = [];
  state.switches = [];
  state.bridges = [];
  state.guardians = [];
  state.safeZones = [];
  state.key = null;
  state.hasKey = false;
  state.door = null;
  state.shadows = level.shadows.map((shadow) => ({ ...shadow, dir: 1 }));
  let heartsAdded = 0;

  level.map.forEach((row, y) => {
    [...row].forEach((cell, x) => {
      if (cell === "#") state.walls.push({ x, y });
      if (cell === "I") {
        state.player.x = x + 0.5;
        state.player.y = y + 0.5;
        if (coopMode) {
          // Spawn P2 one tile to the right if available, otherwise below, so it doesn't sit on top of P1.
          const rightFree = level.map[y] && level.map[y][x + 1] && level.map[y][x + 1] !== "#";
          const downFree = level.map[y + 1] && level.map[y + 1][x] && level.map[y + 1][x] !== "#";
          if (rightFree) {
            state.player2.x = x + 1.5;
            state.player2.y = y + 0.5;
          } else if (downFree) {
            state.player2.x = x + 0.5;
            state.player2.y = y + 1.5;
          } else {
            state.player2.x = x + 0.5;
            state.player2.y = y + 0.5;
          }
          state.player2.invincible = 1;
          state.player2.score = 0;
        }
      }
      if (cell === "*") state.seeds.push({ x: x + 0.5, y: y + 0.5, collected: false });
      if (cell === "L") state.seeds.push({ x: x + 0.5, y: y + 0.5, collected: false, locked: true });
      if (cell === "K") state.key = { x: x + 0.5, y: y + 0.5, collected: false };
      if (cell === "~") state.puddles.push({ x, y });
      if (cell === "H" && heartsAdded < activeDifficulty().heartLimit) {
        heartsAdded++;
        state.heartPickups.push({ x: x + 0.5, y: y + 0.5, collected: false });
      }
      if (cell === "F") state.flowers.push({ x: x + 0.5, y: y + 0.5, collected: false });
      if (cell === "S") state.switches.push({ x: x + 0.5, y: y + 0.5, activated: false });
      if (cell === "B") state.bridges.push({ x, y });
      if (cell === "G") state.guardians.push({ x: x + 0.5, y: y + 0.5 });
      if (cell === "D") state.door = { x, y };
      if (cell === "E") state.exit = { x: x + 0.5, y: y + 0.5 };
    });
  });

  state.totalSeeds = state.seeds.length;
  if (index >= 4) {
    const anchor = state.heartPickups[0] || state.switches[0] || state.key || state.seeds[0] || state.exit;
    if (anchor) state.safeZones.push({ x: anchor.x, y: anchor.y, radius: 1.25 });
  }
  state.player.invincible = 1;
  state.player2.invincible = 1;
  levelTime = 0;
  livesLostThisLevel = 0;
  recentHitTimes = [];
  levelAssist = {};
  
  els.mission.textContent = state.key
    ? i18n[currentLang].keyLine
    : level.missions[currentLang];
  els.level.textContent = `🌙 ${levelLabel(index)}`;
  state.player.score = 0;
  state.player2.score = 0;
  updateSeedsDisplay();

  // Show level intro title overlay (briefly)
  showToast(level.names[currentLang], 2.5);

  updateHud();
}

function startGame(startIndex = 0) {
  console.log("startGame called with index:", startIndex);
  try {
      soundManager.init();
      soundManager.playMusic();
  } catch (e) {
      console.warn("Audio init failed:", e);
  }

  try {
      cozyMode = difficultyMode === "cozy";
      MAX_HEARTS = activeDifficulty().hearts;
      hearts = MAX_HEARTS;
      
      levelIndex = startIndex;
      runTime = 0;
      levelTime = 0;
      paused = false;
      running = true;
      lastTime = 0;
      keys.clear();
      els.pause.textContent = i18n[currentLang].pauseBtn;
      
      els.hud.classList.remove("hidden");
      els.hud.hidden = false;
      els.hud.setAttribute("aria-hidden", "false");
      els.progressBar.classList.remove("hidden");
      els.progressBar.hidden = false;
      els.progressBar.setAttribute("aria-hidden", "false");
      hideCompleteOverlay();
      hideEndOverlay();

      state.player.score = 0;
      state.player2.score = 0;

      loadLevel(levelIndex);
      updateModeUI();
      hideOverlay();
      requestAnimationFrame(loop);
      console.log("Game started successfully");
  } catch (error) {
      console.error("Critical error starting game:", error);
      alert("Error starting game: " + error.message);
  }
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
  hintTimer = Math.max(0, hintTimer - dt);
  if (hintTimer === 0 && showHintPath) {
    showHintPath = false;
    els.help.textContent = i18n[currentLang].helpBtn;
  }
  if (toastTimer === 0) els.toast.classList.add("hidden");
  state.player.invincible = Math.max(0, state.player.invincible - dt);
  if (coopMode) state.player2.invincible = Math.max(0, state.player2.invincible - dt);
  state.screenShake = Math.max(0, state.screenShake - dt * 2);
  
  movePlayer(dt);
  moveShadows(dt);
  collectItems();
  updateParticles(dt);
  checkShadowHits();
  checkExit();
  updateHud();
}

function movePlayer(dt) {
  // Player 1 (Iris)
  let dx = 0;
  let dy = 0;
  if (coopMode) {
    if (keys.has("a")) dx -= 1;
    if (keys.has("d")) dx += 1;
    if (keys.has("w")) dy -= 1;
    if (keys.has("s")) dy += 1;
  } else {
    if (keys.has("arrowleft") || keys.has("a")) dx -= 1;
    if (keys.has("arrowright") || keys.has("d")) dx += 1;
    if (keys.has("arrowup") || keys.has("w")) dy -= 1;
    if (keys.has("arrowdown") || keys.has("s")) dy += 1;
  }

  if (dx && dy) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }

  let speedMultiplier = currentSpeedMultiplier(state.player);
  const speed = state.player.speed * speedMultiplier;
  tryMove(state.player, dx * speed * dt, 0);
  tryMove(state.player, 0, dy * speed * dt);

  // Player 2 (Luna)
  if (coopMode) {
    let dx2 = 0;
    let dy2 = 0;
    if (keys.has("arrowleft")) dx2 -= 1;
    if (keys.has("arrowright")) dx2 += 1;
    if (keys.has("arrowup")) dy2 -= 1;
    if (keys.has("arrowdown")) dy2 += 1;
    
    if (dx2 && dy2) {
      dx2 *= Math.SQRT1_2;
      dy2 *= Math.SQRT1_2;
    }
    
    let speedMultiplier2 = currentSpeedMultiplier(state.player2);
    const speed2 = state.player2.speed * speedMultiplier2;
    tryMove(state.player2, dx2 * speed2 * dt, 0);
    tryMove(state.player2, 0, dy2 * speed2 * dt);
  }
}
function tryMove(player, dx, dy) {
  const next = { x: player.x + dx, y: player.y + dy };
  if (!collides(player, next.x, next.y)) {
    player.x = next.x;
    player.y = next.y;
  }
}

function collides(player, x, y) {
  const r = player.radius / TILE;
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
    if (bridgeBlocks(tx, ty)) return true;
    if (guardianBlocks(tx, ty)) return true;
    if (state.door && tx === state.door.x && ty === state.door.y) {
      if (state.key && !state.hasKey) return true;
      if (!allSwitchesActivated()) return true;
    }
    return false;
  });
}

function isWall(x, y) {
  const level = levels[levelIndex];
  if (!level || y < 0 || y >= level.map.length || x < 0 || x >= level.map[0].length) return true;
  return state.walls.some((wall) => wall.x === x && wall.y === y);
}

function allSwitchesActivated() {
  return state.switches.length === 0 || state.switches.every((sw) => sw.activated);
}

function bridgeBlocks(x, y) {
  if (!state.bridges.some((bridge) => bridge.x === x && bridge.y === y)) return false;
  if (!levels[levelIndex]?.requiresSwitch) return false;
  if (allSwitchesActivated()) return false;
  return true;
}

function guardianBlocks(x, y) {
  const allSeeds = state.seeds.every((seed) => seed.collected);
  return !allSeeds && state.guardians.some((guardian) => Math.floor(guardian.x) === x && Math.floor(guardian.y) === y);
}

function currentSpeedMultiplier(player) {
  const tx = Math.floor(player.x);
  const ty = Math.floor(player.y);
  return state.puddles.some((puddle) => puddle.x === tx && puddle.y === ty) ? 0.58 : 1;
}

function moveShadows(dt) {
  state.shadows.forEach((shadow) => {
    const axis = shadow.axis || "x";
    const min = axis === "x" ? shadow.minX : shadow.minY;
    const max = axis === "x" ? shadow.maxX : shadow.maxY;
    
    let speed = shadow.speed * activeDifficulty().shadowSpeed;
    if (levelAssist.slow || levelAssist.cozyAssist) speed *= 0.65;
    if (difficultyMode === "cozy" && livesLostThisLevel >= 3) speed *= 0.85;

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
  state.switches.forEach((sw) => {
    if (sw.activated) return;
    if (distance(sw, state.player) < 0.55 || (coopMode && distance(sw, state.player2) < 0.55)) {
      sw.activated = true;
      showToast(i18n[currentLang].switchToast, 1.7);
      createParticles(sw.x * TILE, sw.y * TILE, "#7b5dc8");
      soundManager.playRefill();
    }
  });

  state.seeds.forEach((seed) => {
    if (!seed.collected) {
      if (seed.locked && !allSwitchesActivated()) return;
      if (distance(seed, state.player) < 0.55) {
        seed.collected = true;
        soundManager.playCollect();
        createParticles(seed.x * TILE, seed.y * TILE, "#f2b83d");
        state.player.score++;
        updateSeedsHUD();
      } else if (coopMode && distance(seed, state.player2) < 0.55) {
        seed.collected = true;
        soundManager.playCollect();
        createParticles(seed.x * TILE, seed.y * TILE, "#e0aaff");
        state.player2.score++;
        updateSeedsHUD();
      }
    }
  });
  
  function updateSeedsHUD() {
    updateSeedsDisplay();
    const collectedCount = state.seeds.filter((item) => item.collected).length;
    if (state.totalSeeds - collectedCount === 0) {
      showToast(i18n[currentLang].toastSeedsDone, 2);
    }
  }
  
  if (state.key && !state.key.collected) {
    if (distance(state.key, state.player) < 0.55) {
      state.key.collected = true;
      state.hasKey = true;
      showToast(i18n[currentLang].toastKeyFound);
    } else if (coopMode && distance(state.key, state.player2) < 0.55) {
      state.key.collected = true;
      state.hasKey = true;
      showToast(i18n[currentLang].toastKeyFound);
    }
  }
  
  state.heartPickups.forEach((heart) => {
    if (heart.collected) return;
    if (distance(heart, state.player) < 0.55) {
      heart.collected = true;
      if (hearts < HEART_CAP) {
        hearts = Math.min(HEART_CAP, hearts + 1);
        soundManager.playRefill();
        createFloatingText("+1 ❤️", state.player.x, state.player.y);
      }
    } else if (coopMode && distance(heart, state.player2) < 0.55) {
      heart.collected = true;
      if (hearts < HEART_CAP) {
        hearts = Math.min(HEART_CAP, hearts + 1);
        soundManager.playRefill();
        createFloatingText("+1 ❤️", state.player2.x, state.player2.y);
      }
    }
  });

  state.flowers.forEach((flower) => {
    if (flower.collected) return;
    if (distance(flower, state.player) < 0.55) {
      flower.collected = true;
      unlockFlower();
    } else if (coopMode && distance(flower, state.player2) < 0.55) {
      flower.collected = true;
      unlockFlower();
    }
    
    function unlockFlower() {
      const stickerName = levels[levelIndex].sticker;
      const save = readSave();
      writeSave({
        flowers: { ...(save.flowers || {}), [levelIndex + 1]: true },
        stickers: { ...(save.stickers || {}), [levelIndex + 1]: stickerName },
      });
      localStorage.setItem("moonGardenSticker_" + levelIndex, stickerName);
      localStorage.setItem("moonGardenFlower_" + levelIndex, "1");
      showToast(`${i18n[currentLang].toastFlower} ⭐ ${stickerName}`, 2.4);
      createParticles(flower.x * TILE, flower.y * TILE, "#e0aaff");
      soundManager.playRefill();
    }
  });
}

function checkShadowHits() {
  if (state.player.invincible > 0 && (!coopMode || state.player2.invincible > 0)) return;
  
  // Player 1 hit
  if (state.player.invincible === 0) {
    const hit = state.shadows.some((shadow) => distance(shadow, state.player) < 0.62);
    if (hit) {
      hearts -= 1;
      livesLostThisLevel++;
      registerHit();
      state.player.invincible = activeDifficulty().invincible;
      state.screenShake = 0.3;
      soundManager.playHit();
      if (hearts <= 0) restartCurrentLevelSoftly();
    }
  }
  
  // Player 2 hit
  if (coopMode && state.player2.invincible === 0) {
    const hit2 = state.shadows.some((shadow) => distance(shadow, state.player2) < 0.62);
    if (hit2) {
      hearts -= 1;
      livesLostThisLevel++;
      registerHit();
      state.player2.invincible = activeDifficulty().invincible;
      state.screenShake = 0.3;
      soundManager.playHit();
      if (hearts <= 0) restartCurrentLevelSoftly();
    }
  }
}

function registerHit() {
  recentHitTimes.push(levelTime);
  recentHitTimes = recentHitTimes.filter((time) => levelTime - time <= 30);
  if (recentHitTimes.length >= 3 && !levelAssist.hitOfferShown) {
    levelAssist.hitOfferShown = true;
    showToast(`${i18n[currentLang].gardenHelp} ${i18n[currentLang].extraHeartOffer}`, 3.2);
    showMagicHelp(true);
  }
}

function restartCurrentLevelSoftly() {
  showToast(i18n[currentLang].toastGameOver, 1.4);
  hearts = MAX_HEARTS;
  loadLevel(levelIndex);
}

function addHearts(amount, assistKey) {
  hearts = Math.min(HEART_CAP, hearts + amount);
  levelAssist[assistKey] = true;
  updateHud();
  soundManager.playRefill();
  showToast(amount >= 3 ? i18n[currentLang].magicThreeToast : i18n[currentLang].magicHeartToast, 1.7);
}

function showMagicHelp(show = true) {
  setHidden(els.magicPanel, !show);
}

function triggerPathHint(duration = 3) {
  showHintPath = true;
  hintTimer = Math.max(hintTimer, duration);
  els.help.textContent = i18n[currentLang].helpBtnActive;
  showToast(i18n[currentLang].hintReady, 1.2);
}

function skipLevel() {
  if (!running) return;
  levelAssist.skip = true;
  state.seeds.forEach((seed) => { seed.collected = true; });
  state.flowers.forEach((flower) => { flower.collected = false; });
  state.hasKey = true;
  state.switches.forEach((sw) => { sw.activated = true; });
  running = false;
  showToast(i18n[currentLang].magicSkipToast, 1.6);
  showLevelCompleteScreen();
}

function handleRestartAssist() {
  restartCounts[levelIndex] = (restartCounts[levelIndex] || 0) + 1;
  if (restartCounts[levelIndex] === 2) {
    levelAssist.restartHeart = true;
    addHearts(1, "add1");
    showToast(`${i18n[currentLang].gardenHelp} ${i18n[currentLang].magicHeartToast}`, 2.2);
  }
  if (restartCounts[levelIndex] >= 3) {
    showMagicHelp(true);
    triggerPathHint(5);
  }
}

function checkExit() {
  const allSeeds = state.seeds.every((seed) => seed.collected);
  const doorOpen = (!state.door || state.hasKey) && allSwitchesActivated();
  const guardiansClear = state.guardians.length === 0 || allSeeds;
  
  const playerAtExit = distance(state.exit, state.player) < 0.62 || (coopMode && distance(state.exit, state.player2) < 0.62);
  
  if (allSeeds && doorOpen && guardiansClear && playerAtExit) {
    running = false;
    showLevelCompleteScreen();
  }
}

function countFoundFlowers() {
  const save = readSave();
  let n = Object.values(save.flowers || {}).filter(Boolean).length;
  for (let i = 0; i < levels.length; i++) {
    if (localStorage.getItem("moonGardenFlower_" + i) && !save.flowers?.[i + 1]) n++;
  }
  return n;
}
function countUnlockedStickers() {
  const save = readSave();
  let n = Object.values(save.stickers || {}).filter(Boolean).length;
  for (let i = 0; i < levels.length; i++) {
    if (localStorage.getItem("moonGardenSticker_" + i) && !save.stickers?.[i + 1]) n++;
  }
  return n;
}

function showLevelCompleteScreen() {
    const stars = levelCompletionStars();
    recordLevelResult(stars);

    if (levelIndex === levels.length - 1) {
        renderEndOverlayContent(stars);

        if (els.stickerContainer) {
          els.stickerContainer.innerHTML = "";
          els.stickerContainer.hidden = true;
        }

        setHidden(els.endOverlay, false);
        soundManager.playWin();
        return;
    }

    renderCompleteOverlayContent(stars);
    setHidden(els.completeOverlay, false);
    soundManager.playWin();
}

function recordLevelResult(stars) {
  const save = readSave();
  const levelNumber = levelIndex + 1;
  const bestStars = { ...(save.bestStars || {}) };
  const bestTimes = { ...(save.bestTimes || {}) };
  const flowers = { ...(save.flowers || {}) };
  const stickers = { ...(save.stickers || {}) };
  bestStars[levelNumber] = Math.max(Number(bestStars[levelNumber] || 0), stars);
  const wholeTime = Math.max(1, Math.floor(levelTime));
  bestTimes[levelNumber] = bestTimes[levelNumber] ? Math.min(Number(bestTimes[levelNumber]), wholeTime) : wholeTime;
  if (state.flowers.some((flower) => flower.collected)) {
    flowers[levelNumber] = true;
    stickers[levelNumber] = levels[levelIndex].sticker;
  }
  const unlockedLevel = Math.min(levels.length, Math.max(save.unlockedLevel || 1, levelIndex + 2));
  writeSave({ unlockedLevel, bestStars, bestTimes, flowers, stickers, difficulty: difficultyMode, cozyMode: difficultyMode === "cozy" });
  localStorage.setItem("moonGardenProgress", String(unlockedLevel - 1));
  updateDifficultyUI();
  populateLevelSelector();
}

els.nextLevel.addEventListener("click", () => {
    hideCompleteOverlay();
    levelIndex++;
    if (levelIndex >= levels.length) {
        // Show the end overlay rather than reusing the start overlay
        showLevelCompleteScreen();
        return;
    }
    loadLevel(levelIndex);
    running = true;
    requestAnimationFrame(loop);
});

function updateHud() {
  els.time.textContent = `⏱ ${i18n[currentLang].time} ${formatTime(runTime)}`;
  els.hearts.textContent = "♡".repeat(hearts);
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

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        state.particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 150,
            vy: (Math.random() - 0.5) * 150,
            life: 0.5,
            color
        });
    }
}

function updateParticles(dt) {
    state.particles = state.particles.filter(p => p.life > 0);
    state.particles.forEach(p => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
    });
}

function drawParticles() {
    state.particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// --- Drawing Functions ---

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.save();
  if (state.screenShake > 0) {
    const rx = (Math.random() - 0.5) * 10;
    const ry = (Math.random() - 0.5) * 10;
    ctx.translate(rx, ry);
  }
  
  drawGarden();
  drawSafeZones();
  drawBridges();
  drawExit();
  drawDoor();
  drawSwitches();
  drawSeeds();
  drawKey();
  drawHeartPickups();
  drawFlowers();
  drawGuardians();
  drawFireflies();
  drawShadows();
  drawPlayer();
  if (coopMode) drawPlayer2();
  drawParticles();
  drawHintPath();
  
  ctx.restore();
}

function drawFlowers() {
  state.flowers.forEach((flower) => {
    if (flower.collected) return;
    const x = flower.x * TILE;
    const y = flower.y * TILE;
    ctx.fillStyle = "#e0aaff"; // Light purple
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawSafeZones() {
  state.safeZones.forEach((zone) => {
    ctx.fillStyle = "rgba(255, 250, 240, 0.32)";
    ctx.strokeStyle = "rgba(255, 232, 148, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(zone.x * TILE, zone.y * TILE, zone.radius * TILE, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
}

function drawSwitches() {
  state.switches.forEach((sw) => {
    const x = sw.x * TILE;
    const y = sw.y * TILE;
    ctx.fillStyle = sw.activated ? "#ffe08a" : "#9ec7df";
    ctx.beginPath();
    ctx.arc(x, y, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = sw.activated ? "#d89b25" : "#3478b9";
    ctx.lineWidth = 3;
    ctx.stroke();
  });
}

function drawBridges() {
  state.bridges.forEach((bridge) => {
    const active = !bridgeBlocks(bridge.x, bridge.y);
    ctx.fillStyle = active ? "rgba(255, 232, 148, 0.66)" : "rgba(123, 93, 200, 0.42)";
    ctx.fillRect(bridge.x * TILE + 4, bridge.y * TILE + 4, TILE - 8, TILE - 8);
  });
}

function drawGuardians() {
  const allSeeds = state.seeds.every((seed) => seed.collected);
  state.guardians.forEach((guardian) => {
    const x = guardian.x * TILE;
    const y = guardian.y * TILE;
    ctx.globalAlpha = allSeeds ? 0.35 : 1;
    ctx.fillStyle = "#7b5dc8";
    ctx.beginPath();
    ctx.arc(x, y, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff8c8";
    ctx.beginPath();
    ctx.arc(x - 5, y - 4, 3, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 4, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawFireflies() {
  if (!levels[levelIndex]?.fireflies) return;
  const target = findHintTarget() || state.exit;
  for (let i = 0; i < 7; i++) {
    const t = (i + 1) / 8;
    const wobble = Math.sin(sparkle * 3 + i) * 7;
    const x = (state.player.x + (target.x - state.player.x) * t) * TILE + wobble;
    const y = (state.player.y + (target.y - state.player.y) * t) * TILE + Math.cos(sparkle * 2 + i) * 6;
    ctx.fillStyle = `rgba(255, 232, 120, ${0.35 + 0.28 * Math.sin(sparkle * 5 + i)})`;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
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
  const ready = allSeeds && (!state.key || state.hasKey) && allSwitchesActivated();
  
  ctx.fillStyle = ready ? `rgba(255, 215, 105, ${0.5 + Math.sin(sparkle * 5) * 0.2})` : "rgba(120, 132, 150, 0.28)";
  ctx.beginPath();
  ctx.arc(x, y, 24, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = ready ? "#fff8c8" : "rgba(255, 255, 255, 0.56)";
  ctx.beginPath();
  ctx.arc(x, y, 11, 0, Math.PI * 2);
  ctx.fill();
}

function drawDoor() {
  if (!state.door) return;
  const lockedByKey = state.key && !state.hasKey;
  const lockedBySwitch = !allSwitchesActivated();
  if (!lockedByKey && !lockedBySwitch) return;
  const x = state.door.x * TILE;
  const y = state.door.y * TILE;
  ctx.fillStyle = "#7b5dc8";
  ctx.fillRect(x + 5, y + 5, TILE - 10, TILE - 10);
}

function drawSeeds() {
  state.seeds.forEach((seed) => {
    if (seed.collected) return;
    const x = seed.x * TILE;
    const drift = levels[levelIndex]?.stormSeeds ? Math.sin(sparkle * 2 + seed.x) * 5 : 0;
    const y = seed.y * TILE + Math.sin(sparkle * 4 + seed.x) * 3 + drift;
    
    ctx.fillStyle = seed.locked && !allSwitchesActivated() ? "#b8d4e8" : "#f2b83d";
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
  
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 117, 140, 0.3)";
  ctx.fill();

  // Lantern glow
  ctx.beginPath();
  ctx.arc(x + 14, y + 2, 9 + Math.sin(sparkle * 8) * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 223, 118, 0.45)";
  ctx.fill();
  ctx.strokeStyle = "rgba(104, 79, 55, 0.65)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + 7, y - 4);
  ctx.lineTo(x + 14, y + 2);
  ctx.stroke();

  // Dress
  ctx.fillStyle = "#ff758c";
  ctx.beginPath();
  ctx.moveTo(x, y - 3);
  ctx.lineTo(x - 12, y + 14);
  ctx.lineTo(x + 12, y + 14);
  ctx.closePath();
  ctx.fill();

  // Head and hair
  ctx.fillStyle = "#ffd3bd";
  ctx.beginPath();
  ctx.arc(x, y - 12, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a3825";
  ctx.beginPath();
  ctx.arc(x, y - 15, 10, Math.PI, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(x - 9, y - 14, 18, 5);

  // Arms and legs
  ctx.strokeStyle = "#6b3f2f";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - 7, y + 2);
  ctx.lineTo(x - 14, y + 8);
  ctx.moveTo(x + 7, y + 2);
  ctx.lineTo(x + 13, y + 4);
  ctx.moveTo(x - 5, y + 14);
  ctx.lineTo(x - 5, y + 20);
  ctx.moveTo(x + 5, y + 14);
  ctx.lineTo(x + 5, y + 20);
  ctx.stroke();

  ctx.fillStyle = "#243044";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Iris", x, y - 25);
  
  ctx.globalAlpha = 1;
}

function drawPlayer2() {
  const x = state.player2.x * TILE;
  const y = state.player2.y * TILE;
  
  ctx.globalAlpha = state.player2.invincible > 0 && Math.floor(sparkle * 12) % 2 === 0 ? 0.55 : 1;
  
  ctx.beginPath();
  ctx.arc(x, y, 18, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(123, 93, 200, 0.3)";
  ctx.fill();

  // Tail
  ctx.strokeStyle = "#6f5a8f";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 10, y + 6);
  ctx.quadraticCurveTo(x + 23, y - 6, x + 12, y - 16 + Math.sin(sparkle * 8) * 2);
  ctx.stroke();

  // Cat body
  ctx.fillStyle = "#7b5dc8";
  ctx.beginPath();
  ctx.ellipse(x, y + 5, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Cat head
  ctx.beginPath();
  ctx.arc(x, y - 7, 10, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(x - 8, y - 14);
  ctx.lineTo(x - 12, y - 24);
  ctx.lineTo(x - 2, y - 17);
  ctx.closePath();
  ctx.moveTo(x + 8, y - 14);
  ctx.lineTo(x + 12, y - 24);
  ctx.lineTo(x + 2, y - 17);
  ctx.closePath();
  ctx.fill();

  // Face
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(x - 3.5, y - 9, 1.8, 0, Math.PI * 2);
  ctx.arc(x + 3.5, y - 9, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd6e5";
  ctx.beginPath();
  ctx.arc(x, y - 4, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x - 3, y - 3);
  ctx.lineTo(x - 13, y - 6);
  ctx.moveTo(x - 3, y);
  ctx.lineTo(x - 13, y + 1);
  ctx.moveTo(x + 3, y - 3);
  ctx.lineTo(x + 13, y - 6);
  ctx.moveTo(x + 3, y);
  ctx.lineTo(x + 13, y + 1);
  ctx.stroke();

  ctx.fillStyle = "#243044";
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Luna", x, y - 29);
  
  ctx.globalAlpha = 1;
}

function drawHintPath() {
    if (!showHintPath || hintTimer <= 0) return;
    const target = findHintTarget();
    if (!target) return;
    ctx.strokeStyle = "rgba(255, 215, 105, 0.58)";
    ctx.lineWidth = 5;
    ctx.setLineDash([5, 8]);
    ctx.beginPath();
    ctx.moveTo(state.player.x * TILE, state.player.y * TILE);
    ctx.lineTo(target.x * TILE, target.y * TILE);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(255, 248, 200, 0.85)";
    ctx.beginPath();
    ctx.arc(target.x * TILE, target.y * TILE, 15 + Math.sin(sparkle * 8) * 3, 0, Math.PI * 2);
    ctx.fill();
}

function findHintTarget() {
  if (state.key && !state.hasKey) return state.key;
  const inactiveSwitch = state.switches.find((sw) => !sw.activated);
  const hasLockedSeed = state.seeds.some((seed) => !seed.collected && seed.locked);
  if (inactiveSwitch && (hasLockedSeed || state.bridges.length)) return inactiveSwitch;
  let nearest = null;
  let minDist = Infinity;
  state.seeds.forEach((seed) => {
    if (!seed.collected && !(seed.locked && !allSwitchesActivated())) {
      const d = distance(seed, state.player);
      if (d < minDist) {
        minDist = d;
        nearest = seed;
      }
    }
  });
  if (nearest) return nearest;
  return state.exit;
}

// --- Event Listeners ---

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  // Prevent scrolling for arrow keys and space (and for WASD while playing)
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
    event.preventDefault();
  } else if (running && ["w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }
  keys.add(key);
  if (key === " " && running) {
    paused = !paused;
    els.pause.textContent = paused ? i18n[currentLang].pauseBtnActive : i18n[currentLang].pauseBtn;
  }
});

window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));

els.start.addEventListener("click", () => {
  // Start Adventure always begins a fresh game from level 1
  localStorage.removeItem("moonGardenProgress");
  levelIndex = 0;
  startGame(0);
  updateContinueButton();
});

els.restart.addEventListener("click", () => {
    startGame(levelIndex);
    handleRestartAssist();
});

els.pause.addEventListener("click", () => {
    if (!running) return;
    paused = !paused;
    els.pause.textContent = paused ? i18n[currentLang].pauseBtnActive : i18n[currentLang].pauseBtn;
});

els.help.addEventListener("click", () => {
    triggerPathHint(livesLostThisLevel >= 3 ? 6 : 3);
});

if (els.magicHelp) els.magicHelp.addEventListener("click", () => showMagicHelp(els.magicPanel.hidden));
if (els.magicHeart1) els.magicHeart1.addEventListener("click", () => addHearts(1, "add1"));
if (els.magicHeart3) els.magicHeart3.addEventListener("click", () => addHearts(3, "add3"));
if (els.magicSlow) els.magicSlow.addEventListener("click", () => {
  levelAssist.slow = true;
  showToast(i18n[currentLang].magicSlowToast, 1.7);
});
if (els.magicPath) els.magicPath.addEventListener("click", () => triggerPathHint(6));
if (els.magicSkip) els.magicSkip.addEventListener("click", skipLevel);
if (els.magicCozy) els.magicCozy.addEventListener("click", () => {
  levelAssist.cozyAssist = true;
  difficultyMode = "cozy";
  cozyMode = true;
  MAX_HEARTS = Math.max(MAX_HEARTS, difficultySettings.cozy.hearts);
  hearts = Math.max(hearts, MAX_HEARTS);
  writeSave({ difficulty: "cozy", cozyMode: true });
  updateDifficultyUI();
  updateHud();
  showToast(i18n[currentLang].magicCozyToast, 1.7);
});

els.muteBtn.addEventListener("click", () => {
    const muted = soundManager.toggleMute();
    writeSave({ muted });
    els.muteBtn.textContent = muted ? "🔇" : "🔊";
});

els.langBtn.addEventListener("click", () => {
    switchLanguage(currentLang === "zh" ? "en" : "zh");
});

// D-Pad
document.querySelectorAll(".pad button").forEach((button) => {
  const map = { up: "arrowup", down: "arrowdown", left: "arrowleft", right: "arrowright" };
  const key = map[button.dataset.dir];
  button.addEventListener("pointerdown", () => keys.add(key));
  button.addEventListener("pointerup", () => keys.delete(key));
  button.addEventListener("pointerleave", () => keys.delete(key));
});

els.continue.addEventListener("click", () => {
    const progress = readSave().unlockedLevel;
    if (progress > 1 && progress <= levels.length) startGame(progress - 1);
});

document.querySelector("#playAgainBtn").addEventListener("click", () => {
    hideEndOverlay();
    localStorage.removeItem("moonGardenProgress");
    updateContinueButton();
    startGame(0);
});

document.querySelector("#showStickersBtn").addEventListener("click", () => {
    renderStickerBook();
    if (els.stickerContainer) els.stickerContainer.scrollIntoView({ behavior: "smooth", block: "center" });
});

if (els.levelMap) {
  els.levelMap.addEventListener("click", () => {
    hideEndOverlay();
    running = false;
    els.overlay.classList.remove("hidden");
    updateContinueButton();
    populateLevelSelector();
  });
}

if (els.endLang) els.endLang.addEventListener("click", () => switchLanguage(currentLang === "zh" ? "en" : "zh"));

function setDifficulty(mode) {
  if (mode === "challenge" && !challengeUnlocked()) {
    showToast(i18n[currentLang].challengeLockedToast, 2);
    return;
  }
  difficultyMode = mode;
  cozyMode = mode === "cozy";
  writeSave({ difficulty: mode, cozyMode });
  updateDifficultyUI();
}

if (els.modeCozy) els.modeCozy.addEventListener("click", () => setDifficulty("cozy"));
if (els.modeAdventure) els.modeAdventure.addEventListener("click", () => setDifficulty("adventure"));
if (els.modeChallenge) els.modeChallenge.addEventListener("click", () => setDifficulty("challenge"));

function renderStickerBook() {
  if (!els.stickerContainer) return;
  els.stickerContainer.innerHTML = "";
  els.stickerContainer.hidden = false;
  const save = readSave();
  const progress = document.createElement("div");
  progress.className = "pill";
  progress.style.background = "#fff";
  progress.style.color = "#243044";
  progress.textContent = tt("flowersFound", { n: countFoundFlowers(), total: levels.length });
  els.stickerContainer.appendChild(progress);
  levels.forEach((lvl, idx) => {
    const unlocked = save.stickers?.[idx + 1] || localStorage.getItem("moonGardenSticker_" + idx);
    const stickerEl = document.createElement("div");
    stickerEl.className = "pill";
    stickerEl.style.background = unlocked ? "#e0aaff" : "#eee";
    stickerEl.style.color = unlocked ? "#fff" : "#999";
    stickerEl.style.filter = unlocked ? "none" : "grayscale(1)";
    stickerEl.textContent = unlocked ? `⭐ ${lvl.sticker}` : "🌑";
    stickerEl.title = unlocked ? lvl.sticker : "???";
    els.stickerContainer.appendChild(stickerEl);
  });
}

document.querySelector("#coopModeBtn").addEventListener("click", () => {
  coopMode = !coopMode;
  updateModeUI();
  updateSeedsDisplay();
  if (running) {
    if (coopMode) {
      const px = Math.floor(state.player.x);
      const py = Math.floor(state.player.y);
      state.player2.x = px + 1.5;
      state.player2.y = py + 0.5;
      state.player2.invincible = 1;
      state.player2.score = 0;
      showToast(i18n[currentLang].hintCoop, 2);
    } else {
      showToast(i18n[currentLang].hintSolo, 1.6);
    }
  }
});

function populateLevelSelector() {
    const selector = els.levelSelector;
    if (!selector) return;
    selector.innerHTML = "";
    const save = readSave();
    selector.style.display = "grid";
    selector.style.gridTemplateColumns = "1fr";
    selector.style.gap = "12px";
    selector.style.maxWidth = "560px";
    chapterMeta.forEach((chapter) => {
      const group = document.createElement("div");
      group.style.border = "1px solid #ddd1c0";
      group.style.borderRadius = "8px";
      group.style.padding = "10px";
      group.style.background = "rgba(255,255,255,0.72)";

      const heading = document.createElement("div");
      heading.textContent = tt(chapter.key);
      heading.style.fontWeight = "900";
      heading.style.color = "#243044";
      heading.style.marginBottom = "8px";
      group.appendChild(heading);

      const grid = document.createElement("div");
      grid.style.display = "grid";
      grid.style.gridTemplateColumns = "repeat(6, minmax(0, 1fr))";
      grid.style.gap = "8px";

      for (let idx = chapter.start; idx <= chapter.end; idx++) {
        const lvl = levels[idx];
        const btn = document.createElement("button");
        btn.type = "button";
        const levelNumber = idx + 1;
        const locked = levelNumber > (save.unlockedLevel || 1);
        const stars = Number(save.bestStars?.[levelNumber] || 0);
        const flower = save.flowers?.[levelNumber] || localStorage.getItem("moonGardenFlower_" + idx);
        btn.innerHTML = locked
          ? `<strong>${levelNumber}</strong><span>🔒</span>`
          : `<strong>${levelNumber}</strong><span>${"⭐".repeat(stars)}${"☆".repeat(3 - stars)}</span><span>${flower ? "🌸" : "◇"}</span>`;
        btn.style.cursor = "pointer";
        btn.style.background = locked ? "#eee" : "#fff";
        btn.style.border = "1px solid #ddd1c0";
        btn.style.color = "#243044";
        btn.style.borderRadius = "8px";
        btn.style.minHeight = "56px";
        btn.style.padding = "4px";
        btn.style.display = "grid";
        btn.style.placeItems = "center";
        btn.style.gap = "1px";
        btn.style.fontWeight = "bold";
        btn.style.fontSize = "0.72rem";
        btn.style.boxShadow = "none";
        btn.title = lvl.names[currentLang];
        btn.disabled = locked;
        btn.style.opacity = locked ? "0.58" : "1";
        btn.addEventListener("click", () => {
          if (!locked) startGame(idx);
        });
        grid.appendChild(btn);
      }
      group.appendChild(grid);
      selector.appendChild(group);
    });
}

// Init
hideCompleteOverlay();
hideEndOverlay();
const initialSave = readSave();
difficultyMode = initialSave.difficulty || (initialSave.cozyMode ? "cozy" : "adventure");
if (difficultyMode === "challenge" && !challengeUnlocked()) difficultyMode = "cozy";
cozyMode = difficultyMode === "cozy";
soundManager.muted = initialSave.muted !== undefined ? initialSave.muted : true;
if (els.muteBtn) els.muteBtn.textContent = soundManager.muted ? "🔇" : "🔊";
switchLanguage("en");
updateContinueButton();
populateLevelSelector();
draw();
