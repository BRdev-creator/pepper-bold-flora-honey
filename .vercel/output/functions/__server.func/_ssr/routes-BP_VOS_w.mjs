import { i as __toESM } from "../_runtime.mjs";
import { c as require_jsx_runtime, l as require_react } from "../_libs/@react-three/fiber+[...].mjs";
import { a as Pause, i as Play, n as Volume2, o as Hexagon, t as VolumeX } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BP_VOS_w.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var ctx = null;
var drone = null;
var muted = false;
function isMuted() {
	return muted;
}
function setMuted(next) {
	muted = next;
	if (!ctx || !drone) return;
	drone.gain.gain.setTargetAtTime(1e-4, ctx.currentTime, .05);
}
function unlockAudio() {
	if (typeof window === "undefined") return;
	if (!ctx) ctx = new AudioContext();
	if (ctx.state === "suspended") ctx.resume();
}
function resumeAudio() {
	if (ctx && ctx.state === "suspended") ctx.resume();
}
function envGain(peak, dur) {
	if (!ctx) return null;
	const gain = ctx.createGain();
	const now = ctx.currentTime;
	gain.gain.setValueAtTime(1e-4, now);
	gain.gain.exponentialRampToValueAtTime(peak, now + .02);
	gain.gain.exponentialRampToValueAtTime(1e-4, now + dur);
	gain.connect(ctx.destination);
	return gain;
}
function playCollect(combo) {
	if (!ctx || muted) return;
	const osc = ctx.createOscillator();
	const gain = envGain(.07, .18);
	if (!gain) return;
	osc.type = "triangle";
	const base = 480 + Math.min(combo, 8) * 36;
	osc.frequency.setValueAtTime(base, ctx.currentTime);
	osc.frequency.exponentialRampToValueAtTime(base * 1.7, ctx.currentTime + .12);
	osc.connect(gain);
	osc.start();
	osc.stop(ctx.currentTime + .2);
}
function playHit() {
	if (!ctx || muted) return;
	const osc = ctx.createOscillator();
	const gain = envGain(.09, .28);
	if (!gain) return;
	osc.type = "sine";
	osc.frequency.setValueAtTime(180, ctx.currentTime);
	osc.frequency.exponentialRampToValueAtTime(48, ctx.currentTime + .26);
	osc.connect(gain);
	osc.start();
	osc.stop(ctx.currentTime + .3);
}
function playOver() {
	if (!ctx || muted) return;
	const osc = ctx.createOscillator();
	const gain = envGain(.06, .45);
	if (!gain) return;
	osc.type = "triangle";
	osc.frequency.setValueAtTime(320, ctx.currentTime);
	osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + .4);
	osc.connect(gain);
	osc.start();
	osc.stop(ctx.currentTime + .46);
}
function engine(speed, active) {
	if (!ctx) return;
	if (!drone) {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.value = 72;
		gain.gain.value = 1e-4;
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.start();
		drone = {
			osc,
			gain
		};
	}
	const vol = !muted && active ? Math.min(.045, .008 + Math.abs(speed) * .002) : 1e-4;
	drone.gain.gain.setTargetAtTime(Math.max(1e-4, vol), ctx.currentTime, .08);
	drone.osc.frequency.setTargetAtTime(68 + Math.abs(speed) * 2.4, ctx.currentTime, .08);
}
var keys = /* @__PURE__ */ new Set();
var injected = null;
var steerOverride = null;
var touch = {
	steer: 0,
	throttle: 0
};
function clamp$1(n, min, max) {
	return Math.max(min, Math.min(max, n));
}
function isDown(code) {
	if (injected) return injected.includes(code);
	return keys.has(code);
}
function readInput() {
	let throttle = 0;
	let steer = 0;
	if (isDown("KeyW") || isDown("ArrowUp")) throttle += 1;
	if (isDown("KeyS") || isDown("ArrowDown")) throttle -= 1;
	if (isDown("KeyA") || isDown("ArrowLeft")) steer += 1;
	if (isDown("KeyD") || isDown("ArrowRight")) steer -= 1;
	throttle = clamp$1(throttle + touch.throttle, -1, 1);
	steer = clamp$1(steer + touch.steer, -1, 1);
	if (steerOverride !== null) steer = clamp$1(steerOverride, -1, 1);
	return {
		throttle,
		steer
	};
}
function noteKeyDown(code) {
	keys.add(code);
}
function noteKeyUp(code) {
	keys.delete(code);
}
function clearKeys() {
	keys.clear();
}
function setInjectedKeys(codes) {
	injected = codes.slice();
}
function setSteerOverride(v) {
	steerOverride = v;
}
function installProbe(probe) {
	if (typeof window === "undefined") return;
	window.__controlsTest = {
		...probe,
		setKeys: setInjectedKeys,
		setSteer: setSteerOverride
	};
}
function applyStick(dx, dy) {
	const mag = Math.hypot(dx, dy);
	if (mag < .14) {
		touch.steer = 0;
		touch.throttle = 0;
		return {
			x: 0,
			y: 0
		};
	}
	const cl = Math.min(1, mag);
	const nx = dx / mag * cl;
	const ny = dy / mag * cl;
	touch.steer = clamp$1(-nx, -1, 1);
	touch.throttle = clamp$1(-ny, -1, 1);
	return {
		x: nx,
		y: ny
	};
}
function releaseStick() {
	touch.steer = 0;
	touch.throttle = 0;
}
var ARENA = 20.4;
var PILLARS = [
	{
		x: 8,
		z: -4,
		r: 1.15,
		h: 2.4
	},
	{
		x: -7,
		z: 6,
		r: 1.3,
		h: 3.2
	},
	{
		x: -10,
		z: -8,
		r: 1.05,
		h: 1.9
	},
	{
		x: 12,
		z: 9,
		r: 1.4,
		h: 2.7
	},
	{
		x: 3,
		z: 12,
		r: .95,
		h: 1.6
	},
	{
		x: -14,
		z: 1,
		r: 1.2,
		h: 3
	},
	{
		x: 15,
		z: -7,
		r: 1.1,
		h: 2.1
	},
	{
		x: -3,
		z: -13,
		r: 1.35,
		h: 3.5
	},
	{
		x: 6,
		z: 5,
		r: .85,
		h: 1.5
	}
];
var SAVE_KEY = "lumen-drift-v1";
var sparks = Array.from({ length: 40 }, () => ({
	x: 0,
	y: -8,
	z: 0,
	vx: 0,
	vy: 0,
	vz: 0,
	life: 0
}));
function clamp(n, min, max) {
	return Math.max(min, Math.min(max, n));
}
function initialMotes() {
	return [
		{
			x: -6,
			z: -2
		},
		{
			x: 9,
			z: 2
		},
		{
			x: -2,
			z: 9
		},
		{
			x: 4,
			z: -9
		},
		{
			x: -11,
			z: 8
		},
		{
			x: 11,
			z: -11
		}
	].map((p, id) => ({
		id,
		x: p.x,
		z: p.z,
		phase: id * .8
	}));
}
var sim = {
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
	timeLeft: 75,
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
	motes: initialMotes()
};
var rev = 0;
var listeners = /* @__PURE__ */ new Set();
function subscribeHud(fn) {
	listeners.add(fn);
	return () => listeners.delete(fn);
}
function getHudRev() {
	return rev;
}
function pokeHud() {
	rev += 1;
	for (const fn of listeners) fn();
}
function loadBest() {
	if (typeof localStorage === "undefined") return 0;
	try {
		const raw = localStorage.getItem(SAVE_KEY);
		if (!raw) return 0;
		const data = JSON.parse(raw);
		if (data.version !== 1 || typeof data.best !== "number" || !Number.isFinite(data.best)) return 0;
		return Math.max(0, Math.floor(data.best));
	} catch {
		return 0;
	}
}
function saveBest(n) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(SAVE_KEY, JSON.stringify({
		version: 1,
		best: n
	}));
}
function burst(x, y, z, lift) {
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
		spark.life = .32 + Math.random() * .28;
		spawned += 1;
		if (spawned >= 12) break;
	}
}
function placeMote(mote, avoidX, avoidZ) {
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
function finish(reason) {
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
function resetRun() {
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
	sim.timeLeft = 75;
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
function togglePause() {
	if (sim.phase === "playing") sim.phase = "paused";
	else if (sim.phase === "paused") sim.phase = "playing";
	pokeHud();
}
function quitToMenu() {
	sim.phase = "menu";
	sim.speed = 0;
	sim.flash = 0;
	engine(0, false);
	pokeHud();
}
function toggleShake() {
	sim.shake = !sim.shake;
	pokeHud();
}
function setBest(n) {
	sim.best = n;
	pokeHud();
}
function applyReducedMotion() {
	sim.shake = false;
	pokeHud();
}
function decaySparks(dt) {
	for (const spark of sparks) {
		if (spark.life <= 0) continue;
		spark.life -= dt;
		spark.x += spark.vx * dt;
		spark.y += spark.vy * dt;
		spark.z += spark.vz * dt;
		spark.vy -= 7 * dt;
	}
}
function step(dt, input) {
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
	const speedFactor = Math.min(1, Math.max(.42, Math.abs(sim.speed) / 12));
	sim.yaw += input.steer * 2.7 * speedFactor * reverse * dt;
	const bankTarget = input.steer * .48;
	sim.bank += (bankTarget - sim.bank) * (1 - Math.exp(-10 * dt));
	if (Math.abs(input.throttle) > .05) sim.speed += input.throttle * 28 * dt;
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
		const min = pillar.r + .9;
		if (dist < min && dist > 1e-4) {
			const nx = dx / dist;
			const nz = dz / dist;
			sim.x = pillar.x + nx * min;
			sim.z = pillar.z + nz * min;
			const into = fx * nx + fz * nz;
			if (sim.speed > 0 && into > .15) sim.speed *= .45;
			if (sim.speed < 0 && into < -.15) sim.speed *= .45;
		}
	}
	const rim = Math.hypot(sim.x, sim.z);
	if (rim > 20.4) {
		sim.x = sim.x / rim * ARENA;
		sim.z = sim.z / rim * ARENA;
		sim.speed *= .55;
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
		sim.floatLife = .85;
		sim.trauma = Math.min(1, sim.trauma + .2);
		sim.hitstop = .04;
		burst(mote.x, 1, mote.z, 2.4);
		playCollect(sim.combo);
		placeMote(mote, sim.x, sim.z);
	}
	const wx = sim.x - sim.wispX;
	const wz = sim.z - sim.wispZ;
	const wd = Math.hypot(wx, wz) || 1;
	const chase = 4.6 + Math.min(5.5, sim.score / 90);
	sim.wispX += wx / wd * chase * dt;
	sim.wispZ += wz / wd * chase * dt;
	const wr = Math.hypot(sim.wispX, sim.wispZ);
	if (wr > 20.4) {
		sim.wispX = sim.wispX / wr * ARENA;
		sim.wispZ = sim.wispZ / wr * ARENA;
	}
	if (sim.invuln <= 0 && wd < 1.5) {
		sim.lives -= 1;
		sim.invuln = 1.4;
		sim.combo = 0;
		sim.comboTimer = 0;
		sim.trauma = Math.min(1, sim.trauma + .72);
		sim.flash = 1;
		sim.hitstop = .08;
		sim.speed *= .2;
		sim.wispX -= wx / wd * 11;
		sim.wispZ -= wz / wd * 11;
		burst(sim.x, .8, sim.z, 3.2);
		playHit();
		if (sim.lives <= 0) finish("caught");
	}
}
installProbe({
	getYaw: () => sim.yaw,
	getSpeed: () => sim.speed
});
function formatTime(seconds) {
	const total = Math.max(0, Math.ceil(seconds));
	return `${Math.floor(total / 60)}:${(total % 60).toString().padStart(2, "0")}`;
}
function GameChrome() {
	(0, import_react.useSyncExternalStore)(subscribeHud, getHudRev, getHudRev);
	(0, import_react.useEffect)(() => {
		setBest(loadBest());
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) applyReducedMotion();
		const onDown = (event) => {
			if (event.code === "Escape") {
				togglePause();
				return;
			}
			if (event.code === "Enter" && sim.phase === "menu" && !event.repeat) {
				const target = event.target;
				if (target instanceof HTMLElement && target.tagName === "BUTTON") return;
				begin();
				return;
			}
			if (event.code.startsWith("Arrow") || event.code === "Space") event.preventDefault();
			noteKeyDown(event.code);
		};
		const onUp = (event) => noteKeyUp(event.code);
		const onBlur = () => clearKeys();
		const onVis = () => {
			if (document.visibilityState === "visible") resumeAudio();
			else clearKeys();
		};
		window.addEventListener("keydown", onDown);
		window.addEventListener("keyup", onUp);
		window.addEventListener("blur", onBlur);
		document.addEventListener("visibilitychange", onVis);
		return () => {
			window.removeEventListener("keydown", onDown);
			window.removeEventListener("keyup", onUp);
			window.removeEventListener("blur", onBlur);
			document.removeEventListener("visibilitychange", onVis);
		};
	}, []);
	const playing = sim.phase === "playing" || sim.phase === "paused";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "vignette pointer-events-none absolute inset-0" }),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute inset-0 bg-cream",
			style: { opacity: sim.flash * .38 }
		}),
		playing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hud, {}) : null,
		sim.phase === "menu" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {}) : null,
		sim.phase === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paused, {}) : null,
		sim.phase === "over" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Over, {}) : null,
		sim.phase === "playing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stick, {}) : null
	] });
}
function begin() {
	unlockAudio();
	resetRun();
}
var iconButton = "pointer-events-auto grid size-11 place-items-center rounded-full border border-line bg-panel/80 text-cream motion-pop transition-transform duration-200 ease-out active:scale-95";
function Hud() {
	const [muted, setMuteState] = (0, import_react.useState)(isMuted);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "safe-top pointer-events-none absolute inset-x-0 top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-start gap-3 px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-3xl leading-none font-extrabold tabular-nums text-cream",
						children: sim.score
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs tracking-widest text-mist uppercase",
						children: ["Score", sim.best > 0 ? ` · best ${sim.best}` : ""]
					}),
					sim.floatLife > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-display text-lg font-bold text-amber tabular-nums",
						children: sim.floatText
					}) : sim.combo > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "font-display text-lg font-bold text-amber tabular-nums",
						children: ["×", sim.combo]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: `font-display text-2xl leading-none font-bold tabular-nums ${sim.timeLeft <= 10 ? "text-amber" : "text-tide"}`,
					children: formatTime(sim.timeLeft)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs tracking-widest text-mist uppercase",
					children: "Time"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-1",
					"aria-label": `${sim.lives} lives left`,
					children: Array.from({ length: 3 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hexagon, {
						className: i < sim.lives ? "size-5 fill-tide text-tide" : "size-5 text-line",
						"aria-hidden": "true"
					}, i))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: iconButton,
						"aria-label": muted ? "Unmute" : "Mute",
						onClick: () => {
							const next = !isMuted();
							setMuted(next);
							setMuteState(next);
						},
						children: muted ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: iconButton,
						"aria-label": "Pause",
						onClick: () => togglePause(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-5" })
					})]
				})]
			})
		]
	});
}
function Menu() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-end justify-center px-4 pt-4 pb-20 sm:items-center sm:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "pointer-events-auto w-full max-w-sm rounded-card border border-line bg-panel/90 p-5 backdrop-blur-md sm:p-7",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-tide uppercase",
					children: "Demo · 3D"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "mt-2 font-display text-4xl leading-none font-extrabold text-cream sm:text-5xl",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-tide",
						children: "Lumen"
					}), " Drift"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm leading-relaxed text-pretty text-mist",
					children: "Sweep the amber motes in seventy-five seconds. The wisp speeds up as your score climbs. Three touches end the run."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "mt-4 space-y-2 text-sm text-cream",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "W" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-mist",
								children: "thrust"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "A" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-mist",
								children: "left"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "D" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-mist",
								children: "right"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Key, { children: "S" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-mist",
								children: "brake"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "text-mist",
						children: "On a phone, drag the pad — up flies, left turns left."
					})]
				}),
				sim.best > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm text-mist",
					children: ["Best ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-base font-bold text-cream tabular-nums",
						children: sim.best
					})]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mt-4 text-sm text-mist underline decoration-line underline-offset-4",
					onClick: () => toggleShake(),
					children: ["Screen shake ", sim.shake ? "on" : "off"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tide font-display text-base font-extrabold text-ink motion-pop transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]",
					onClick: begin,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-ink" }), "Start"]
				})
			]
		})
	});
}
function Paused() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-center justify-center p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "pointer-events-auto w-full max-w-sm rounded-card border border-line bg-panel/90 p-6 text-center backdrop-blur-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-3xl font-extrabold text-cream",
					children: "Paused"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-mist",
					children: "The disc waits. The wisp does not forget."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tide font-display text-base font-extrabold text-ink",
					onClick: () => togglePause(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-ink" }), "Resume"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "mt-3 h-11 w-full rounded-full border border-line text-sm text-cream",
					onClick: () => quitToMenu(),
					children: "Back to title"
				})
			]
		})
	});
}
function Over() {
	const title = sim.endReason === "caught" ? "The wisp caught you" : "Time held";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-20 flex items-end justify-center px-4 pt-4 pb-20 sm:items-center sm:p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "pointer-events-auto w-full max-w-sm rounded-card border border-line bg-panel/90 p-6 text-center backdrop-blur-md",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-widest text-tide uppercase",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-display text-5xl font-extrabold text-cream tabular-nums",
					children: sim.score
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-mist",
					children: sim.isNewBest ? "New best" : `Best ${sim.best}`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tide font-display text-base font-extrabold text-ink",
					onClick: begin,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4 fill-ink" }), "Again"]
				})
			]
		})
	});
}
function Key({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
		className: "rounded-md border border-line bg-ink px-1.5 py-0.5 font-display text-xs font-bold text-cream",
		children
	});
}
function Stick() {
	const [knob, setKnob] = (0, import_react.useState)({
		x: 0,
		y: 0
	});
	const active = (0, import_react.useRef)(false);
	function move(event) {
		if (!active.current) return;
		const rect = event.currentTarget.getBoundingClientRect();
		const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
		const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
		setKnob(applyStick(dx, dy));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "safe-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-4 pb-16 md:justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto relative size-32 touch-none rounded-full border border-line bg-panel/75 backdrop-blur-md md:hidden",
			role: "application",
			"aria-label": "Flight pad. Drag up to thrust, left to turn left.",
			onPointerDown: (event) => {
				active.current = true;
				event.currentTarget.setPointerCapture(event.pointerId);
				move(event);
			},
			onPointerMove: move,
			onPointerUp: (event) => {
				active.current = false;
				if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
				releaseStick();
				setKnob({
					x: 0,
					y: 0
				});
			},
			onPointerCancel: () => {
				active.current = false;
				releaseStick();
				setKnob({
					x: 0,
					y: 0
				});
			},
			onContextMenu: (event) => event.preventDefault(),
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-line" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute top-1/2 left-1/2 size-12 rounded-full bg-tide",
				style: { transform: `translate(calc(-50% + ${knob.x * 36}px), calc(-50% + ${knob.y * 36}px))` }
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "pointer-events-none mb-2 hidden text-xs tracking-widest text-mist uppercase md:block",
			children: "W thrust · A left · D right · S brake"
		})]
	});
}
var routes_exports = /* @__PURE__ */ __exportAll({ component: () => Home });
function Home() {
	const [Arena, setArena] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		import("./Arena-DRKe1KLe.mjs").then((mod) => {
			if (alive) setArena(() => mod.default);
		});
		return () => {
			alive = false;
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "stage-glow relative h-dvh w-full overflow-hidden text-cream",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0",
			children: Arena ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Arena, {}) : null
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameChrome, {})]
	});
}
//#endregion
export { sparks as a, readInput as c, sim as i, engine as l, PILLARS as n, step as o, pokeHud as r, installProbe as s, routes_exports as t };
