"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, Trophy, TrendingUp, Equal, X } from "lucide-react";

const rules = [
  {
    label: "Placar exato",
    points: 10,
    description: "Acertou o placar completo do jogo",
    icon: Target,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Vencedor + saldo de gols",
    points: 7,
    description: "Acertou quem venceu e a diferença de gols",
    icon: Trophy,
    color: "text-blue-500",
    bg: "bg-blue-500/10 border-blue-500/20",
  },
  {
    label: "Vencedor + gols de um time",
    points: 5,
    description: "Acertou quem venceu e os gols de um dos times",
    icon: TrendingUp,
    color: "text-violet-500",
    bg: "bg-violet-500/10 border-violet-500/20",
  },
  {
    label: "Apenas vencedor ou empate",
    points: 3,
    description: "Acertou apenas o resultado (vitória/empate)",
    icon: Equal,
    color: "text-amber-500",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  {
    label: "Errou tudo",
    points: 0,
    description: "Não acertou nenhum critério",
    icon: X,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
  },
];

export function ScoringRules() {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-black text-foreground">
          Regras de Pontuação
        </h3>
        <p className="text-sm text-muted-foreground">
          Os pontos são calculados automaticamente após o resultado ser registrado.
        </p>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => {
          const Icon = rule.icon;
          return (
            <Card key={rule.label} className={`glass border ${rule.bg}`}>
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${rule.bg}`}>
                    <Icon className={`w-5 h-5 ${rule.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{rule.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {rule.description}
                    </p>
                  </div>
                  <div className={`text-2xl font-black ${rule.color}`}>
                    {rule.points > 0 ? `+${rule.points}` : rule.points}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="glass border border-border/50">
        <CardContent className="py-4 px-5">
          <div className="space-y-3">
            <p className="font-bold text-sm text-foreground">Como funciona?</p>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">1.</span>
                Registre seu palpite antes do início do jogo.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">2.</span>
                Após o jogo terminar, o admin registra o resultado.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">3.</span>
                Os pontos são calculados automaticamente com base na melhor correspondência.
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">4.</span>
                O ranking é atualizado em tempo real.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border border-amber-500/20 bg-amber-500/5">
        <CardContent className="py-4 px-5">
          <div className="space-y-2">
            <p className="font-bold text-sm text-amber-600 dark:text-amber-400">
              Exemplos
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Resultado: Brasil 2 x 1 Alemanha</span>
              </div>
              <div className="pl-3 space-y-1 border-l-2 border-amber-500/30">
                <p>Palpite <span className="font-bold text-foreground">2 x 1</span> → <span className="font-bold text-emerald-500">+10 pts</span> (placar exato)</p>
                <p>Palpite <span className="font-bold text-foreground">3 x 2</span> → <span className="font-bold text-blue-500">+7 pts</span> (vencedor + saldo)</p>
                <p>Palpite <span className="font-bold text-foreground">2 x 0</span> → <span className="font-bold text-violet-500">+5 pts</span> (vencedor + gols mandante)</p>
                <p>Palpite <span className="font-bold text-foreground">1 x 0</span> → <span className="font-bold text-amber-500">+3 pts</span> (apenas vencedor)</p>
                <p>Palpite <span className="font-bold text-foreground">0 x 2</span> → <span className="font-bold text-red-500">0 pts</span> (errou tudo)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
