import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapTeamName } from "@/lib/team-mapping";

// Supabase admin client (usa service role key para bypass de RLS)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

// Status que indicam jogo finalizado
const FINISHED_STATUSES_API_FOOTBALL = ["FT", "AET", "PEN"];
const FINISHED_STATUS_FOOTBALL_DATA = "FINISHED";

// ==========================================
// PROVIDER 1: API-Football (api-sports.io)
// ==========================================
interface ApiFootballFixture {
  fixture: {
    id: number;
    status: { short: string };
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
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
  };
}

async function fetchFromApiFootball(): Promise<
  { home_team: string; away_team: string; home_score: number; away_score: number }[]
> {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) return [];

  const response = await fetch(
    `https://v3.football.api-sports.io/fixtures?league=1&season=2026`,
    {
      headers: { "x-apisports-key": apiKey },
      cache: "no-store",
    }
  );

  if (!response.ok) return [];

  const data = await response.json();
  const fixtures: ApiFootballFixture[] = data.response || [];
  const results: { home_team: string; away_team: string; home_score: number; away_score: number }[] = [];

  for (const f of fixtures) {
    if (!FINISHED_STATUSES_API_FOOTBALL.includes(f.fixture.status.short)) continue;
    if (f.goals.home === null || f.goals.away === null) continue;

    results.push({
      home_team: mapTeamName(f.teams.home.name),
      away_team: mapTeamName(f.teams.away.name),
      home_score: f.goals.home,
      away_score: f.goals.away,
    });
  }

  return results;
}

// ==========================================
// PROVIDER 2: football-data.org (gratuita)
// Registre-se em https://www.football-data.org/ para obter token grátis
// ==========================================
interface FootballDataMatch {
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
}

async function fetchFromFootballData(): Promise<{
  results: { home_team: string; away_team: string; home_score: number; away_score: number }[];
  debug?: string;
}> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return { results: [] };

  // Tentar World Cup 2026 na football-data.org
  // Possíveis códigos: WC (genérico), ou ID numérico
  const endpoints = [
    "https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED",
    "https://api.football-data.org/v4/competitions/2000/matches?status=FINISHED",
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url, {
        headers: { "X-Auth-Token": apiKey },
        cache: "no-store",
      });

      if (!response.ok) {
        console.log(`football-data.org ${url} retornou ${response.status}`);
        continue;
      }

      const data = await response.json();
      const matches: FootballDataMatch[] = data.matches || [];

      if (matches.length === 0) continue;

      const results: { home_team: string; away_team: string; home_score: number; away_score: number }[] = [];

      for (const m of matches) {
        if (m.status !== FINISHED_STATUS_FOOTBALL_DATA) continue;
        if (m.score.fullTime.home === null || m.score.fullTime.away === null) continue;

        results.push({
          home_team: mapTeamName(m.homeTeam.name),
          away_team: mapTeamName(m.awayTeam.name),
          home_score: m.score.fullTime.home,
          away_score: m.score.fullTime.away,
        });
      }

      if (results.length > 0) {
        return { results };
      }
    } catch (e) {
      console.error(`Erro ao buscar ${url}:`, e);
    }
  }

  return { results: [], debug: "football-data.org não retornou jogos finalizados" };
}

// ==========================================
// ROUTE HANDLER
// ==========================================
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const isManualTrigger = request.headers.get("x-manual-trigger") === "true";

    if (cronSecret && !isManualTrigger) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
      }
    }

    const supabase = getSupabaseAdmin();

    // Buscar jogos pendentes (já começaram mas não finalizados)
    const { data: pendingMatches, error: dbError } = await supabase
      .from("matches")
      .select("*")
      .eq("finished", false)
      .lt("starts_at", new Date().toISOString());

    if (dbError) {
      throw new Error(`Erro ao buscar jogos: ${dbError.message}`);
    }

    if (!pendingMatches || pendingMatches.length === 0) {
      return NextResponse.json({
        message: "Nenhum jogo pendente para atualizar",
        updated: 0,
      });
    }

    // Tentar buscar resultados de APIs disponíveis
    let finishedResults = await fetchFromApiFootball();
    let debugInfo = "";

    if (finishedResults.length === 0) {
      const footballData = await fetchFromFootballData();
      finishedResults = footballData.results;
      if (footballData.debug) debugInfo = footballData.debug;
    }

    if (finishedResults.length === 0) {
      const hasAnyKey = process.env.API_FOOTBALL_KEY || process.env.FOOTBALL_DATA_API_KEY;
      if (!hasAnyKey) {
        return NextResponse.json({
          message: "Nenhuma API de resultados configurada. Configure API_FOOTBALL_KEY ou FOOTBALL_DATA_API_KEY, ou insira os resultados manualmente pelo painel admin.",
          updated: 0,
          pending: pendingMatches.length,
        });
      }

      // Listar jogos pendentes para debug
      const pendingNames = pendingMatches.map(
        (m: any) => `${m.home_team} vs ${m.away_team}`
      );

      return NextResponse.json({
        message: `Nenhum resultado finalizado encontrado na API para os ${pendingMatches.length} jogo(s) pendente(s). Insira manualmente pelo painel admin.`,
        updated: 0,
        pending: pendingMatches.length,
        pending_matches: pendingNames,
        debug: debugInfo || undefined,
      });
    }

    // Atualizar jogos no banco
    let updatedCount = 0;
    const updates: string[] = [];

    for (const match of pendingMatches) {
      const result = finishedResults.find(
        (r) => r.home_team === match.home_team && r.away_team === match.away_team
      );

      if (!result) continue;

      const { error: updateError } = await supabase
        .from("matches")
        .update({
          home_score: result.home_score,
          away_score: result.away_score,
          finished: true,
        })
        .eq("id", match.id);

      if (!updateError) {
        updatedCount++;
        updates.push(
          `${match.home_team} ${result.home_score} x ${result.away_score} ${match.away_team}`
        );
      }
    }

    return NextResponse.json({
      message: "Atualização concluída",
      updated: updatedCount,
      total_pending: pendingMatches.length,
      results: updates,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao atualizar resultados:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
