/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Web Audio API Synthesizer - 100% self-contained, no external asset dependencies
class SoundFXManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicInterval: number | null = null;
  private step = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain.connect(this.ctx.destination);
        this.musicGain.connect(this.ctx.destination);
        this.sfxGain.gain.value = 0.3;
        this.musicGain.gain.value = 0.12;
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(vol: number) {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, vol * 0.35));
    }
    if (this.musicGain) {
      this.musicGain.gain.value = Math.max(0, Math.min(1, vol * 0.15));
    }
  }

  // Gunshot: Transient click + shaped noise burst + body punch
  public playGunshot() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;

      // Noise buffer for blast
      const bufferSize = this.ctx.sampleRate * 0.15;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      // Filter for deep gunshot explosion sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.15);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

      whiteNoise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.sfxGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 0.15);

      // Low frequency punch oscillator
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.1);

      oscGain.gain.setValueAtTime(0.7, t);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

      osc.connect(oscGain);
      oscGain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Hit impact: punchy thud
  public playHit() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // ignore
    }
  }

  // 1 Point chime: High pitched rewarding ding
  public playPointChime(combo = 1) {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;

      const baseFreq = 587.33; // D5
      const noteFreq = baseFreq * Math.pow(1.059463, Math.min(12, combo * 2));

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(noteFreq, t);
      osc.frequency.setValueAtTime(noteFreq * 1.5, t + 0.04);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.22);
    } catch {
      // ignore
    }
  }

  // Reload action sound: mechanical slide click
  public playReload() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;

      // Click 1 (mag out)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'square';
      osc1.frequency.setValueAtTime(800, t);
      gain1.gain.setValueAtTime(0.2, t);
      gain1.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      osc1.connect(gain1);
      gain1.connect(this.sfxGain);
      osc1.start(t);
      osc1.stop(t + 0.05);

      // Click 2 (mag in & rack)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1400, t + 0.2);
      gain2.gain.setValueAtTime(0.3, t + 0.2);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(t + 0.2);
      osc2.stop(t + 0.28);
    } catch {
      // ignore
    }
  }

  // Empty magazine click
  public playEmptyClick() {
    try {
      this.initContext();
      if (!this.ctx || !this.sfxGain) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'highpass' as unknown as OscillatorType;
      osc.frequency.setValueAtTime(2400, t);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.03);
      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.03);
    } catch {
      // ignore
    }
  }

  // Retro synthwave procedural background music loop
  public startMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    this.isMusicPlaying = true;
    this.step = 0;

    const bassline = [110, 110, 130.81, 146.83, 110, 98, 110, 164.81]; // A2, C3, D3, G2, E3
    const leadNotes = [440, 523.25, 659.25, 587.33, 440, 783.99, 659.25, 523.25];

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.isMusicPlaying) return;
      const t = this.ctx.currentTime;

      // Bass note
      const bassFreq = bassline[this.step % bassline.length];
      const bassOsc = this.ctx.createOscillator();
      const bassEnv = this.ctx.createGain();
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.setValueAtTime(bassFreq / 2, t);

      bassEnv.gain.setValueAtTime(0.15, t);
      bassEnv.gain.exponentialRampToValueAtTime(0.005, t + 0.25);

      bassOsc.connect(bassEnv);
      bassEnv.connect(this.musicGain);
      bassOsc.start(t);
      bassOsc.stop(t + 0.25);

      // Lead note every other beat
      if (this.step % 2 === 0) {
        const leadFreq = leadNotes[(this.step / 2) % leadNotes.length];
        const leadOsc = this.ctx.createOscillator();
        const leadEnv = this.ctx.createGain();
        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(leadFreq, t);

        leadEnv.gain.setValueAtTime(0.08, t);
        leadEnv.gain.exponentialRampToValueAtTime(0.002, t + 0.35);

        leadOsc.connect(leadEnv);
        leadEnv.connect(this.musicGain);
        leadOsc.start(t);
        leadOsc.stop(t + 0.35);
      }

      this.step++;
    }, 240);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public toggleMusic(enable: boolean) {
    if (enable) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }
}

export const soundManager = new SoundFXManager();
