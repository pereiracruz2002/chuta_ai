"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PredictionForm } from "@/components/prediction-form";
import { TeamFlag } from "@/components/team-flag";
import { Clock, CheckCircle2, Radio, RefreshCw, Loader2, CalendarDays, Layers } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MatchListProps {
  matches: any[];
  predictions: any[];
  allPredictions: any[];
  poolId: string;
  userId: string;
}

type SortMode = "stage" | "date";

export function MatchList({ matches, predictions, allPredictions, poolId, userId }: MatchListProps) {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<number>(0);
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const todayRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  const router = useRouter();

  const handleSyncResults = async () => {
    // Rate limit: impedir cliques em menos de 30 segundos
    const timeSinceLastSync = Date.now() - lastSyncTime;
    if (timeSinceLastSync < 30000) {
      const remaining = Math.ceil((30000 - timeSinceLastSync) / 1000);
      setSyncResult(`Aguarde ${remaining}s para buscar novamente.`);
      setTimeout(() => setSyncResult(null), 3000);
      return;
    }

    setSyncing(true);
    setSyncResult(null);

    try {
      const response = await fetch("/api/update-results", {
        headers: {
          "x-manual-trigger": "true",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setSyncResult(`Erro: ${data.error}`);
      } else if (data.updated > 0) {
        setSyncResult(`${data.updated} jogo(s) atualizado(s)!`);
        router.refresh();
      } else {
        setSyncResult(data.message || "Nenhum jogo para atualizar.");
      }
    } catch {
      setSyncResult("Erro de conexão ao buscar resultados.");
    }

    setLastSyncTime(Date.now());
    setSyncing(false);
    setTimeout(() => setSyncResult(null), 5000);
  };

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
  const groupedByStage = matches.reduce(
    (acc: Record<string, any[]>, match: any) => {
      if (!acc[match.stage]) acc[match.stage] = [];
      acc[match.stage].push(match);
      return acc;
    },
    {} as Record<string, any[]>
  );

  // Group matches by date (sorted chronologically)
  const groupedByDate = [...matches]
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .reduce(
      (acc: Record<string, any[]>, match: any) => {
        const dateKey = new Intl.DateTimeFormat("pt-BR", {
          timeZone: "America/Sao_Paulo",
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(match.starts_at));
        const formattedKey = dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
        if (!acc[formattedKey]) acc[formattedKey] = [];
        acc[formattedKey].push(match);
        return acc;
      },
      {} as Record<string, any[]>
    );

  const grouped = sortMode === "stage" ? groupedByStage : groupedByDate;

  // Calcula a chave de hoje no mesmo formato usado pelo agrupamento por data
  const todayKey = (() => {
    const today = new Date();
    const dateKey = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(today);
    return dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
  })();

  // Verifica se há uma data salva no sessionStorage (após salvar um palpite)
  const savedMatchDate = (() => {
    if (typeof window === "undefined") return null;
    const saved = sessionStorage.getItem("scrollToMatchDate");
    if (saved) {
      sessionStorage.removeItem("scrollToMatchDate");
      const dateKey = new Intl.DateTimeFormat("pt-BR", {
        timeZone: "America/Sao_Paulo",
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(new Date(saved));
      return dateKey.charAt(0).toUpperCase() + dateKey.slice(1);
    }
    return null;
  })();

  // Encontra a chave mais próxima (data salva, hoje, ou o próximo dia com jogos)
  const scrollTargetKey = (() => {
    if (sortMode !== "date") return null;
    const keys = Object.keys(groupedByDate);
    // Se há uma data salva do jogo recém-editado, usa ela
    if (savedMatchDate && keys.includes(savedMatchDate)) return savedMatchDate;
    // Se existe hoje exatamente, usa
    if (keys.includes(todayKey)) return todayKey;
    // Senão, encontra o próximo dia com jogos (primeiro dia futuro)
    const todayTime = new Date().setHours(0, 0, 0, 0);
    for (const key of keys) {
      const firstMatch = groupedByDate[key]?.[0];
      if (firstMatch) {
        const matchDate = new Date(firstMatch.starts_at).getTime();
        if (matchDate >= todayTime) return key;
      }
    }
    return null;
  })();

  // Auto-scroll para os jogos de hoje/próximos ao montar o componente
  useEffect(() => {
    if (sortMode === "date" && todayRef.current && !hasScrolled.current) {
      hasScrolled.current = true;
      // Pequeno delay para garantir que o DOM está renderizado
      setTimeout(() => {
        todayRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [sortMode, scrollTargetKey]);

  const getPrediction = (matchId: string) =>
    predictions.find((p: any) => p.match_id === matchId);

  const getMatchPredictions = (matchId: string) =>
    allPredictions.filter((p: any) => p.match_id === matchId);

  const isMatchStarted = (startsAt: string) => {
    if (!now) return false;
    return new Date(startsAt) <= now;
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const formatter = new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const day = parts.find(p => p.type === "day")?.value;
    const month = parts.find(p => p.type === "month")?.value;
    const hours = parts.find(p => p.type === "hour")?.value;
    const minutes = parts.find(p => p.type === "minute")?.value;
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
      {/* Botão Buscar Resultados - visível para todos os participantes */}
      <div className="flex flex-col items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncResults}
          disabled={syncing}
          className="cursor-pointer gap-1.5 border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold"
        >
          {syncing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          {syncing ? "Buscando..." : "Buscar resultados"}
        </Button>

        {syncResult && (
          <div className={`rounded-lg px-4 py-2 text-center text-sm font-medium ${
            syncResult.startsWith("Erro")
              ? "bg-destructive/10 border border-destructive/20 text-destructive"
              : syncResult.includes("atualizado")
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-muted/50 border border-border/50 text-muted-foreground"
          }`}>
            {syncResult}
          </div>
        )}
      </div>

      {/* Toggle de ordenação */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center rounded-lg border border-border/50 bg-muted/30 p-1 gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortMode("stage")}
            className={`cursor-pointer gap-1.5 text-xs font-semibold rounded-md px-3 py-1.5 h-auto transition-all ${
              sortMode === "stage"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Por Grupo
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortMode("date")}
            className={`cursor-pointer gap-1.5 text-xs font-semibold rounded-md px-3 py-1.5 h-auto transition-all ${
              sortMode === "date"
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Por Data
          </Button>
        </div>
      </div>

      {Object.entries(grouped).map(([stage, stageMatches]) => (
        <div
          key={stage}
          className="space-y-4"
          ref={sortMode === "date" && stage === scrollTargetKey ? todayRef : undefined}
        >
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
                      {prediction && !started && !match.finished ? (
                        <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-center gap-3">
                          <span className="text-xs text-muted-foreground font-medium">Seu palpite:</span>
                          <span className="font-bold text-sm bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-lg text-emerald-700 dark:text-emerald-300">
                            {prediction.home_prediction} x {prediction.away_prediction}
                          </span>
                        </div>
                      ) : (started || match.finished) ? (
                        (() => {
                          const matchPredictions = getMatchPredictions(match.id);
                          if (matchPredictions.length === 0) return null;
                          return (
                            <div className="mt-4 pt-3 border-t border-border/30">
                              <p className="text-xs text-muted-foreground font-medium text-center mb-2">
                                Palpites dos participantes:
                              </p>
                              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                {matchPredictions.map((p: any) => (
                                  <div
                                    key={p.id}
                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${
                                      p.user_id === userId
                                        ? "bg-emerald-500/10 border border-emerald-500/20"
                                        : "bg-muted/30"
                                    }`}
                                  >
                                    <span className={`font-medium truncate max-w-[120px] ${
                                      p.user_id === userId ? "text-emerald-700 dark:text-emerald-300" : ""
                                    }`}>
                                      {p.users?.name || "Usuário"}
                                      {p.user_id === userId && " (você)"}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold">
                                        {p.home_prediction} x {p.away_prediction}
                                      </span>
                                      {match.finished && (
                                        <Badge
                                          variant={p.points > 0 ? "default" : "secondary"}
                                          className={`text-[10px] font-bold px-1.5 py-0 ${
                                            p.points >= 7
                                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                              : p.points > 0
                                              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                                              : "bg-muted/50"
                                          }`}
                                        >
                                          +{p.points}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()
                      ) : !started && !match.finished ? (
                        <div className="mt-4 pt-3 border-t border-border/30 text-center">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                            Toque para registrar seu palpite
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
