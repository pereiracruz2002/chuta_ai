import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { mapTeamName } from "@/lib/team-mapping";
import {
  type ApiMatchResult,
  findApiResultForMatch,
  getRegulationScoreFromApiFootball,
  getRegulationScoreFromFootballData,
} from "@/lib/match-scores";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

const FINISHED_STATUSES_API_FOOTBALL = ["FT", "AET", "PEN"];
const FINISHED_STATUS_FOOTBALL_DATA = "FINISHED";

function calculatePoints(
  homePred: number,
  awayPred: number,
  homeScore: number,
  awayScore: number
): number {
  if (homePred === homeScore && awayPred === awayScore) return 10;

  const predDiff = homePred - awayPred;
  const actualDiff = homeScore - awayScore;

  const correctOutcome =
    (predDiff > 0 && actualDiff > 0) ||
    (predDiff < 0 && actualDiff < 0) ||
    (predDiff === 0 && actualDiff === 0);

  if (!correctOutcome) return 0;
  if (predDiff === actualDiff) return 7;
  if (homePred === homeScore || awayPred === awayScore) return 5;
  return 3;
}

interface ApiFootballFixture {
  fixture: {
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
    penalty: { home: number | null; away: number | null };
  };
}

function parseApiFootballFixture(f: ApiFootballFixture): ApiMatchResult | null {
  if (!FINISHED_STATUSES_API_FOOTBALL.includes(f.fixture.status.short)) return null;

  try {
    const regulation = getRegulationScoreFromApiFootball({
      fixture: f.fixture,
      goals: f.goals,
      score: f.score,
    });
    const homeTeam = mapTeamName(f.teams.home.name);
    const awayTeam = mapTeamName(f.teams.away.name);

    const homePen = f.score.penalty?.home ?? null;
    const awayPen = f.score.penalty?.away ?? null;
    const hasPenalties = homePen != null && awayPen != null;

    let penaltyWinner: string | null = null;
    if (hasPenalties && homePen !== awayPen) {
      penaltyWinner = homePen > awayPen ? homeTeam : awayTeam;
    }

    return {
      home_team: homeTeam,
      away_team: awayTeam,
      home_score: regulation.home,
      away_score: regulation.away,
      home_penalty_score: hasPenalties ? homePen : null,
      away_penalty_score: hasPenalties ? awayPen : null,
      penalty_winner: penaltyWinner,
    };
  } catch {
    return null;
  }
}

async function fetchFromApiFootball(): Promise<ApiMatchResult[]> {
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
  const results: ApiMatchResult[] = [];

  for (const f of fixtures) {
    const parsed = parseApiFootballFixture(f);
    if (parsed) results.push(parsed);
  }

  return results;
}

interface FootballDataMatch {
  status: string;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
    extraTime?: { home: number | null; away: number | null };
    penalties?: { home: number | null; away: number | null };
    duration?: string;
  };
}

function parseFootballDataMatch(m: FootballDataMatch): ApiMatchResult | null {
  if (m.status !== FINISHED_STATUS_FOOTBALL_DATA) return null;

  const regulation = getRegulationScoreFromFootballData(
    {
      fullTime: m.score.fullTime,
      extraTime: m.score.extraTime,
      penalties: m.score.penalties,
    },
    m.score.duration
  );
  if (!regulation) return null;

  const homeTeam = mapTeamName(m.homeTeam.name);
  const awayTeam = mapTeamName(m.awayTeam.name);
  const homePen = m.score.penalties?.home ?? null;
  const awayPen = m.score.penalties?.away ?? null;
  const hasPenalties = homePen != null && awayPen != null;

  let penaltyWinner: string | null = null;
  if (hasPenalties && homePen !== awayPen) {
    penaltyWinner = homePen > awayPen ? homeTeam : awayTeam;
  }

  return {
    home_team: homeTeam,
    away_team: awayTeam,
    home_score: regulation.home,
    away_score: regulation.away,
    home_penalty_score: hasPenalties ? homePen : null,
    away_penalty_score: hasPenalties ? awayPen : null,
    penalty_winner: penaltyWinner,
  };
}

async function fetchFromFootballData(): Promise<{
  results: ApiMatchResult[];
  debug?: string;
}> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return { results: [] };

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

      if (!response.ok) continue;

      const data = await response.json();
      const matches: FootballDataMatch[] = data.matches || [];
      if (matches.length === 0) continue;

      const results: ApiMatchResult[] = [];
      for (const m of matches) {
        const parsed = parseFootballDataMatch(m);
        if (parsed) results.push(parsed);
      }

      if (results.length > 0) return { results };
    } catch (e) {
      console.error(`Erro ao buscar ${url}:`, e);
    }
  }

  return { results: [], debug: "football-data.org não retornou jogos finalizados" };
}

