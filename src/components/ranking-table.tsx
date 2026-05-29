"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Award } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface RankingTableProps {
  members: any[];
  userId: string;
}

export function RankingTable({ members, userId }: RankingTableProps) {
  const sorted = [...members].sort((a: any, b: any) => b.score - a.score);

  const getMedalIcon = (index: number) => {
    if (index === 0) return <Crown className="w-3.5 h-3.5" />;
    if (index === 1) return <Medal className="w-3.5 h-3.5" />;
    if (index === 2) return <Award className="w-3.5 h-3.5" />;
    return <span className="text-xs font-bold">{index + 1}</span>;
  };

  const getMedalStyle = (index: number) => {
    if (index === 0) return "bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-900 shadow-lg shadow-amber-500/30";
    if (index === 1) return "bg-gradient-to-br from-slate-300 to-gray-400 text-slate-700 shadow-lg shadow-gray-400/30";
    if (index === 2) return "bg-gradient-to-br from-orange-400 to-amber-600 text-orange-900 shadow-lg shadow-amber-600/30";
    return "bg-muted/50 text-muted-foreground";
  };

  return (
    <Card className="glass overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-emerald-500/[0.08] via-green-500/[0.05] to-transparent border-b border-border/30 pb-4">
        <CardTitle className="text-lg flex items-center gap-2.5 font-bold">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
            <Crown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Classificacao
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
                  member.user_id === userId
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
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Voce</span>
                  )}
                </div>
                <div className="text-right">
                  <span className="font-black text-lg">{member.score}</span>
                  <span className="text-[10px] text-muted-foreground ml-1 font-medium">pts</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
