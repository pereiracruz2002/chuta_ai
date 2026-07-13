"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Minus, LineChart as LineChartIcon } from "lucide-react";
import {
  SERIES_COLORS,
  buildScoreEvolution,
  type EvolutionMatch,
  type EvolutionMember,
  type EvolutionPrediction,
} from "@/lib/score-evolution";

type ChartMode = "score" | "rank";

interface ScoreEvolutionProps {
  members: EvolutionMember[];
  matches: EvolutionMatch[];
  predictions: EvolutionPrediction[];
  userId: string;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

export function ScoreEvolution({
  members,
  matches,
  predictions,
  userId,
}: ScoreEvolutionProps) {
  const [mode, setMode] = useState<ChartMode>("score");
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const { points, movements } = useMemo(
    () => buildScoreEvolution(members, matches, predictions),
    [members, matches, predictions]
  );

  const finishedCount = matches.filter((m) => m.finished).length;

  const chartData = useMemo(() => {
    return points.map((point) => {
      const row: Record<string, string | number> = {
        label: point.label,
        dateLabel: point.dateLabel,
      };
      for (const member of members) {
        const key = member.user_id;
        row[key] =
          mode === "score"
            ? (point.scores[key] ?? 0)
            : (point.ranks[key] ?? members.length);
      }
      return row;
    });
  }, [points, members, mode]);

  const toggleSeries = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (finishedCount === 0) {
    return (
      <Card className="glass overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/[0.08] via-green-500/[0.05] to-transparent border-b border-border/30 pb-4">
          <CardTitle className="text-lg flex items-center gap-2.5 font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
              <LineChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Evolução
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <p className="text-muted-foreground text-sm text-center font-medium">
            A evolução aparece quando os primeiros jogos forem finalizados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="glass overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/[0.08] via-green-500/[0.05] to-transparent border-b border-border/30 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg flex items-center gap-2.5 font-bold">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
                <LineChartIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Evolução
            </CardTitle>
            <div className="inline-flex rounded-lg border border-border/50 bg-muted/30 p-1 self-start">
              <button
                type="button"
                onClick={() => setMode("score")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  mode === "score"
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Pontuação
              </button>
              <button
                type="button"
                onClick={() => setMode("rank")}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  mode === "rank"
                    ? "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Posição
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            {mode === "score"
              ? "Pontos acumulados após cada jogo finalizado."
              : "Posição no ranking após cada jogo (quanto mais baixo, melhor)."}
          </p>
        </CardHeader>
        <CardContent className="pt-4 pb-2 px-2 sm:px-4">
          <div className="h-[280px] w-full sm:h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/40" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  minTickGap={28}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  width={36}
                  allowDecimals={false}
                  reversed={mode === "rank"}
                  domain={mode === "rank" ? [1, members.length] : [0, "auto"]}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border) / 0.5)",
                    background: "hsl(var(--card))",
                    fontSize: 12,
                  }}
                  labelFormatter={(_, payload) => {
                    const item = payload?.[0]?.payload as
                      | { dateLabel?: string; label?: string }
                      | undefined;
                    if (!item) return "";
                    return item.dateLabel === "Início"
                      ? "Início da disputa"
                      : `${item.label} · ${item.dateLabel}`;
                  }}
                  formatter={(value, name) => {
                    const member = members.find((m) => m.user_id === name);
                    const label = firstName(member?.users?.name || "Usuário");
                    const display =
                      mode === "score"
                        ? `${value} pts`
                        : `${value}º`;
                    return [display, label];
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => {
                    const member = members.find((m) => m.user_id === value);
                    const label = firstName(member?.users?.name || "Usuário");
                    return value === userId ? `${label} (você)` : label;
                  }}
                  onClick={(e) => {
                    if (typeof e.dataKey === "string") toggleSeries(e.dataKey);
                  }}
                  wrapperStyle={{ cursor: "pointer", fontSize: 12 }}
                />
                {members.map((member, index) => (
                  <Line
                    key={member.user_id}
                    type="monotone"
                    dataKey={member.user_id}
                    name={member.user_id}
                    stroke={SERIES_COLORS[index % SERIES_COLORS.length]}
                    strokeWidth={member.user_id === userId ? 3 : 2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    hide={hidden.has(member.user_id)}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground text-center pb-2">
            Toque no nome na legenda para mostrar ou ocultar um participante.
          </p>
        </CardContent>
      </Card>

      <Card className="glass overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-500/[0.08] via-green-500/[0.05] to-transparent border-b border-border/30 pb-4">
          <CardTitle className="text-lg flex items-center gap-2.5 font-bold">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Movimentação
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Comparação entre a posição após o 1º jogo e a atual (+ subiu, − caiu).
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {movements.map((movement) => {
              const isYou = movement.userId === userId;
              const DeltaIcon =
                movement.delta > 0
                  ? TrendingUp
                  : movement.delta < 0
                    ? TrendingDown
                    : Minus;
              const deltaColor =
                movement.delta > 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : movement.delta < 0
                    ? "text-red-500"
                    : "text-muted-foreground";

              return (
                <div
                  key={movement.userId}
                  className={`flex items-center gap-3.5 px-5 py-3.5 transition-all ${
                    isYou
                      ? "bg-emerald-500/[0.06] border-l-2 border-l-emerald-400"
                      : "hover:bg-muted/20"
                  }`}
                >
                  <span className="w-7 text-center text-sm font-black text-muted-foreground">
                    {movement.currentRank}º
                  </span>
                  <Avatar className="h-9 w-9 ring-2 ring-border/30 ring-offset-1 ring-offset-background">
                    <AvatarImage
                      src={movement.avatarUrl || undefined}
                      alt={movement.name}
                    />
                    <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400">
                      {movement.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-sm truncate block">
                      {movement.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-medium">
                      Melhor {movement.bestRank}º · Pior {movement.worstRank}º
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 font-bold text-sm ${deltaColor}`}>
                    <DeltaIcon className="w-3.5 h-3.5" />
                    {movement.delta === 0
                      ? "—"
                      : movement.delta > 0
                        ? `+${movement.delta}`
                        : `${movement.delta}`}
                  </div>
                  <div className="text-right w-14">
                    <span className="font-black text-sm">{movement.currentScore}</span>
                    <span className="text-[10px] text-muted-foreground ml-0.5 font-medium">
                      pts
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
