/**
 * audio.ts — Web Audio 合成音效（零外部文件，参考 audio-engine.js 思路重写）
 */
"use client";

type Cue = "click" | "slide" | "event" | "achieve" | "play" | "warning" | "ending" | "coin";

class AudioEngine {
  private ctx: AudioContext | null = null;
  enabled = true;

  constructor() {
    if (typeof window !== "undefined") {
      this.enabled = localStorage.getItem("crf.v1.audio") !== "0";
    }
  }

  toggle(): boolean {
    this.enabled = !this.enabled;
    try { localStorage.setItem("crf.v1.audio", this.enabled ? "1" : "0"); } catch {}
    if (this.enabled) this.play("click");
    return this.enabled;
  }

  private ensure(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  /** 合成一个音符 */
  private tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0) {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  play(cue: Cue) {
    if (!this.enabled) return;
    switch (cue) {
      case "click": this.tone(660, 0.07, "triangle", 0.05); break;
      case "slide": this.tone(440, 0.04, "sine", 0.025); break;
      case "event": this.tone(523, 0.12, "triangle", 0.06); this.tone(784, 0.16, "triangle", 0.05, 0.1); break;
      case "achieve": [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, "triangle", 0.06, i * 0.11)); break;
      case "play": this.tone(330, 0.1, "sine", 0.05); this.tone(494, 0.12, "sine", 0.04, 0.08); break;
      case "warning": this.tone(233, 0.22, "sawtooth", 0.05); this.tone(220, 0.26, "sawtooth", 0.04, 0.2); break;
      case "coin": this.tone(988, 0.06, "square", 0.035); this.tone(1319, 0.1, "square", 0.03, 0.06); break;
      case "ending":
        [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.3, "triangle", 0.05, i * 0.22));
        break;
    }
  }
}

export const audio = new AudioEngine();
