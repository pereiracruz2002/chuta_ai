"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, X } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PoolChampionCelebrationProps {
  poolId: string;
  members: any[];
  matches: any[];
  userId: string;
  open: boolean;
  onClose: () => void;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  life: number;
};

const COLORS = [
  "#fbbf24",
  "#f59e0b",
  "#34d399",
  "#10b981",
  "#f472b6",
  "#60a5fa",
  "#a78bfa",
  "#fb7185",
];

export function isTournamentFinished(matches: any[]): boolean {
  if (!matches.length) return false;
  const finalMatch = matches.find((m) => m.stage === "Final");
  if (finalMatch) return !!finalMatch.finished;
  return matches.every((m) => m.finished);
}

export function getPoolChampions(members: any[]): any[] {
  if (!members.length) return [];
  const sorted = [...members].sort((a, b) => b.score - a.score);
  const topScore = sorted[0].score;
  return sorted.filter((m) => m.score === topScore);
}

function storageKey(poolId: string) {
  return `chuta-ai:champion-seen:${poolId}`;
}

export function hasSeenChampionCelebration(poolId: string): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(storageKey(poolId)) === "1";
}

export function markChampionCelebrationSeen(poolId: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(poolId), "1");
}

export function PoolChampionCelebration({
  poolId,
  members,
  matches,
  userId,
  open,
  onClose,
}: PoolChampionCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const [visible, setVisible] = useState(false);

  const champions = getPoolChampions(members);
  const finished = isTournamentFinished(matches);

  useEffect(() => {
    if (open && finished && champions.length > 0) {
      setVisible(true);
      markChampionCelebrationSeen(poolId);
    }
  }, [open, finished, champions.length, poolId]);

  useEffect(() => {
    if (!visible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const spawnBurst = (count: number) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: -20 - Math.random() * 80,
          vx: (Math.random() - 0.5) * 6,
          vy: 2 + Math.random() * 5,
          size: 4 + Math.random() * 7,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.25,
          life: 1,
        });
      }
    };

    spawnBurst(80);
    let frame = 0;

    const tick = () => {
      frame += 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (frame % 12 === 0) spawnBurst(8);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.08;
        p.rotation += p.rotationSpeed;
        p.life -= 0.003;

        if (p.y > canvas.height + 40 || p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("resize", resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [visible]);

  if (!visible || !finished || champions.length === 0) return null;

  const isTie = champions.length > 1;
  const isUserChampion = champions.some((c) => c.user_id === userId);

  const handleClose = () => {
    setVisible(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Campeão do bolão"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-500"
        onClick={handleClose}
      />
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      />

      <div className="relative z-[2] w-full max-w-md animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-b from-amber-500/20 via-card to-card p-6 shadow-2xl shadow-amber-500/20">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-amber-400/30 blur-3xl" />

          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="relative space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-yellow-500 shadow-lg shadow-amber-500/40 animate-[champion-bounce_1.4s_ease-in-out_infinite]">
              <Crown className="h-7 w-7 text-amber-950" />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                Copa encerrada
              </p>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-black tracking-tight">
                {isTie ? "Campeões do Bolão!" : "Campeão do Bolão!"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isUserChampion
                  ? isTie
                    ? "Você empatou em primeiro lugar. Parabéns!"
                    : "Você é o grande vencedor. Parabéns!"
                  : "O ranking final está definido."}
              </p>
            </div>

            <div className={`grid gap-3 ${isTie ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
              {champions.map((champion) => (
                <div
                  key={champion.id}
                  className={`rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 ${
                    champion.user_id === userId ? "ring-2 ring-amber-400/50" : ""
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-20 w-20 ring-4 ring-amber-400/60 ring-offset-2 ring-offset-card">
                        <AvatarImage
                          src={champion.users?.avatar_url || undefined}
                          alt={champion.users?.name || ""}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-amber-300 to-yellow-500 text-lg font-black text-amber-950">
                          {champion.users?.name?.slice(0, 2).toUpperCase() || "??"}
                        </AvatarFallback>
                      </Avatar>
                      <Sparkles className="absolute -right-1 -top-1 h-5 w-5 text-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-lg font-black">
                        {champion.users?.name || "Campeão"}
                      </p>
                      {champion.user_id === userId && (
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Você
                        </p>
                      )}
                    </div>
                    <p className="text-2xl font-black tabular-nums">
                      {champion.score}
                      <span className="ml-1 text-sm font-semibold text-muted-foreground">
                        pts
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleClose}
              className="w-full cursor-pointer bg-gradient-to-r from-amber-500 to-yellow-500 font-bold text-amber-950 hover:from-amber-400 hover:to-yellow-400"
            >
              Ver ranking completo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
