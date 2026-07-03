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
  const home = match.home_score;
  const away = match.away_score;
  const homePenalty = match.home_penalty_score ?? null;
  const awayPenalty = match.away_penalty_score ?? null;
  const penaltyWinner = match.penalty_winner ?? null;

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

function scoresEqual(
  a: { home: number; away: number },
  b: { home: number; away: number }
): boolean {
  return a.home === b.home && a.away === b.away;
}

function isExtratimePlaceholder(
  fulltime: { home: number; away: number },
  extratime: { home: number; away: number }
): boolean {
  if (extratime.home === 0 && extratime.away === 0) return true;
  return scoresEqual(fulltime, extratime);
}

/**
 * Placar de 90' + prorrogação, sem shootout.
 * Nunca usa score.penalty nem soma pênaltis ao placar principal.
 */
export function getRegulationScoreFromApiFootball(f: {
  fixture?: { status: { short: string } };
  goals: ScorePair;
  score: {
    fulltime: ScorePair;
    extratime: ScorePair;
    penalty: ScorePair;
  };
}): { home: number; away: number } {
  const fulltime = f.score.fulltime;
  const extratime = f.score.extratime;
  const penalty = f.score.penalty;
  const goals = f.goals;
  const hasPenalties = hasValidScore(penalty);

  if (!hasValidScore(fulltime)) {
    if (hasValidScore(goals) && hasPenalties) {
      // goals às vezes vem como (90'+prorrogação) + pênaltis — remove o shootout
      const stripped = {
        home: goals.home - penalty.home,
        away: goals.away - penalty.away,
      };
      if (stripped.home >= 0 && stripped.away >= 0) {
        return stripped;
      }
    }
    if (hasValidScore(goals)) {
      return { home: goals.home, away: goals.away };
    }
    throw new Error("Placar de tempo regulamentar indisponivel");
  }

  // Base: tempo regulamentar (90')
  let regulation: { home: number; away: number } = {
    home: fulltime.home,
    away: fulltime.away,
  };

  // Incorpora prorrogação apenas se for placar real (não placeholder e não é o shootout)
  if (hasValidScore(extratime) && !isExtratimePlaceholder(fulltime, extratime)) {
    const extratimeIsPenaltyShootout =
      hasPenalties && scoresEqual(extratime, penalty);

    if (!extratimeIsPenaltyShootout) {
      // Cumulativo: FT 2-2, AET 3-2
      if (
        extratime.home >= fulltime.home &&
        extratime.away >= fulltime.away
      ) {
        regulation = { home: extratime.home, away: extratime.away };
      } else if (fulltime.home === fulltime.away) {
        // Incremental só com empate nos 90': FT 2-2, ET 1-0 → 3-2
        regulation = {
          home: fulltime.home + extratime.home,
          away: fulltime.away + extratime.away,
        };
      }
      // Se fulltime já tem vencedor, extratime parcial é ignorado
    }
  }

  // goals nunca deve incluir pênaltis no placar de pontuação.
  // Se goals = regulation + penalty, ignora goals.
  if (hasValidScore(goals) && hasPenalties) {
    const goalsMinusPenalty = {
      home: goals.home - penalty.home,
      away: goals.away - penalty.away,
    };
    if (
      goalsMinusPenalty.home >= 0 &&
      goalsMinusPenalty.away >= 0 &&
      scoresEqual(goals, {
        home: regulation.home + penalty.home,
        away: regulation.away + penalty.away,
      })
    ) {
      return regulation;
    }
  }

  // Segurança final: se o placar calculado for regulation+penalty, remove o shootout
  if (
    hasPenalties &&
    scoresEqual(regulation, {
      home: fulltime.home + penalty.home,
      away: fulltime.away + penalty.away,
    })
  ) {
    return { home: fulltime.home, away: fulltime.away };
  }

  return regulation;
}

export function getRegulationScoreFromFootballData(score: {
  fullTime: ScorePair;
  extraTime?: ScorePair;
  penalties?: ScorePair;
}): { home: number; away: number } | null {
  const fulltime = score.fullTime;
  const extratime = score.extraTime ?? { home: null, away: null };
  const penalty = score.penalties ?? { home: null, away: null };
  const hasPenalties = hasValidScore(penalty);

  if (!hasValidScore(fulltime)) return null;

  let regulation: { home: number; away: number } = {
    home: fulltime.home,
    away: fulltime.away,
  };

  // football-data.org: fullTime já inclui prorrogação quando houve.
  // extraTime, quando presente, é o placar ao fim da prorrogação (cumulativo).
  if (
    hasValidScore(extratime) &&
    !isExtratimePlaceholder(fulltime, extratime)
  ) {
    const extratimeIsPenaltyShootout =
      hasPenalties && scoresEqual(extratime, penalty);

    if (!extratimeIsPenaltyShootout) {
      if (
        extratime.home >= fulltime.home &&
        extratime.away >= fulltime.away
      ) {
        regulation = { home: extratime.home, away: extratime.away };
      }
    }
  }

  // Nunca somar pênaltis
  if (
    hasPenalties &&
    scoresEqual(regulation, {
      home: fulltime.home + penalty.home,
      away: fulltime.away + penalty.away,
    })
  ) {
    return { home: fulltime.home, away: fulltime.away };
  }

  return regulation;
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
