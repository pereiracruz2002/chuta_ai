export interface MatchForScoreDisplay {
  home_team?: string;
  away_team?: string;
  home_score: number | null;
  away_score: number | null;
  home_penalty_score?: number | null;
  away_penalty_score?: number | null;
  penalty_winner?: string | null;
}

export interface ResolvedMatchScores {
  home: number | null;
  away: number | null;
  homePenalty: number | null;
  awayPenalty: number | null;
  penaltyWinner: string | null;
  wentToPenalties: boolean;
}

export function resolveMatchDisplayScores(
  match: MatchForScoreDisplay
): ResolvedMatchScores {
  let home = match.home_score;
  let away = match.away_score;
  let homePenalty = match.home_penalty_score ?? null;
  let awayPenalty = match.away_penalty_score ?? null;
  const penaltyWinner = match.penalty_winner ?? null;

  const hasPenaltyScores = homePenalty != null && awayPenalty != null;

  if (
    penaltyWinner &&
    !hasPenaltyScores &&
    home != null &&
    away != null &&
    home !== away
  ) {
    homePenalty = home;
    awayPenalty = away;
    home = null;
    away = null;
  }

  const wentToPenalties =
    (homePenalty != null && awayPenalty != null) || !!penaltyWinner;

  return {
    home,
    away,
    homePenalty,
    awayPenalty,
    penaltyWinner,
    wentToPenalties,
  };
}

export interface ApiMatchResult {
  home_team: string;
  away_team: string;
  home_score: number;
  away_score: number;
  home_penalty_score: number | null;
  away_penalty_score: number | null;
  penalty_winner: string | null;
}

type ScorePair = { home: number | null; away: number | null };

function hasValidScore(pair: ScorePair): pair is { home: number; away: number } {
  return pair.home != null && pair.away != null;
}

/**
 * Combina tempo regulamentar + prorrogação.
 * A API pode enviar extratime cumulativo (2-2 → 3-2) ou incremental (2-2 + 1-0 na prorrogação).
 */
export function mergeExtraTimeScore(
  fulltime: ScorePair,
  extratime: ScorePair
): { home: number; away: number } | null {
  if (!hasValidScore(fulltime) && !hasValidScore(extratime)) {
    return null;
  }

  if (!hasValidScore(extratime)) {
    return hasValidScore(fulltime) ? fulltime : null;
  }

  if (!hasValidScore(fulltime)) {
    return extratime;
  }

  // Placeholder 0-0 quando o jogo foi direto aos pênaltis
  if (
    extratime.home === 0 &&
    extratime.away === 0 &&
    (fulltime.home !== 0 || fulltime.away !== 0)
  ) {
    return fulltime;
  }

  // Sem gols na prorrogação
  if (extratime.home === fulltime.home && extratime.away === fulltime.away) {
    return fulltime;
  }

  // Placar cumulativo após prorrogação (ex: FT 2-2, AET 3-2)
  const looksCumulative =
    extratime.home >= fulltime.home && extratime.away >= fulltime.away;

  if (looksCumulative) {
    return { home: extratime.home, away: extratime.away };
  }

  // Placar incremental — só gols na prorrogação (ex: FT 2-2, ET 1-0 → 3-2)
  return {
    home: fulltime.home + extratime.home,
    away: fulltime.away + extratime.away,
  };
}

/**
 * Placar após 90' + prorrogação, antes de shootout. Usado na pontuação dos palpites.
 */
export function getRegulationScoreFromApiFootball(f: {
  goals: ScorePair;
  score: {
    fulltime: ScorePair;
    extratime: ScorePair;
    penalty: ScorePair;
  };
}): { home: number; away: number } {
  const fulltime = f.score.fulltime;
  const extratime = f.score.extratime;
  const goals = f.goals;

  // goals costuma trazer o placar final antes dos pênaltis (inclui prorrogação)
  if (hasValidScore(goals) && hasValidScore(fulltime)) {
    if (goals.home !== fulltime.home || goals.away !== fulltime.away) {
      return { home: goals.home, away: goals.away };
    }
  }

  const merged = mergeExtraTimeScore(fulltime, extratime);
  if (merged) return merged;

  if (hasValidScore(goals)) {
    return { home: goals.home, away: goals.away };
  }

  if (hasValidScore(fulltime)) {
    return { home: fulltime.home, away: fulltime.away };
  }

  throw new Error("Placar de tempo regulamentar indisponivel");
}

export function getRegulationScoreFromFootballData(score: {
  fullTime: ScorePair;
  extraTime?: ScorePair;
}): { home: number; away: number } | null {
  const merged = mergeExtraTimeScore(
    score.fullTime,
    score.extraTime ?? { home: null, away: null }
  );

  return merged;
}

/** Encontra resultado da API mesmo se mandante/visitante estiverem invertidos. */
export function findApiResultForMatch(
  results: ApiMatchResult[],
  homeTeam: string,
  awayTeam: string
): (ApiMatchResult & { reversed: boolean }) | null {
  const direct = results.find(
    (r) => r.home_team === homeTeam && r.away_team === awayTeam
  );
  if (direct) return { ...direct, reversed: false };

  const reversed = results.find(
    (r) => r.home_team === awayTeam && r.away_team === homeTeam
  );
  if (!reversed) return null;

  return {
    home_team: homeTeam,
    away_team: awayTeam,
    home_score: reversed.away_score,
    away_score: reversed.home_score,
    home_penalty_score: reversed.away_penalty_score,
    away_penalty_score: reversed.home_penalty_score,
    penalty_winner:
      reversed.penalty_winner === homeTeam
        ? homeTeam
        : reversed.penalty_winner === awayTeam
          ? awayTeam
          : reversed.penalty_winner,
    reversed: true,
  };
}
