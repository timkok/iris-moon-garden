class AudioManager {
  constructor() {
    this.muted = window.saveManager?.load().muted || localStorage.getItem("iris-moon-garden:v1:muted") === "true";
    this.unlocked = false;
    this.context = null;
    this.buffers = new Map();
    this.bgmSource = null;
    this.gain = null;
    this.files = {
      collectSeed: "./assets/audio/collect_seed.mp3",
      collectHeart: "./assets/audio/collect_heart.mp3",
      hurt: "./assets/audio/hurt.mp3",
      win: "./assets/audio/win.mp3",
      doorOpen: "./assets/audio/door_open.mp3",
      bgm: "./assets/audio/bgm.mp3",
    };
  }

  async unlock() {
    if (this.unlocked) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.context = new AudioContext();
    this.gain = this.context.createGain();
    this.gain.gain.value = this.muted ? 0 : 0.72;
    this.gain.connect(this.context.destination);
    await this.context.resume();
    this.unlocked = true;
    this.preload();
  }

  preload() {
    Object.entries(this.files).forEach(([name, url]) => this.load(name, url));
  }

  async load(name, url) {
    if (!this.context || this.buffers.has(name)) return;
    try {
      const response = await fetch(url);
      const data = await response.arrayBuffer();
      const buffer = await this.context.decodeAudioData(data);
      this.buffers.set(name, buffer);
      if (name === "bgm") this.startBgm();
    } catch (error) {
      console.warn(`Audio failed to load: ${name}`, error);
    }
  }

  play(name, options = {}) {
    if (this.muted || !this.context || !this.buffers.has(name)) return;
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    source.buffer = this.buffers.get(name);
    source.playbackRate.value = options.rate || 1;
    gain.gain.value = options.volume ?? 0.85;
    source.connect(gain);
    gain.connect(this.gain);
    source.start();
  }

  startBgm() {
    if (this.bgmSource || this.muted || !this.context || !this.buffers.has("bgm")) return;
    this.bgmSource = this.context.createBufferSource();
    const bgmGain = this.context.createGain();
    this.bgmSource.buffer = this.buffers.get("bgm");
    this.bgmSource.loop = true;
    bgmGain.gain.value = 0.26;
    this.bgmSource.connect(bgmGain);
    bgmGain.connect(this.gain);
    this.bgmSource.start();
    this.bgmSource.onended = () => {
      this.bgmSource = null;
    };
  }

  setMuted(muted) {
    this.muted = muted;
    window.saveManager?.save({ muted });
    localStorage.setItem("iris-moon-garden:v1:muted", String(muted));
    if (this.gain) this.gain.gain.value = muted ? 0 : 0.72;
    if (!muted) this.startBgm();
  }

  toggleMuted() {
    this.setMuted(!this.muted);
    return this.muted;
  }
}

window.audioManager = new AudioManager();
