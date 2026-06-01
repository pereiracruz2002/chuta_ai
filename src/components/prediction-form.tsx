"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
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
  userId,
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
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica se o jogo já começou antes de enviar
    if (new Date(match.starts_at) <= new Date()) {
      setError("Este jogo já começou. Não é mais possível registrar ou alterar palpites.");
      return;
    }

    const homeValue = homeScore.trim() === "" ? "0" : homeScore.trim();
    const awayValue = awayScore.trim() === "" ? "0" : awayScore.trim();
    const home = Number(homeValue);
    const away = Number(awayValue);

    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
      setError("Informe placares validos (numeros inteiros >= 0).");
      return;
    }

    setLoading(true);
    setError("");
    const supabase = createClient();

    // Verifica sessão antes de enviar
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Sessão expirada. Recarregue a página e tente novamente.");
      setLoading(false);
      return;
    }

    // Verifica se o match existe e está no futuro (mesma checagem que a RLS policy faz)
    const { data: matchCheck } = await supabase
      .from("matches")
      .select("id, starts_at")
      .eq("id", match.id)
      .single();

    if (!matchCheck) {
      setError("Jogo não encontrado. Recarregue a página.");
      setLoading(false);
      return;
    }

    if (new Date(matchCheck.starts_at) <= new Date()) {
      setError("Este jogo já começou. Não é mais possível registrar palpites.");
      setLoading(false);
      return;
    }

    if (prediction) {
      const { error: updateError } = await supabase
        .from("predictions")
        .update({
          home_prediction: home,
          away_prediction: away,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prediction.id);

      if (updateError) {
        if (updateError.code === "42501" || updateError.message?.includes("policy")) {
          // Verifica se realmente é o jogo que começou ou se é problema de auth
          if (new Date(match.starts_at) <= new Date()) {
            setError("Este jogo já começou. Não é mais possível alterar palpites.");
          } else {
            setError("Erro de permissão. Recarregue a página e tente novamente.");
          }
        } else {
          setError("Erro ao atualizar palpite.");
        }
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("predictions")
        .insert({
          user_id: user.id,
          pool_id: poolId,
          match_id: match.id,
          home_prediction: home,
          away_prediction: away,
        });

      if (insertError) {
        console.error("Prediction insert error:", JSON.stringify(insertError));
        if (insertError.code === "42501" || insertError.message?.includes("policy")) {
          if (new Date(match.starts_at) <= new Date()) {
            setError("Este jogo já começou. Não é mais possível registrar palpites.");
          } else {
            setError(`Erro de permissão (${insertError.code}). Tente fazer logout e login novamente.`);
          }
        } else if (insertError.code === "23505") {
          setError("Você já tem um palpite para este jogo. Recarregue a página.");
        } else {
          setError(`Erro ao salvar palpite (${insertError.code}: ${insertError.message}).`);
        }
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onClose();
    router.refresh();
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
