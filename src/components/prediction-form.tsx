"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { TeamFlag } from "@/components/team-flag";
import { Target } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PredictionFormProps {
  match: any;
  prediction: any | null;
  poolId: string;
  userId: string;
  onClose: () => void;
}

export function PredictionForm({
  match,
  prediction,
  poolId,
  onClose,
}: PredictionFormProps) {
  const [homeScore, setHomeScore] = useState(
    prediction?.home_prediction?.toString() || ""
  );
  const [awayScore, setAwayScore] = useState(
    prediction?.away_prediction?.toString() || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se o jogo já começou antes de enviar
    if (new Date(match.starts_at) <= new Date()) {
      setError("Este jogo já começou. Não é mais possível registrar ou alterar palpites.");
      return;
    }

    const homeValue = homeScore.replace(/[^0-9]/g, "");
    const awayValue = awayScore.replace(/[^0-9]/g, "");
    const home = homeValue === "" ? 0 : parseInt(homeValue, 10);
    const away = awayValue === "" ? 0 : parseInt(awayValue, 10);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0 || home > 20 || away > 20) {
      setError("Informe placares validos (0 a 20).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pool_id: poolId,
          match_id: match.id,
          home_prediction: home,
          away_prediction: away,
          prediction_id: prediction?.id || null,
        }),
      });

      const data = await res.json();
      console.log("Prediction API response:", data);

      if (!res.ok) {
        setError(data.error || "Erro ao salvar palpite.");
        setLoading(false);
        return;
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
      return;
    }

    setLoading(false);
    onClose();
    // Salva a data do jogo no sessionStorage para que, após o reload,
    // a página volte para o mesmo dia do jogo salvo
    sessionStorage.setItem("scrollToMatchDate", match.starts_at);
    window.location.reload();
  };

  return (
    <Card className="mt-3 border-emerald-500/20 glow-green-sm bg-gradient-to-b from-emerald-500/[0.05] to-transparent glass">
      <CardContent className="py-5 px-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center justify-center gap-2">
            <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <p className="text-center text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              {prediction ? "Editar palpite" : "Registrar palpite"}
            </p>
          </div>
          <div className="flex items-center justify-center gap-5">
            <div className="flex flex-col items-center gap-1.5">
              <TeamFlag team={match.home_team} size={32} />
              <span className="text-[10px] font-bold text-muted-foreground">{match.home_team}</span>
            </div>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              className="w-16 h-14 text-center text-2xl font-black bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
            />
            <span className="text-muted-foreground font-black text-2xl">:</span>
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={2}
              className="w-16 h-14 text-center text-2xl font-black bg-background/50 border-border/50 focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-xl"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value.replace(/[^0-9]/g, ""))}
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
              type="submit"
              size="sm"
              disabled={loading}
              className="cursor-pointer font-bold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-lg shadow-green-500/20 px-6"
            >
              {loading ? "Salvando..." : prediction ? "Atualizar" : "Salvar Palpite"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
