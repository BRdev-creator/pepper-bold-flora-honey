import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";
import { Hexagon, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { isMuted, resumeAudio, setMuted, unlockAudio } from "@/game/audio";
import {
  applyStick,
  clearKeys,
  installProbe,
  noteKeyDown,
  noteKeyUp,
  releaseStick,
} from "@/game/input";
import {
  applyReducedMotion,
  getHudRev,
  loadBest,
  quitToMenu,
  resetRun,
  setBest,
  sim,
  subscribeHud,
  togglePause,
  toggleShake,
} from "@/game/sim";

installProbe({
  getYaw: () => sim.yaw,
  getSpeed: () => sim.speed,
});

function formatTime(seconds: number) {
  const total = Math.max(0, Math.ceil(seconds));
  const mins = Math.floor(total / 60);
  const rest = total % 60;
  return `${mins}:${rest.toString().padStart(2, "0")}`;
}

export function GameChrome() {
  const rev = useSyncExternalStore(subscribeHud, getHudRev, getHudRev);
  void rev;

  useEffect(() => {
    setBest(loadBest());
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) applyReducedMotion();

    const onDown = (event: KeyboardEvent) => {
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
    const onUp = (event: KeyboardEvent) => noteKeyUp(event.code);
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

  return (
    <>
      <div className="vignette pointer-events-none absolute inset-0" />
      <div
        className="pointer-events-none absolute inset-0 bg-cream"
        style={{ opacity: sim.flash * 0.38 }}
      />
      {playing ? <Hud /> : null}
      {sim.phase === "menu" ? <Menu /> : null}
      {sim.phase === "paused" ? <Paused /> : null}
      {sim.phase === "over" ? <Over /> : null}
      {sim.phase === "playing" ? <Stick /> : null}
    </>
  );
}

function begin() {
  unlockAudio();
  resetRun();
}

const iconButton =
  "pointer-events-auto grid size-11 place-items-center rounded-full border border-line bg-panel/80 text-cream motion-pop transition-transform duration-200 ease-out active:scale-95";

function Hud() {
  const [muted, setMuteState] = useState(isMuted);
  return (
    <header className="safe-top pointer-events-none absolute inset-x-0 top-0 z-10 grid grid-cols-[1fr_auto_1fr] items-start gap-3 px-4">
      <div className="min-w-0">
        <p className="font-display text-3xl leading-none font-extrabold tabular-nums text-cream">{sim.score}</p>
        <p className="mt-1 text-xs tracking-widest text-mist uppercase">
          Score{sim.best > 0 ? ` · best ${sim.best}` : ""}
        </p>
        {sim.floatLife > 0 ? (
          <p className="font-display text-lg font-bold text-amber tabular-nums">{sim.floatText}</p>
        ) : sim.combo > 1 ? (
          <p className="font-display text-lg font-bold text-amber tabular-nums">×{sim.combo}</p>
        ) : null}
      </div>
      <div className="text-center">
        <p
          className={`font-display text-2xl leading-none font-bold tabular-nums ${sim.timeLeft <= 10 ? "text-amber" : "text-tide"}`}
        >
          {formatTime(sim.timeLeft)}
        </p>
        <p className="mt-1 text-xs tracking-widest text-mist uppercase">Time</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-1" aria-label={`${sim.lives} lives left`}>
          {Array.from({ length: 3 }, (_, i) => (
            <Hexagon
              key={i}
              className={i < sim.lives ? "size-5 fill-tide text-tide" : "size-5 text-line"}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className={iconButton}
            aria-label={muted ? "Unmute" : "Mute"}
            onClick={() => {
              const next = !isMuted();
              setMuted(next);
              setMuteState(next);
            }}
          >
            {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
          </button>
          <button type="button" className={iconButton} aria-label="Pause" onClick={() => togglePause()}>
            <Pause className="size-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Menu() {
  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center px-4 pt-4 pb-20 sm:items-center sm:p-6">
      <section className="pointer-events-auto w-full max-w-sm rounded-card border border-line bg-panel/90 p-5 backdrop-blur-md sm:p-7">
        <p className="text-xs tracking-widest text-tide uppercase">Demo · 3D</p>
        <h1 className="mt-2 font-display text-4xl leading-none font-extrabold text-cream sm:text-5xl">
          <span className="text-tide">Lumen</span> Drift
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-pretty text-mist">
          Sweep the amber motes in seventy-five seconds. The wisp speeds up as your score climbs. Three touches
          end the run.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-cream">
          <li className="flex items-center gap-2">
            <Key>W</Key>
            <span className="text-mist">thrust</span>
            <Key>A</Key>
            <span className="text-mist">left</span>
            <Key>D</Key>
            <span className="text-mist">right</span>
            <Key>S</Key>
            <span className="text-mist">brake</span>
          </li>
          <li className="text-mist">On a phone, drag the pad — up flies, left turns left.</li>
        </ul>
        {sim.best > 0 ? (
          <p className="mt-4 text-sm text-mist">
            Best <span className="font-display text-base font-bold text-cream tabular-nums">{sim.best}</span>
          </p>
        ) : null}
        <button
          type="button"
          className="mt-4 text-sm text-mist underline decoration-line underline-offset-4"
          onClick={() => toggleShake()}
        >
          Screen shake {sim.shake ? "on" : "off"}
        </button>
        <button
          type="button"
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tide font-display text-base font-extrabold text-ink motion-pop transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.98]"
          onClick={begin}
        >
          <Play className="size-4 fill-ink" />
          Start
        </button>
      </section>
    </div>
  );
}

function Paused() {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
      <section className="pointer-events-auto w-full max-w-sm rounded-card border border-line bg-panel/90 p-6 text-center backdrop-blur-md">
        <h2 className="font-display text-3xl font-extrabold text-cream">Paused</h2>
        <p className="mt-2 text-sm text-mist">The disc waits. The wisp does not forget.</p>
        <button
          type="button"
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tide font-display text-base font-extrabold text-ink"
          onClick={() => togglePause()}
        >
          <Play className="size-4 fill-ink" />
          Resume
        </button>
        <button
          type="button"
          className="mt-3 h-11 w-full rounded-full border border-line text-sm text-cream"
          onClick={() => quitToMenu()}
        >
          Back to title
        </button>
      </section>
    </div>
  );
}

function Over() {
  const title = sim.endReason === "caught" ? "The wisp caught you" : "Time held";
  return (
    <div className="absolute inset-0 z-20 flex items-end justify-center px-4 pt-4 pb-20 sm:items-center sm:p-6">
      <section className="pointer-events-auto w-full max-w-sm rounded-card border border-line bg-panel/90 p-6 text-center backdrop-blur-md">
        <p className="text-xs tracking-widest text-tide uppercase">{title}</p>
        <p className="mt-2 font-display text-5xl font-extrabold text-cream tabular-nums">{sim.score}</p>
        <p className="mt-1 text-sm text-mist">{sim.isNewBest ? "New best" : `Best ${sim.best}`}</p>
        <button
          type="button"
          className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-tide font-display text-base font-extrabold text-ink"
          onClick={begin}
        >
          <Play className="size-4 fill-ink" />
          Again
        </button>
      </section>
    </div>
  );
}

function Key({ children }: { children: string }) {
  return (
    <kbd className="rounded-md border border-line bg-ink px-1.5 py-0.5 font-display text-xs font-bold text-cream">
      {children}
    </kbd>
  );
}

function Stick() {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const active = useRef(false);

  function move(event: PointerEvent<HTMLDivElement>) {
    if (!active.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const dy = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
    setKnob(applyStick(dx, dy));
  }

  return (
    <div className="safe-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-4 pb-16 md:justify-center">
      <div
        className="pointer-events-auto relative size-32 touch-none rounded-full border border-line bg-panel/75 backdrop-blur-md md:hidden"
        role="application"
        aria-label="Flight pad. Drag up to thrust, left to turn left."
        onPointerDown={(event) => {
          active.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event);
        }}
        onPointerMove={move}
        onPointerUp={(event) => {
          active.current = false;
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
          releaseStick();
          setKnob({ x: 0, y: 0 });
        }}
        onPointerCancel={() => {
          active.current = false;
          releaseStick();
          setKnob({ x: 0, y: 0 });
        }}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-line" />
        <span
          className="absolute top-1/2 left-1/2 size-12 rounded-full bg-tide"
          style={{ transform: `translate(calc(-50% + ${knob.x * 36}px), calc(-50% + ${knob.y * 36}px))` }}
        />
      </div>
      <p className="pointer-events-none mb-2 hidden text-xs tracking-widest text-mist uppercase md:block">
        W thrust · A left · D right · S brake
      </p>
    </div>
  );
}
