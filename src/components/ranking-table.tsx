"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Award, Sparkles } from "lucide-react";
import {
  getPoolChampions,
  isTournamentFinished,
  PoolChampionCelebration,
} from "@/components/pool-champion-celebration";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RankingTableProps {
  members: any[];
  matches: any[];
  poolId: string;
  userId: string;
}

export function RankingTable({ members, matches, poolId, userId }: RankingTableProps) {
  const sorted = [...members].sort((a: any, b: any) => b.score - a.score);
  const tournamentFinished = isTournamentFinished(matches);
  const champions = tournamentFinished ? getPoolChampions(members) : [];
  const [replayCelebration, setReplayCelebration] = useState(false);

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="w-3.5 h-3.5" />;
    if (index === 1) return <Medal className="w-3.5 h-3.5" />;
    if (index === 2) return <Award className="w-3.5 h-3.5" />;
    return <span className="text-sm font-bold">{index + 1}</span>;
  };

  const getMedalStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-900 shadow-lg shadow-amber-500/30";
    if (index === 1) return "bg-gradient-to-br from-slate-300 to-gray-400 text-slate-700 shadow-lg shadow-gray-400/30";
    if (index === 2) return "bg-gradient-to-br from-orange-400 to-amber-600 text-orange-900 shadow-lg shadow-amber-600/30";
    return "bg-muted/50 text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <PoolChampionCelebration
        poolId={poolId}
        members={members}
        matches={matches}
        userId={userId}
        open={replayCelebration}
        onClose={() => setReplayCelebration(false)}
      />

      {champions.length > 0 && (
        <button
          type="button"
          onClick={() => setReplayCelebration(true)}
          className="relative w-full overflow-hidden rounded-2xl border border-amber-400/40 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-emerald-500/10 p-4 text-left transition-transform hover:scale-[1.01] active:scale-[0.99] sm:p-5 cursor-pointer"
        >
          <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-400/20 blur-2xl" />
          <div className="relative flex items-center gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 to-yellow-500 shadow-lg shadow-amber-500/30">
              <Crown className="h-6 w-6 text-amber-950" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">
                {champions.length > 1 ? "Campeões do bolão" : "Campeão do bolão"}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {champions.map((champion) => (
                  <div key={champion.id} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 ring-2 ring-amber-400/50">
                      <AvatarImage
                        src={champion.users?.avatar_url || undefined}
                        alt={champion.users?.name || ""}
                      />
                      <AvatarFallback className="text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                        {champion.users?.name?.slice(0, 2).toUpperCase() || "??"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-base font-black sm:text-lg">
                      {champion.users?.name || "Campeão"}
                    </span>
                  </div>
                ))}
                <Sparkles className="h-4 w-4 shrink-0 text-amber-500 animate-pulse" />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                <span className="font-black text-foreground">{champions[0].score}</span>{" "}
                pontos no ranking final · toque para celebrar
              </p>
            </div>
          </div>
        </button>
      )}

      <Card className="glass overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/[0.08] via-green-500/[0.05] to-transparent border-b border-border/30 pb-4">
          <CardTitle className="text-lg flex items-center gap-2.5 font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
              <Crown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            {tournamentFinished ? "Classificação final" : "Classificacao"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {sorted.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12 font-medium">
              Nenhum participante ainda.
            </p>
          ) : (
            <div className="divide-y divide-border/30">
              {sorted.map((member: any, index: number) => (
                <div
                  key={member.id}
                  className={`flex items-center gap-3.5 px-5 py-4 transition-all duration-200 ${
                    tournamentFinished && index === 0
                      ? "bg-amber-500/[0.08] border-l-2 border-l-amber-400"
                      : member.user_id === userId
                        ? "bg-emerald-500/[0.06] border-l-2 border-l-emerald-400"
                        : "hover:bg-muted/20"
                  } ${index < 3 ? "py-4.5" : ""}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${getMedalStyle(index)}`}>
                    {getMedalIcon(index)}
                  </div>
                  <Avatar className="h-10 w-10 ring-2 ring-border/30 ring-offset-1 ring-offset-background">
                    <AvatarImage
                      src={member.users?.avatar_url || undefined}
                      alt={member.users?.name || ""}
                    />
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400">
                      {member.users?.name?.slice(0, 2).toUpperCase() || "??"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm truncate block">
                      {member.users?.name || "Usuario"}
                    </span>
                    {member.user_id === userId && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Voce</span>
                    )}
                    {tournamentFinished && index === 0 && member.user_id !== userId && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                        Campeão
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-black text-lg">{member.score}</span>
                    <span className="text-xs text-muted-foreground ml-1 font-medium">pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
