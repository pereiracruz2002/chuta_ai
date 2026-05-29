"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchList } from "@/components/match-list";
import { RankingTable } from "@/components/ranking-table";
import { MembersList } from "@/components/members-list";
import { Trophy, Users, CalendarDays } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PoolTabsProps {
  poolId: string;
  matches: any[];
  members: any[];
  predictions: any[];
  userId: string;
  isOwner: boolean;
}

export function PoolTabs({
  poolId,
  matches,
  members,
  predictions,
  userId,
}: PoolTabsProps) {
  return (
    <Tabs defaultValue="matches" className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-12 glass p-1 rounded-xl">
        <TabsTrigger value="matches" className="gap-2 text-xs font-bold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-600 dark:text-emerald-400 data-[state=active]:shadow-sm transition-all cursor-pointer">
          <CalendarDays className="w-4 h-4" />
          Jogos
        </TabsTrigger>
        <TabsTrigger value="ranking" className="gap-2 text-xs font-bold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-600 dark:text-emerald-400 data-[state=active]:shadow-sm transition-all cursor-pointer">
          <Trophy className="w-4 h-4" />
          Ranking
        </TabsTrigger>
        <TabsTrigger value="members" className="gap-2 text-xs font-bold rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/20 data-[state=active]:to-green-500/20 data-[state=active]:text-emerald-600 dark:text-emerald-400 data-[state=active]:shadow-sm transition-all cursor-pointer">
          <Users className="w-4 h-4" />
          Membros
        </TabsTrigger>
      </TabsList>

      <TabsContent value="matches" className="mt-6">
        <MatchList
          matches={matches}
          predictions={predictions}
          poolId={poolId}
          userId={userId}
        />
      </TabsContent>

      <TabsContent value="ranking" className="mt-6">
        <RankingTable members={members} userId={userId} />
      </TabsContent>

      <TabsContent value="members" className="mt-6">
        <MembersList members={members} />
      </TabsContent>
    </Tabs>
  );
}
