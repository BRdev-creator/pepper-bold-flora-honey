import { engine, playCollect, playHit, playOver } from "@/game/audio";

export type Phase = "menu" | "playing" | "paused" | "over";
export type EndReason = "time" | "caught" | null;

export type Mote = { id: number; x: number; z: number; phase: number };
export type Pillar = { x: number; z: number; r: number; h: number };
export type Spark = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
};

export const ARENA = 20.4;
export const SPARK_COUNT = 40;
export const ROUND_SECONDS = 75;

export const PILLARS: Pillar[] = [
  { x: 8, z: -4, r: 1.15, h: 2.4 },
  { x: -7, z: 6, r: 1.3, h: 3.2 },
  { x: -10, z: -8, r: 1.05, h: 1.9 },
  { x: 12, z: 9, r: 1.4, h: 2.7 },
  { x: 3, z: 12, r: 0.95, h: 1.6 },
  { x: -14, z: 1, r: 1.2, h: 3.0 },
  { x: 15, z: -7, r: 1.1, h: 2.1 },
  { x: -3, z: -13, r: 1.35, h: 3.5 },
  { x: 6, z: 5, r: 0.85, h: 1.5 },
];

const SAVE_KEY = "lumen-drift-v1";

export const sparks: Spark[] = Array.from({ length: SPARK_COUNT }, () => ({
  x: 0,
  y: -8,
  z: 0,
  vx: 0,
  vy: 0,
  vz: 0,
  life: 0,
}));

export type Sim = {
  phase: Phase;
  endReason: EndReason;
  yaw: number;
  bank: number;
  x: number;
  z: number;
  speed: number;
  score: number;
  combo: number;
  comboTimer: number;
  lives: number;
  timeLeft: number;
  invuln: number;
  hitstop: number;
  trauma: number;
  flash: number;
  wispX: number;
  wispZ: number;
  floatText: string;
  floatLife: number;
  best: number;
  isNewBest: boolean;
  shake: boolean;
  motes: Mote[];
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function initialMotes(): Mote[] {
  const spots = [
    { x: -6, z: -2 },
    { x: 9, z: 2 },
    { x: -2, z: 9 },
    { x: 4, z: -9 },
    { x: -11, z: 8 },
    { x: 11, z: -11 },
  ];
  return spots.map((p, id) => ({ id, x: p.x, z: p.z, phase: id * 0.8 }));
}

export const sim: Sim = {
  phase: "menu",
  endReason: null,
  yaw: 0,
  bank: 0,
  x: 0,
  z: 10,
  speed: 0,
  score: 0,
  combo: 0,
  comboTimer: 0,
  lives: 3,
  timeLeft: ROUND_SECONDS,
  invuln: 0,
  hitstop: 0,
  trauma: 0,
  flash: 0,
  wispX: 14,
  wispZ: -14,
  floatText: "",
  floatLife: 0,
  best: 0,
  isNewBest: false,
  shake: true,
  motes: initialMotes(),
};

let rev = 0;
const listeners = new Set<() => void>();

export function subscribeHud(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getHudRev() {
  return rev;
}

export function pokeHud() {
  rev += 1;
  for (const fn of listeners) fn();
}

export function loadBest() {
  if (typeof localStorage === "undefined") return 0;
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as { version?: number; best?: number };
    if (data.version !== 1 || typeof data.best !== "number" || !Number.isFinite(data.best)) return 0;
    return Math.max(0, Math.floor(data.best));
  } catch {
    return 0;
  }
}

function saveBest(n: number) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, best: n }));
}

function burst(x: number, y: number, z: number, lift: number) {
  let spawned = 0;
  for (const spark of sparks) {
    if (spark.life > 0) continue;
    const a = Math.random() * Math.PI * 2;
    const spd = 2.2 + Math.random() * 4.2;
    spark.x = x;
    spark.y = y;
    spark.z = z;
    spark.vx = Math.cos(a) * spd;
    spark.vz = Math.sin(a) * spd;
    spark.vy = lift + Math.random() * 3.5;
    spark.life = 0.32 + Math.random() * 0.28;
    spawned += 1;
    if (spawned >= 12) break;
  }
}

function placeMote(mote: Mote, avoidX: number, avoidZ: number) {
  for (let n = 0; n < 24; n += 1) {
    const a = Math.random() * Math.PI * 2;
    const rad = 5.5 + Math.random() * 12.5;
    const x = Math.cos(a) * rad;
    const z = Math.sin(a) * rad;
    if (Math.hypot(x - avoidX, z - avoidZ) < 6) continue;
    if (PILLARS.some((p) => Math.hypot(x - p.x, z - p.z) < p.r + 1.7)) continue;
    mote.x = x;
    mote.z = z;
    return;
  }
  mote.x = clamp(-avoidX, -16, 16);
  mote.z = clamp(-avoidZ, -16, 16);
}

function finish(reason: EndReason) {
  if (sim.phase !== "playing") return;
  if (reason === "time") sim.score += sim.lives * 25;
  sim.phase = "over";
  sim.endReason = reason;
  sim.speed = 0;
  sim.isNewBest = sim.score > sim.best;
  if (sim.isNewBest) {
    sim.best = sim.score;
    saveBest(sim.best);
  }
  playOver();
  engine(0, false);
}

export function resetRun() {
  sim.phase = "playing";
  sim.endReason = null;
  sim.yaw = 0;
  sim.bank = 0;
  sim.x = 0;
  sim.z = 10;
  sim.speed = 0;
  sim.score = 0;
  sim.combo = 0;
  sim.comboTimer = 0;
  sim.lives = 3;
  sim.timeLeft = ROUND_SECONDS;
  sim.invuln = 1.15;
  sim.hitstop = 0;
  sim.trauma = 0;
  sim.flash = 0;
  sim.wispX = 14;
  sim.wispZ = -14;
  sim.floatText = "";
  sim.floatLife = 0;
  sim.isNewBest = false;
  sim.motes = initialMotes();
  for (const spark of sparks) spark.life = 0;
  pokeHud();
}

