import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapTeamName } from "@/lib/team-mapping";

// Supabase admin client (usa service role key para bypass de RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

// Status da API-Football que indicam jogo finalizado
const FINISHED_STATUSES = ["FT", "AET", "PEN"];

// Liga da Copa do Mundo na API-Football
const WORLD_CUP_LEAGUE_ID = 1;
const WORLD_CUP_SEASON = 2026;

interface ApiFootballFixture {
  fixture: {
    id: number;
    status: {
      short: string;
      long: string;
    };
  };
  teams: {
    home: { name: string };
    away: { name: string };
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: { home: number | null; away: number | null };
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}

/**
 * Obtém o placar correto considerando as regras:
 * - 90min + prorrogação (extra time) contam
 * - Penaltis NÃO contam como gols
 *
 * Na API-Football, `goals.home/away` já representa exatamente isso:
 * o placar final incluindo prorrogação, mas SEM penaltis.
 */
function getMatchScore(fixture: ApiFootballFixture): {
  home: number;
  away: number;
} | null {
  const status = fixture.fixture.status.short;

  if (!FINISHED_STATUSES.includes(status)) {
    return null; // Jogo ainda não terminou
  }

  // goals.home/away = placar final (90min + prorrogação, SEM penaltis)
  if (fixture.goals.home !== null && fixture.goals.away !== null) {
    return { home: fixture.goals.home, away: fixture.goals.away };
  }

  // Fallback: usar score.extratime se disponível, senão score.fulltime
  if (
    fixture.score.extratime.home !== null &&
    fixture.score.extratime.away !== null
  ) {
    return {
      home: fixture.score.extratime.home,
      away: fixture.score.extratime.away,
    };
  }

  if (
    fixture.score.fulltime.home !== null &&
    fixture.score.fulltime.away !== null
  ) {
    return {
      home: fixture.score.fulltime.home,
      away: fixture.score.fulltime.away,
    };
  }

  return null;
}

async function fetchFixturesFromApi(): Promise<ApiFootballFixture[]> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    throw new Error("API_FOOTBALL_KEY não configurada");
  }

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?league=${WORLD_CUP_LEAGUE_ID}&season=${WORLD_CUP_SEASON}`,
    {
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 0 },
    }
  );

  if (!response.ok) {
    throw new Error(`API-Football retornou status ${response.status}`);
  }

  const data = await response.json();

  if (data.errors && Object.keys(data.errors).length > 0) {
    throw new Error(
      `API-Football erro: ${JSON.stringify(data.errors)}`
    );
  }

  return data.response || [];
}

export async function GET(request: Request) {
  try {
    // Verificar autenticação via CRON_SECRET
    // O Vercel Cron envia automaticamente o header Authorization com o CRON_SECRET
    // Para chamadas manuais do admin, aceitar se não houver CRON_SECRET configurado
    // ou se o header "x-manual-trigger" estiver presente (chamada do painel admin)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isManualTrigger = request.headers.get("x-manual-trigger") === "true";

    if (cronSecret && !isManualTrigger) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: "Não autorizado" },
          { status: 401 }
        );
      }
    }

    const supabase = getSupabaseAdmin();

    // Buscar jogos que já começaram mas não foram finalizados
    const { data: pendingMatches, error: dbError } = await supabase
      .from("matches")
      .select("*")
      .eq("finished", false)
      .lt("starts_at", new Date().toISOString());

    if (dbError) {
      throw new Error(`Erro ao buscar jogos: ${dbError.message}`);
    }

    // Se não há jogos pendentes, não precisa chamar a API
    if (!pendingMatches || pendingMatches.length === 0) {
      return NextResponse.json({
        message: "Nenhum jogo pendente para atualizar",
        updated: 0,
      });
    }

    // Buscar fixtures da API-Football
    const fixtures = await fetchFixturesFromApi();

    let updatedCount = 0;
    const updates: string[] = [];

    for (const match of pendingMatches) {
      // Encontrar o fixture correspondente na API-Football
      const fixture = fixtures.find((f) => {
        const apiHome = mapTeamName(f.teams.home.name);
        const apiAway = mapTeamName(f.teams.away.name);
        return apiHome === match.home_team && apiAway === match.away_team;
      });

      if (!fixture) {
        continue; // Fixture não encontrado na API
      }

      // Verificar se o jogo terminou e pegar o placar
      const score = getMatchScore(fixture);
      if (!score) {
        continue; // Jogo ainda não terminou
      }

      // Atualizar o resultado no banco
      const { error: updateError } = await supabase
        .from("matches")
        .update({
          home_score: score.home,
          away_score: score.away,
          finished: true,
        })
        .eq("id", match.id);

      if (!updateError) {
        updatedCount++;
        updates.push(
          `${match.home_team} ${score.home} x ${score.away} ${match.away_team}`
        );
      }
    }

    return NextResponse.json({
      message: `Atualização concluída`,
      updated: updatedCount,
      total_pending: pendingMatches.length,
      results: updates,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao atualizar resultados:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
