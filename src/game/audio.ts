let ctx: AudioContext | null = null;
let drone: { osc: OscillatorNode; gain: GainNode } | null = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  if (!ctx || !drone) return;
  drone.gain.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.05);
}

export function unlockAudio() {
  if (typeof window === "undefined") return;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
}

export function resumeAudio() {
  if (ctx && ctx.state === "suspended") void ctx.resume();
}

function envGain(peak: number, dur: number) {
  if (!ctx) return null;
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  gain.connect(ctx.destination);
  return gain;
}

export function playCollect(combo: number) {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = envGain(0.07, 0.18);
  if (!gain) return;
  osc.type = "triangle";
  const base = 480 + Math.min(combo, 8) * 36;
  osc.frequency.setValueAtTime(base, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(base * 1.7, ctx.currentTime + 0.12);
  osc.connect(gain);
  osc.start();
  osc.stop(ctx.currentTime + 0.2);
}

export function playHit() {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = envGain(0.09, 0.28);
  if (!gain) return;
  osc.type = "sine";
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + 0.26);
  osc.connect(gain);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export function playOver() {
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = envGain(0.06, 0.45);
  if (!gain) return;
  osc.type = "triangle";
  osc.frequency.setValueAtTime(320, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.4);
  osc.connect(gain);
  osc.start();
  osc.stop(ctx.currentTime + 0.46);
}

export function engine(speed: number, active: boolean) {
  if (!ctx) return;
  if (!drone) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 72;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    drone = { osc, gain };
  }
  const vol = !muted && active ? Math.min(0.045, 0.008 + Math.abs(speed) * 0.002) : 0.0001;
  drone.gain.gain.setTargetAtTime(Math.max(0.0001, vol), ctx.currentTime, 0.08);
  drone.osc.frequency.setTargetAtTime(68 + Math.abs(speed) * 2.4, ctx.currentTime, 0.08);
}