export function togglePause() {
  if (sim.phase === "playing") sim.phase = "paused";
  else if (sim.phase === "paused") sim.phase = "playing";
  pokeHud();
}

export function quitToMenu() {
  sim.phase = "menu";
  sim.speed = 0;
  sim.flash = 0;
  engine(0, false);
  pokeHud();
}

export function toggleShake() {
  sim.shake = !sim.shake;
  pokeHud();
}

export function setBest(n: number) {
  sim.best = n;
  pokeHud();
}

export function applyReducedMotion() {
  sim.shake = false;
  pokeHud();
}

function decaySparks(dt: number) {
  for (const spark of sparks) {
    if (spark.life <= 0) continue;
    spark.life -= dt;
    spark.x += spark.vx * dt;
    spark.y += spark.vy * dt;
    spark.z += spark.vz * dt;
    spark.vy -= 7 * dt;
  }
}

export function step(dt: number, input: { throttle: number; steer: number }) {
  if (sim.phase !== "playing") return;

  sim.flash = Math.max(0, sim.flash - dt * 2.1);
  sim.floatLife = Math.max(0, sim.floatLife - dt);
  sim.trauma = Math.max(0, sim.trauma - dt * 1.35);

  if (sim.hitstop > 0) {
    sim.hitstop = Math.max(0, sim.hitstop - dt);
    return;
  }

  decaySparks(dt);

  sim.timeLeft -= dt;
  if (sim.timeLeft <= 0) {
    sim.timeLeft = 0;
    finish("time");
    return;
  }

  sim.invuln = Math.max(0, sim.invuln - dt);
  sim.comboTimer = Math.max(0, sim.comboTimer - dt);
  if (sim.comboTimer === 0) sim.combo = 0;

  const reverse = sim.speed >= 0 ? 1 : -1;
  const speedFactor = Math.min(1, Math.max(0.42, Math.abs(sim.speed) / 12));
  sim.yaw += input.steer * 2.7 * speedFactor * reverse * dt;
  const bankTarget = input.steer * 0.48;
  sim.bank += (bankTarget - sim.bank) * (1 - Math.exp(-10 * dt));

  if (Math.abs(input.throttle) > 0.05) sim.speed += input.throttle * 28 * dt;
  else sim.speed *= Math.exp(-2.1 * dt);
  sim.speed = clamp(sim.speed, -8, 16);

  const fx = -Math.sin(sim.yaw);
  const fz = -Math.cos(sim.yaw);
  sim.x += fx * sim.speed * dt;
  sim.z += fz * sim.speed * dt;

  for (const pillar of PILLARS) {
    const dx = sim.x - pillar.x;
    const dz = sim.z - pillar.z;
    const dist = Math.hypot(dx, dz);
    const min = pillar.r + 0.9;
    if (dist < min && dist > 1e-4) {
      const nx = dx / dist;
      const nz = dz / dist;
      sim.x = pillar.x + nx * min;
      sim.z = pillar.z + nz * min;
      const into = fx * nx + fz * nz;
      if (sim.speed > 0 && into > 0.15) sim.speed *= 0.45;
      if (sim.speed < 0 && into < -0.15) sim.speed *= 0.45;
    }
  }

  const rim = Math.hypot(sim.x, sim.z);
  if (rim > ARENA) {
    sim.x = (sim.x / rim) * ARENA;
    sim.z = (sim.z / rim) * ARENA;
    sim.speed *= 0.55;
  }

  for (const mote of sim.motes) {
    const dx = sim.x - mote.x;
    const dz = sim.z - mote.z;
    if (dx * dx + dz * dz > 1.55 * 1.55) continue;
    sim.combo = sim.comboTimer > 0 ? sim.combo + 1 : 1;
    sim.comboTimer = 2.15;
    const gain = 10 * sim.combo;
    sim.score += gain;
    sim.floatText = `+${gain}`;
    sim.floatLife = 0.85;
    sim.trauma = Math.min(1, sim.trauma + 0.2);
    sim.hitstop = 0.04;
    burst(mote.x, 1, mote.z, 2.4);
    playCollect(sim.combo);
    placeMote(mote, sim.x, sim.z);
  }

  const wx = sim.x - sim.wispX;
  const wz = sim.z - sim.wispZ;
  const wd = Math.hypot(wx, wz) || 1;
  const chase = 4.6 + Math.min(5.5, sim.score / 90);
  sim.wispX += (wx / wd) * chase * dt;
  sim.wispZ += (wz / wd) * chase * dt;
  const wr = Math.hypot(sim.wispX, sim.wispZ);
  if (wr > ARENA) {
    sim.wispX = (sim.wispX / wr) * ARENA;
    sim.wispZ = (sim.wispZ / wr) * ARENA;
  }

  if (sim.invuln <= 0 && wd < 1.5) {
    sim.lives -= 1;
    sim.invuln = 1.4;
    sim.combo = 0;
    sim.comboTimer = 0;
    sim.trauma = Math.min(1, sim.trauma + 0.72);
    sim.flash = 1;
    sim.hitstop = 0.08;
    sim.speed *= 0.2;
    sim.wispX -= (wx / wd) * 11;
    sim.wispZ -= (wz / wd) * 11;
    burst(sim.x, 0.8, sim.z, 3.2);
    playHit();
    if (sim.lives <= 0) finish("caught");
  }
}
