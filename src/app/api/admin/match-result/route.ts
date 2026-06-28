import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Variáveis SUPABASE não configuradas no servidor.");
  }
  return createClient(url, serviceKey);
}

function calculatePoints(
  homePred: number,
  awayPred: number,
  homeScore: number,
  awayScore: number
): number {
  // Placar exato
  if (homePred === homeScore && awayPred === awayScore) return 10;

  const predDiff = homePred - awayPred;
  const actualDiff = homeScore - awayScore;

  // Vencedor/empate correto?
  const correctOutcome =
    (predDiff > 0 && actualDiff > 0) ||
    (predDiff < 0 && actualDiff < 0) ||
    (predDiff === 0 && actualDiff === 0);

  if (!correctOutcome) return 0;

  // Saldo de gols correto
  if (predDiff === actualDiff) return 7;

  // Acertou gols de um time
  if (homePred === homeScore || awayPred === awayScore) return 5;

  // Apenas vencedor correto
  return 3;
}

export async function POST(request: NextRequest) {
  try {
    // Autenticar
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { match_id, home_score, away_score, finished, penalty_winner } = body;

    if (!match_id || home_score === undefined || away_score === undefined) {
      return NextResponse.json(
        { error: "Dados incompletos." },
        { status: 400 }
      );
    }

    const home = Number(home_score);
    const away = Number(away_score);

    if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
      return NextResponse.json(
        { error: "Placares inválidos." },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();

    // Atualizar o resultado do jogo
    const { error: updateError } = await admin
      .from("matches")
      .update({
        home_score: home,
        away_score: away,
        finished: finished ?? true,
        penalty_winner: penalty_winner || null,
      })
      .eq("id", match_id);

    if (updateError) {
      return NextResponse.json(
        { error: `Erro ao atualizar jogo: ${updateError.message}` },
        { status: 500 }
      );
    }

    // Se marcou como finalizado, calcular pontos de todos os palpites
    if (finished) {
      // Buscar todos os palpites deste jogo
      const { data: predictions } = await admin
        .from("predictions")
        .select("id, home_prediction, away_prediction, pool_id, user_id")
        .eq("match_id", match_id);

      if (predictions && predictions.length > 0) {
        // Calcular e atualizar pontos de cada palpite
        for (const pred of predictions) {
          const points = calculatePoints(
            pred.home_prediction,
            pred.away_prediction,
            home,
            away
          );

          await admin
            .from("predictions")
            .update({ points, updated_at: new Date().toISOString() })
            .eq("id", pred.id);
        }

        // Recalcular score total de cada membro nos bolões afetados
        const affectedPools = [...new Set(predictions.map((p) => p.pool_id))];

        for (const poolId of affectedPools) {
          // Buscar todos os membros do bolão
          const { data: members } = await admin
            .from("pool_members")
            .select("user_id")
            .eq("pool_id", poolId);

          if (members) {
            for (const member of members) {
              // Somar todos os pontos do membro neste bolão
              const { data: memberPreds } = await admin
                .from("predictions")
                .select("points")
                .eq("pool_id", poolId)
                .eq("user_id", member.user_id);

              const totalScore = memberPreds?.reduce(
                (sum, p) => sum + (p.points || 0),
                0
              ) || 0;

              await admin
                .from("pool_members")
                .update({ score: totalScore })
                .eq("pool_id", poolId)
                .eq("user_id", member.user_id);
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro desconhecido";
    console.error("Admin match-result error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
