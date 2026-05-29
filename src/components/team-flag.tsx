"use client";

import { getFlagUrl } from "@/lib/teams";

interface TeamFlagProps {
  team: string;
  size?: number;
  className?: string;
}

export function TeamFlag({ team, size = 40, className = "" }: TeamFlagProps) {
  const flagUrl = getFlagUrl(team, size * 2); // 2x for retina

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div
        className="rounded-sm overflow-hidden shadow-sm border border-border/50"
        style={{ width: size, height: size * 0.75 }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={flagUrl}
          alt={`Bandeira ${team}`}
          width={size}
          height={size * 0.75}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
