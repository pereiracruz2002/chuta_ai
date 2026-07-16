"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchList } from "@/components/match-list";
import { RankingTable } from "@/components/ranking-table";
import { ScoreEvolution } from "@/components/score-evolution";
import { MembersList } from "@/components/members-list";
import { ScoringRules } from "@/components/scoring-rules";
import { MiniRanking } from "@/components/mini-ranking";
import {
  PoolChampionCelebration,
  getPoolChampions,
  hasSeenChampionCelebration,
  isTournamentFinished,
} from "@/components/pool-champion-celebration";
import { Trophy, Users, CalendarDays, BookOpen } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PoolTabsProps {
  poolId: string;
  matches: any[];
  members: any[];
  predictions: any[];
  allPredictions: any[];
  userId: string;
  isOwner: boolean;
}

export function PoolTabs({
  poolId,
  matches,
  members,
  predictions,
  allPredictions,
  userId,
}: PoolTabsProps) {
  const tournamentFinished = isTournamentFinished(matches);
  const hasChampion = getPoolChampions(members).length > 0;
  const [tab, setTab] = useState(tournamentFinished ? "ranking" : "matches");
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (!tournamentFinished || !hasChampion) return;
    if (hasSeenChampionCelebration(poolId)) return;

    setTab("ranking");
    setShowCelebration(true);
  }, [tournamentFinished, hasChampion, poolId]);

  return (
    <>
      <PoolChampionCelebration
        poolId={poolId}
        members={members}
        matches={matches}
        userId={userId}
        open={showCelebration}
        onClose={() => setShowCelebration(false)}
      />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 h-12 glass p-1 rounded-xl">
          <TabsTrigger value="matches" className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all cursor-pointer">
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Jogos</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all cursor-pointer">
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Ranking</span>
          </TabsTrigger>
          <TabsTrigger value="rules" className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all cursor-pointer">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Regras</span>
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2 text-sm font-semibold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all cursor-pointer">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Membros</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="matches" className="mt-6 space-y-4">
          <MiniRanking members={members} userId={userId} />
          <MatchList
            matches={matches}
            predictions={predictions}
            allPredictions={allPredictions}
            poolId={poolId}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="ranking" className="mt-6 space-y-4">
          <RankingTable members={members} matches={matches} poolId={poolId} userId={userId} />
          <ScoreEvolution
            members={members}
            matches={matches}
            predictions={allPredictions}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="rules" className="mt-6">
          <ScoringRules />
        </TabsContent>

        <TabsContent value="members" className="mt-6">
          <MembersList members={members} />
        </TabsContent>
      </Tabs>
    </>
  );
}
