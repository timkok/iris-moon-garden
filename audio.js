class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = false;
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.enabled = true;
            console.log("Audio initialized");
        } catch (e) {
            console.warn("Web Audio API not supported");
        }
    }

    // High pitched chime for collecting seeds
    playCollect() {
        if (!this.enabled) return;
        this.init(); // Ensure initialized on user interaction
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, this.ctx.currentTime + 0.1); // A6
        
        gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    // Low thud for getting hit
    playHit() {
        if (!this.enabled) return;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(50, this.ctx.currentTime + 0.2);
        
        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.3);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    // Fanfare for level complete
    playWin() {
        if (!this.enabled) return;
        this.init();
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + i * 0.1);
            
            gain.gain.setValueAtTime(0.1, now + i * 0.1);
            gain.gain.linearRampToValueAtTime(0, now + i * 0.1 + 0.2);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start(now + i * 0.1);
            osc.stop(now + i * 0.1 + 0.2);
        });
    }

    // Soft chime for heart refill
    playRefill() {
        if (!this.enabled) return;
        this.init();
        
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
        osc.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.2); // E6
        
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }
    
    // Simple ambient loop
    playMusic() {
        if (!this.enabled) return;
        this.init();
        
        // This is a very simple sequence of notes
        const melody = [440, 493.88, 523.25, 587.33]; // A4, B4, C5, D5
        let index = 0;
        
        const playNote = () => {
            if (!this.enabled) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(melody[index], this.ctx.currentTime);
            
            gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.5);
            
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            
            osc.start();
            osc.stop(this.ctx.currentTime + 1.5);
            
            index = (index + 1) % melody.length;
            setTimeout(playNote, 2000);
        };
        
        playNote();
    }
}

const soundManager = new SoundManager();
window.soundManager = soundManager; // Make it global
