"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TeamFlag } from "@/components/team-flag";
import { ArrowLeft, CheckCircle2, Clock, RefreshCw, Loader2 } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface AdminMatchListProps {
  matches: any[];
  poolId: string;
}

export function AdminMatchList({ matches, poolId }: AdminMatchListProps) {
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const router = useRouter();

  const handleSyncResults = async () => {
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
        setSyncResult(data.message || "Nenhum jogo atualizado.");
      }
    } catch {
      setSyncResult("Erro de conexão ao buscar resultados.");
    }

    setSyncing(false);
    setTimeout(() => setSyncResult(null), 5000);
  };

  // Group matches by stage
  const grouped = matches.reduce(
    (acc: Record<string, any[]>, match: any) => {
      if (!acc[match.stage]) acc[match.stage] = [];
      acc[match.stage].push(match);
      return acc;
    },
    {} as Record<string, any[]>
  );

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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/pools/${poolId}`)}
          className="cursor-pointer gap-1.5 border-border/50 hover:border-emerald-500/30 hover:bg-emerald-500/5 font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Voltar ao Bolao
        </Button>

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
      </div>

      {syncResult && (
        <div className={`rounded-lg p-3 text-center text-sm font-medium ${
          syncResult.startsWith("Erro")
            ? "bg-destructive/10 border border-destructive/20 text-destructive"
            : syncResult.includes("atualizado")
            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
            : "bg-muted/50 border border-border/50 text-muted-foreground"
        }`}>
          {syncResult}
        </div>
      )}

      {Object.entries(grouped).map(([stage, stageMatches]) => (
        <div key={stage} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
            <span className="font-black text-[11px] text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              {stage}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/40 to-transparent" />
          </div>
          <div className="space-y-3">
            {(stageMatches as any[]).map((match: any) => (
              <div key={match.id}>
                <Card
                  className={`glass cursor-pointer transition-all duration-300 ${
                    editingMatch === match.id ? "ring-2 ring-emerald-400 glow-green-sm" : "hover:border-emerald-500/20"
                  }`}
                  onClick={() =>
                    setEditingMatch(editingMatch === match.id ? null : match.id)
                  }
                >
                  <CardContent className="py-4 px-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 flex-1">
                        <TeamFlag team={match.home_team} size={28} />
                        <span className="font-bold text-sm">{match.home_team}</span>
                      </div>
                      <div className="text-center px-3">
                        {match.finished ? (
                          <span className="font-black text-lg">
                            {match.home_score} : {match.away_score}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium">{formatDate(match.starts_at)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2.5 flex-1 justify-end">
                        <span className="font-bold text-sm">{match.away_team}</span>
                        <TeamFlag team={match.away_team} size={28} />
                      </div>
                      <Badge
                        variant={match.finished ? "secondary" : "outline"}
                        className={`ml-3 text-[10px] font-bold gap-1 ${
                          match.finished
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : "border-border/50"
                        }`}
                      >
                        {match.finished ? <CheckCircle2 className="w-3 h-3" /> : null}
                        {match.finished ? "FIM" : "Pendente"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {editingMatch === match.id && (
                  <AdminMatchForm
                    match={match}
                    onClose={() => setEditingMatch(null)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface AdminMatchFormProps {
  match: any;
  onClose: () => void;
}

function AdminMatchForm({ match, onClose }: AdminMatchFormProps) {
  const [homeScore, setHomeScore] = useState(
    match.home_score?.toString() || ""
  );
  const [awayScore, setAwayScore] = useState(
    match.away_score?.toString() || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSave = async (finished: boolean) => {
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      setError("Informe placares validos.");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();

    const { error: updateError } = await supabase
      .from("matches")
      .update({
        home_score: home,
        away_score: away,
        finished,
      })
      .eq("id", match.id);

    if (updateError) {
      setError("Erro ao atualizar resultado.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
    router.refresh();
  };

  return (
    <Card className="mt-3 border-emerald-500/20 glow-green-sm bg-gradient-to-b from-emerald-500/[0.05] to-transparent glass">
      <CardContent className="py-5 px-5">
        <div className="space-y-5">
          <p className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Atualizar resultado
          </p>
          <div className="flex items-center justify-center gap-5">
            <div className="flex flex-col items-center gap-1.5">
              <TeamFlag team={match.home_team} size={32} />
              <span className="text-[10px] font-bold text-muted-foreground">{match.home_team}</span>
            </div>
            <Input
              type="number"
              min="0"
              max="20"
              className="w-16 h-14 text-center text-2xl font-black bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              placeholder="0"
            />
            <span className="text-muted-foreground font-black text-2xl">:</span>
            <Input
              type="number"
              min="0"
              max="20"
              className="w-16 h-14 text-center text-2xl font-black bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              placeholder="0"
            />
            <div className="flex flex-col items-center gap-1.5">
              <TeamFlag team={match.away_team} size={32} />
              <span className="text-[10px] font-bold text-muted-foreground">{match.away_team}</span>
            </div>
          </div>
          {error && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-2">
              <p className="text-xs text-destructive text-center font-medium">{error}</p>
            </div>
          )}
          <div className="flex justify-center gap-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} className="cursor-pointer font-semibold">
              Cancelar
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() => handleSave(false)}
              className="cursor-pointer font-semibold border-border/50"
            >
              Salvar parcial
            </Button>
            <Button
              size="sm"
              disabled={loading}
              onClick={() => handleSave(true)}
              className="cursor-pointer font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-500/20"
            >
              Finalizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