function needsUpdate(match: any, result: ApiMatchResult): boolean {
  if (!match.finished) return true;

  const regulationChanged =
    match.home_score !== result.home_score ||
    match.away_score !== result.away_score;

  const penaltyMissing =
    result.home_penalty_score != null &&
    (match.home_penalty_score == null || match.away_penalty_score == null);

  const penaltyWrong =
    result.home_penalty_score != null &&
    (match.home_penalty_score !== result.home_penalty_score ||
      match.away_penalty_score !== result.away_penalty_score);

  return regulationChanged || penaltyMissing || penaltyWrong;
}

async function recalculatePointsForMatch(
  supabase: ReturnType<typeof getSupabaseAdmin>,
  matchId: string,
  homeScore: number,
  awayScore: number
) {
  const { data: predictions } = await supabase
    .from("predictions")
    .select("id, home_prediction, away_prediction, pool_id, user_id")
    .eq("match_id", matchId);

  if (!predictions || predictions.length === 0) return;

  for (const pred of predictions) {
    const points = calculatePoints(
      pred.home_prediction,
      pred.away_prediction,
      homeScore,
      awayScore
    );

    await supabase
      .from("predictions")
      .update({ points, updated_at: new Date().toISOString() })
      .eq("id", pred.id);
  }

  const affectedPools = [...new Set(predictions.map((p) => p.pool_id))];

  for (const poolId of affectedPools) {
    const { data: members } = await supabase
      .from("pool_members")
      .select("user_id")
      .eq("pool_id", poolId);

    if (!members) continue;

    for (const member of members) {
      const { data: memberPreds } = await supabase
        .from("predictions")
        .select("points")
        .eq("pool_id", poolId)
        .eq("user_id", member.user_id);

      const totalScore =
        memberPreds?.reduce((sum, p) => sum + (p.points || 0), 0) || 0;

      await supabase
        .from("pool_members")
        .update({ score: totalScore })
        .eq("pool_id", poolId)
        .eq("user_id", member.user_id);
    }
  }
}

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

    const { data: allMatches, error: dbError } = await supabase
      .from("matches")
      .select("*")
      .lt("starts_at", new Date().toISOString());

    if (dbError) {
      throw new Error(`Erro ao buscar jogos: ${dbError.message}`);
    }

    if (!allMatches || allMatches.length === 0) {
      return NextResponse.json({
        message: "Nenhum jogo para atualizar",
        updated: 0,
      });
    }

    let finishedResults = await fetchFromApiFootball();
    let debugInfo = "";

    if (finishedResults.length === 0) {
      const footballData = await fetchFromFootballData();
      finishedResults = footballData.results;
      if (footballData.debug) debugInfo = footballData.debug;
    }

    if (finishedResults.length === 0) {
      const hasAnyKey =
        process.env.API_FOOTBALL_KEY || process.env.FOOTBALL_DATA_API_KEY;
      if (!hasAnyKey) {
        return NextResponse.json({
          message:
            "Nenhuma API de resultados configurada. Configure API_FOOTBALL_KEY ou FOOTBALL_DATA_API_KEY, ou insira os resultados manualmente pelo painel admin.",
          updated: 0,
          pending: allMatches.filter((m: any) => !m.finished).length,
        });
      }

      const pendingNames = allMatches
        .filter((m: any) => !m.finished)
        .map((m: any) => `${m.home_team} vs ${m.away_team}`);

      return NextResponse.json({
        message: `Nenhum resultado finalizado encontrado na API. Insira manualmente pelo painel admin.`,
        updated: 0,
        pending: pendingNames.length,
        pending_matches: pendingNames,
        debug: debugInfo || undefined,
      });
    }

    let updatedCount = 0;
    const updates: string[] = [];
    const recalculateIds: { id: string; home: number; away: number }[] = [];

    for (const match of allMatches) {
      const result = findApiResultForMatch(
        finishedResults,
        match.home_team,
        match.away_team
      );

      if (!result) continue;
      if (!needsUpdate(match, result)) continue;

      const wasFinished = match.finished;
      const regulationChanged =
        match.home_score !== result.home_score ||
        match.away_score !== result.away_score;

      const { error: updateError } = await supabase
        .from("matches")
        .update({
          home_score: result.home_score,
          away_score: result.away_score,
          home_penalty_score: result.home_penalty_score,
          away_penalty_score: result.away_penalty_score,
          penalty_winner: result.penalty_winner,
          finished: true,
        })
        .eq("id", match.id);

      if (!updateError) {
        updatedCount++;

        const penaltyLabel =
          result.home_penalty_score != null
            ? ` (pen. ${result.home_penalty_score}-${result.away_penalty_score})`
            : "";

        updates.push(
          `${match.home_team} ${result.home_score} x ${result.away_score} ${match.away_team}${penaltyLabel}`
        );

        if (!wasFinished || regulationChanged) {
          recalculateIds.push({
            id: match.id,
            home: result.home_score,
            away: result.away_score,
          });
        }
      }
    }

    for (const { id, home, away } of recalculateIds) {
      await recalculatePointsForMatch(supabase, id, home, away);
    }

    return NextResponse.json({
      message: "Atualização concluída",
      updated: updatedCount,
      total_checked: allMatches.length,
      results: updates,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao atualizar resultados:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
