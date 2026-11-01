import { useEffect, useState, type ComponentType } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GameChrome } from "@/components/GameChrome";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [Arena, setArena] = useState<ComponentType | null>(null);

  useEffect(() => {
    let alive = true;
    void import("@/game/Arena").then((mod) => {
      if (alive) setArena(() => mod.default);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="stage-glow relative h-dvh w-full overflow-hidden text-cream">
      <div className="absolute inset-0">{Arena ? <Arena /> : null}</div>
      <GameChrome />
    </main>
  );
}
