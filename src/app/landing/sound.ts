/**
 * Landing sound design, synthesised with Web Audio (no files). Browsers only
 * allow audio after a gesture, so `unlock()` runs from the intro gate's click.
 *
 *   tick()       UI blip for hovers
 *   click()      press feedback for every button, link and tab
 *   intro()      the landing: sub swell, rising air, particles settling L/R
 *   touch()      the spark between the fingertips: low bloom + bell chord
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let verb: ConvolverNode | null = null;
let enabled = false;
let clickNoise: AudioBuffer | null = null;

const KEY = 'nk-landing-sound';

export const sound = {
  get enabled() {
    return enabled;
  },
  /** Last choice, so the gate can preselect it. */
  get preferred() {
    try {
      return localStorage.getItem(KEY) !== 'off';
    } catch {
      return true;
    }
  },

  unlock(on: boolean) {
    enabled = on;
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off');
    } catch {
      /* private mode */
    }
    if (!on) return;
    if (!ctx) {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.7;
      const comp = ctx.createDynamicsCompressor();
      master.connect(comp).connect(ctx.destination);
      verb = ctx.createConvolver();
      verb.buffer = impulse(ctx, 3.2);
      const wet = ctx.createGain();
      wet.gain.value = 0.35;
      verb.connect(wet).connect(master);
    }
    void ctx.resume();
  },

  setEnabled(on: boolean) {
    if (on && !ctx) return this.unlock(true);
    enabled = on;
    try {
      localStorage.setItem(KEY, on ? 'on' : 'off');
    } catch {
      /* private mode */
    }
    if (master && ctx) master.gain.setTargetAtTime(on ? 0.7 : 0, ctx.currentTime, 0.05);
  },

  tick(pitch = 1) {
    const a = ready();
    if (!a) return;
    const [c, now] = a;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1900 * pitch, now);
    o.frequency.exponentialRampToValueAtTime(900 * pitch, now + 0.05);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.05, now + 0.004);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
    o.connect(g).connect(master!);
    o.start(now);
    o.stop(now + 0.1);
  },

  click() {
    const a = ready();
    if (!a) return;
    const [c, now] = a;
    // body: a short, falling sine thump
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(540, now);
    o.frequency.exponentialRampToValueAtTime(170, now + 0.06);
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.16, now + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    o.connect(g).connect(master!);
    o.start(now);
    o.stop(now + 0.12);
    // transient: a tick of high-passed noise
    const n = c.createBufferSource();
    n.buffer = clickNoise ??= noise(c, 0.03);
    const hp = c.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 3200;
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.1, now);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
    n.connect(hp).connect(ng).connect(master!);
    n.start(now);
  },

  intro(duration = 2.4) {
    const a = ready();
    if (!a) return;
    const [c, now] = a;

    // sub swell
    const sub = c.createOscillator();
    const sg = c.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(48, now);
    sub.frequency.linearRampToValueAtTime(62, now + duration);
    sg.gain.setValueAtTime(0.0001, now);
    sg.gain.exponentialRampToValueAtTime(0.35, now + duration * 0.8);
    sg.gain.exponentialRampToValueAtTime(0.0001, now + duration + 1.2);
    sub.connect(sg).connect(master!);
    sub.start(now);
    sub.stop(now + duration + 1.3);

    // rising air: band-passed noise sweeping up
    const n = c.createBufferSource();
    n.buffer = noise(c, duration + 0.6);
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(260, now);
    bp.frequency.exponentialRampToValueAtTime(3200, now + duration);
    const ng = c.createGain();
    ng.gain.setValueAtTime(0.0001, now);
    ng.gain.exponentialRampToValueAtTime(0.22, now + duration * 0.85);
    ng.gain.exponentialRampToValueAtTime(0.0001, now + duration + 0.4);
    n.connect(bp).connect(ng);
    ng.connect(master!);
    ng.connect(verb!);
    n.start(now);

    // particles settling: tiny glassy blips, panned to the hand they land on
    for (let i = 0; i < 46; i++) {
      const at = now + 0.2 + Math.pow(Math.random(), 0.7) * (duration - 0.3);
      const o = c.createOscillator();
      const g = c.createGain();
      const p = c.createStereoPanner();
      o.type = 'triangle';
      o.frequency.value = 2200 + Math.random() * 3600;
      p.pan.value = Math.random() < 0.5 ? -0.4 - Math.random() * 0.5 : 0.4 + Math.random() * 0.5;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.018 + Math.random() * 0.02, at + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.06 + Math.random() * 0.08);
      o.connect(g).connect(p);
      p.connect(master!);
      p.connect(verb!);
      o.start(at);
      o.stop(at + 0.2);
    }
  },

  touch(delay = 0) {
    const a = ready();
    if (!a) return;
    const [c, t0] = a;
    const now = t0 + delay;

    // low bloom: a pitch-dropping sine
    const b = c.createOscillator();
    const bg = c.createGain();
    b.type = 'sine';
    b.frequency.setValueAtTime(110, now);
    b.frequency.exponentialRampToValueAtTime(42, now + 1.4);
    bg.gain.setValueAtTime(0.0001, now);
    bg.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
    bg.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    b.connect(bg).connect(master!);
    b.start(now);
    b.stop(now + 2);

    // bell chord (C major add9, spread), slightly detuned, into the room
    [523.25, 659.25, 783.99, 1174.66, 1567.98].forEach((f, i) => {
      for (const det of [-4, 5]) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = i < 2 ? 'sine' : 'triangle';
        o.frequency.value = f;
        o.detune.value = det;
        const at = now + i * 0.045;
        g.gain.setValueAtTime(0.0001, at);
        g.gain.exponentialRampToValueAtTime(0.045 / (1 + i * 0.4), at + 0.012);
        g.gain.exponentialRampToValueAtTime(0.0001, at + 3.6 - i * 0.3);
        o.connect(g);
        g.connect(master!);
        g.connect(verb!);
        o.start(at);
        o.stop(at + 4);
      }
    });
  },
};

function ready(): [AudioContext, number] | null {
  if (!enabled || !ctx || !master || ctx.state === 'closed') return null;
  return [ctx, ctx.currentTime + 0.01];
}

function noise(c: AudioContext, seconds: number) {
  const b = c.createBuffer(1, Math.ceil(c.sampleRate * seconds), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function impulse(c: AudioContext, seconds: number) {
  const len = Math.ceil(c.sampleRate * seconds);
  const b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  return b;
}
