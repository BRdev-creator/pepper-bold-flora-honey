export type ControlsProbe = {
  getYaw: () => number;
  getSpeed: () => number;
  setSteer?: (v: number) => void;
  setKeys?: (codes: string[]) => void;
};

declare global {
  interface Window {
    __controlsTest?: ControlsProbe;
  }
}

const keys = new Set<string>();
let injected: string[] | null = null;
let steerOverride: number | null = null;

export const touch = { steer: 0, throttle: 0 };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function isDown(code: string) {
  if (injected) return injected.includes(code);
  return keys.has(code);
}

export function readInput() {
  let throttle = 0;
  let steer = 0;
  if (isDown("KeyW") || isDown("ArrowUp")) throttle += 1;
  if (isDown("KeyS") || isDown("ArrowDown")) throttle -= 1;
  if (isDown("KeyA") || isDown("ArrowLeft")) steer += 1;
  if (isDown("KeyD") || isDown("ArrowRight")) steer -= 1;
  throttle = clamp(throttle + touch.throttle, -1, 1);
  steer = clamp(steer + touch.steer, -1, 1);
  if (steerOverride !== null) steer = clamp(steerOverride, -1, 1);
  return { throttle, steer };
}

export function noteKeyDown(code: string) {
  keys.add(code);
}

export function noteKeyUp(code: string) {
  keys.delete(code);
}

export function clearKeys() {
  keys.clear();
}

export function setInjectedKeys(codes: string[]) {
  injected = codes.slice();
}

export function setSteerOverride(v: number) {
  steerOverride = v;
}

export function installProbe(probe: Omit<ControlsProbe, "setKeys" | "setSteer">) {
  if (typeof window === "undefined") return;
  window.__controlsTest = {
    ...probe,
    setKeys: setInjectedKeys,
    setSteer: setSteerOverride,
  };
}

export function applyStick(dx: number, dy: number) {
  const mag = Math.hypot(dx, dy);
  if (mag < 0.14) {
    touch.steer = 0;
    touch.throttle = 0;
    return { x: 0, y: 0 };
  }
  const cl = Math.min(1, mag);
  const nx = (dx / mag) * cl;
  const ny = (dy / mag) * cl;
  touch.steer = clamp(-nx, -1, 1);
  touch.throttle = clamp(-ny, -1, 1);
  return { x: nx, y: ny };
}

export function releaseStick() {
  touch.steer = 0;
  touch.throttle = 0;
}
