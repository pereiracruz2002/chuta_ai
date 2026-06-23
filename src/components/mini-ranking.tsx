"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Award, Trophy } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MiniRankingProps {
  members: any[];
  userId: string;
}

export function MiniRanking({ members, userId }: MiniRankingProps) {
  const sorted = [...members].sort((a: any, b: any) => b.score - a.score);

  if (sorted.length === 0) return null;

  const top3 = sorted.slice(0, 3);
  const userIndex = sorted.findIndex((m: any) => m.user_id === userId);
  const userMember = userIndex >= 0 ? sorted[userIndex] : null;
  const userIsInTop3 = userIndex >= 0 && userIndex < 3;

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="w-3 h-3 text-amber-500" />;
    if (index === 1) return <Medal className="w-3 h-3 text-slate-400" />;
    if (index === 2) return <Award className="w-3 h-3 text-orange-500" />;
    return null;
  };

  return (
    <div className="rounded-xl border border-border/50 bg-gradient-to-r from-emerald-500/[0.04] via-transparent to-emerald-500/[0.04] p-3">
      <div className="flex items-center gap-2 mb-2.5">
        <Trophy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ranking</span>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto">
        {/* Top 3 */}
        {top3.map((member: any, index: number) => (
          <div
            key={member.id}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg shrink-0 ${
              member.user_id === userId
                ? "bg-emerald-500/10 border border-emerald-500/25"
                : "bg-muted/30"
            }`}
          >
            {getMedalIcon(index)}
            <Avatar className="h-6 w-6 ring-1 ring-border/30">
              <AvatarImage
                src={member.users?.avatar_url || undefined}
                alt={member.users?.name || ""}
              />
              <AvatarFallback className="text-[9px] font-bold">
                {member.users?.name?.slice(0, 2).toUpperCase() || "??"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs font-semibold truncate max-w-[60px]">
              {member.users?.name?.split(" ")[0] || "?"}
            </span>
            <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
              {member.score}
            </span>
          </div>
        ))}

        {/* Separador + posição do usuário se não está no top 3 */}
        {!userIsInTop3 && userMember && (
          <>
            <div className="text-muted-foreground text-xs font-bold shrink-0">...</div>
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 shrink-0">
              <span className="text-[10px] font-black text-muted-foreground">{userIndex + 1}o</span>
              <Avatar className="h-6 w-6 ring-1 ring-emerald-500/30">
                <AvatarImage
                  src={userMember.users?.avatar_url || undefined}
                  alt={userMember.users?.name || ""}
                />
                <AvatarFallback className="text-[9px] font-bold">
                  {userMember.users?.name?.slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-semibold truncate max-w-[60px]">
                {userMember.users?.name?.split(" ")[0] || "Você"}
              </span>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                {userMember.score}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
