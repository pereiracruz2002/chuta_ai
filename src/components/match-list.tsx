"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PredictionForm } from "@/components/prediction-form";
import { TeamFlag } from "@/components/team-flag";
import { Clock, CheckCircle2, Radio } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MatchListProps {
  matches: any[];
  predictions: any[];
  poolId: string;
  userId: string;
}

export function MatchList({ matches, predictions, poolId, userId }: MatchListProps) {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    // Atualiza a cada 30 segundos para bloquear palpites quando o jogo começar
    const interval = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fecha o formulário automaticamente se o jogo selecionado já começou
  useEffect(() => {
    if (selectedMatch && now) {
      const match = matches.find((m: any) => m.id === selectedMatch);
      if (match && new Date(match.starts_at) <= now) {
        setSelectedMatch(null);
      }
    }
  }, [now, selectedMatch, matches]);

  // Group matches by stage
  const grouped = matches.reduce(
    (acc: Record<string, any[]>, match: any) => {
      if (!acc[match.stage]) acc[match.stage] = [];
      acc[match.stage].push(match);
      return acc;
    },
    {} as Record<string, any[]>
  );

  const getPrediction = (matchId: string) =>
    predictions.find((p: any) => p.match_id === matchId);

  const isMatchStarted = (startsAt: string) => {
    if (!now) return false;
    return new Date(startsAt) <= now;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const hours = String(d.getUTCHours()).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${day}/${month} - ${hours}:${minutes}`;
  };

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground font-medium">Nenhum jogo encontrado.</p>
        <p className="text-xs text-muted-foreground mt-1">Verifique se os jogos foram inseridos no banco de dados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {Object.entries(grouped).map(([stage, stageMatches]) => (
        <div key={stage} className="space-y-4">
          {/* Stage divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
            <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em] px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {stage}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/40 to-transparent" />
          </div>

          <div className="space-y-3">
            {(stageMatches as any[]).map((match: any) => {
              const prediction = getPrediction(match.id);
              const started = isMatchStarted(match.starts_at);

              return (
                <div key={match.id}>
                  <Card
                    className={`glass transition-all duration-300 ${
                      selectedMatch === match.id
                        ? "ring-2 ring-emerald-400 glow-green-sm"
                        : "hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/5"
                    } ${!started && !match.finished ? "cursor-pointer" : ""}`}
                    onClick={() =>
                      !started && !match.finished && setSelectedMatch(
                        selectedMatch === match.id ? null : match.id
                      )
                    }
                  >
                    <CardContent className="py-5 px-5">
                      {/* Match content */}
                      <div className="flex items-center justify-between gap-3">
                        {/* Home team */}
                        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                          <TeamFlag team={match.home_team} size={40} />
                          <span className="font-bold text-sm text-center leading-tight truncate w-full">
                            {match.home_team}
                          </span>
                        </div>

                        {/* Score / VS */}
                        <div className="flex flex-col items-center gap-1.5 px-4">
                          {match.finished ? (
                            <div className="flex items-center gap-2">
                              <span className="text-3xl font-black">{match.home_score}</span>
                              <span className="text-muted-foreground text-xl font-bold">:</span>
                              <span className="text-3xl font-black">{match.away_score}</span>
                            </div>
                          ) : started ? (
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-bold text-muted-foreground">-</span>
                              <span className="text-muted-foreground text-base">:</span>
                              <span className="text-2xl font-bold text-muted-foreground">-</span>
                            </div>
                          ) : (
                            <span className="text-sm font-black text-muted-foreground bg-muted/50 px-4 py-1.5 rounded-full border border-border/30">
                              VS
                            </span>
                          )}
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium">
                              {formatDate(match.starts_at)}
                            </span>
                          </div>
                          {match.finished && (
                            <Badge variant="secondary" className="text-xs px-2 py-0.5 gap-1 bg-muted/50">
                              <CheckCircle2 className="w-3 h-3" />
                              Encerrado
                            </Badge>
                          )}
                          {!started && !match.finished && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold">
                              Aberto
                            </Badge>
                          )}
                          {started && !match.finished && (
                            <Badge className="text-xs px-2 py-0.5 gap-1 bg-red-500/15 text-red-400 border border-red-500/30 font-bold">
                              <Radio className="w-3 h-3 animate-pulse" />
                              Ao vivo
                            </Badge>
                          )}
                        </div>

                        {/* Away team */}
                        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
                          <TeamFlag team={match.away_team} size={40} />
                          <span className="font-bold text-sm text-center leading-tight truncate w-full">
                            {match.away_team}
                          </span>
                        </div>
                      </div>

                      {/* Prediction info */}
                      {prediction ? (
                        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-center gap-3">
                          <span className="text-xs text-muted-foreground font-medium">Seu palpite:</span>
                          <span className="font-bold text-sm bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg text-emerald-700 dark:text-emerald-300">
                            {prediction.home_prediction} x {prediction.away_prediction}
                          </span>
                          {match.finished && (
                            <Badge
                              variant={prediction.points > 0 ? "default" : "secondary"}
                              className={`text-[10px] font-bold ${
                                prediction.points >= 7
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : prediction.points > 0
                                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                  : "bg-muted/50"
                              }`}
                            >
                              +{prediction.points} pts
                            </Badge>
                          )}
                        </div>
                      ) : !started && !match.finished ? (
                        <div className="mt-4 pt-3 border-t border-border/30 text-center">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            Toque para registrar seu palpite
                          </span>
                        </div>
                      ) : started && !match.finished ? (
                        <div className="mt-4 pt-3 border-t border-border/30 text-center">
                          <span className="text-xs text-red-500 dark:text-red-400 font-semibold">
                            Palpites encerrados para este jogo
                          </span>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  {selectedMatch === match.id && !started && (
                    <PredictionForm
                      match={match}
                      prediction={prediction || null}
                      poolId={poolId}
                      userId={userId}
                      onClose={() => setSelectedMatch(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
