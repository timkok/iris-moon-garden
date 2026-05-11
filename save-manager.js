class SaveManager {
  constructor() {
    this.key = "iris-moon-garden:v1";
    this.version = 1;
    this.defaults = {
      version: this.version,
      unlockedLevel: 1,
      bestTimes: {},
      bestStars: {},
      muted: false,
      cozyMode: false,
      language: "en",
    };
  }

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return { ...this.defaults };
      const data = JSON.parse(raw);
      return { ...this.defaults, ...data, version: this.version };
    } catch (error) {
      console.warn("Save data could not be read.", error);
      return { ...this.defaults };
    }
  }

  save(patch) {
    const next = { ...this.load(), ...patch, version: this.version };
    localStorage.setItem(this.key, JSON.stringify(next));
    return next;
  }

  updateLevel(levelNumber, seconds, stars) {
    const data = this.load();
    const key = String(levelNumber);
    const bestTime = data.bestTimes[key];
    data.unlockedLevel = Math.max(data.unlockedLevel, levelNumber + 1);
    data.bestTimes[key] = bestTime ? Math.min(bestTime, Math.round(seconds)) : Math.round(seconds);
    data.bestStars[key] = Math.max(data.bestStars[key] || 0, stars);
    return this.save(data);
  }
}

window.saveManager = new SaveManager();
