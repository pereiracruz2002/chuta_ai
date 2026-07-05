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

function isDraw(score: { home: number; away: number }): boolean {
  return score.home === score.away;
}

function sumScores(
  a: { home: number; away: number },
  b: { home: number; away: number }
): { home: number; away: number } {
  return { home: a.home + b.home, away: a.away + b.away };
}

/** extratime 0-0 ou igual ao fulltime = sem prorrogação real */
function isExtratimePlaceholder(fulltime: ScorePair, extratime: ScorePair): boolean {
  if (!hasValidScore(fulltime) || !hasValidScore(extratime)) return true;
  if (extratime.home === 0 && extratime.away === 0) return true;
  return scoresEqual(fulltime, extratime);
}

/** extratime contém placar do shootout, não de prorrogação */
function extratimeIsPenaltyShootout(
  extratime: { home: number; away: number },
  penalty: ScorePair,
  fulltime: ScorePair
): boolean {
  if (hasValidScore(penalty) && scoresEqual(extratime, penalty)) return true;

  // extratime diferente do empate nos 90' mas fulltime era empate → provavelmente shootout
  if (
    hasValidScore(fulltime) &&
    isDraw(fulltime) &&
    !scoresEqual(extratime, fulltime) &&
    !isDraw(extratime)
  ) {
    return true;
  }

  return false;
}

/**
 * Antes dos pênaltis o placar é sempre empate.
 * Corrige quando regulation+penalty foi gravado por engano.
 */
function fixRegulationBeforePenalties(
  regulation: { home: number; away: number },
  fulltime: ScorePair,
  goals: ScorePair,
  penalty: ScorePair
): { home: number; away: number } {
  if (!hasValidScore(penalty)) return regulation;
  if (isDraw(regulation)) return regulation;

  // goals = empate + pênaltis (ex: 1-1 + 3-4 = 4-5)
  if (hasValidScore(goals) && scoresEqual(goals, sumScores(regulation, penalty))) {
    const stripped = {
      home: goals.home - penalty.home,
      away: goals.away - penalty.away,
    };
    if (stripped.home >= 0 && stripped.away >= 0 && isDraw(stripped)) {
      return stripped;
    }
  }

  if (hasValidScore(goals) && scoresEqual(goals, sumScores(fulltime as { home: number; away: number }, penalty))) {
    if (hasValidScore(fulltime) && isDraw(fulltime)) return fulltime;
  }

  if (hasValidScore(fulltime) && isDraw(fulltime)) return fulltime;

  if (hasValidScore(goals) && isDraw(goals)) return goals;

  const stripped = {
    home: regulation.home - penalty.home,
    away: regulation.away - penalty.away,
  };
  if (stripped.home >= 0 && stripped.away >= 0 && isDraw(stripped)) {
    return stripped;
  }

  return regulation;
}

/**
 * Placar de 90' + prorrogação, sem shootout.
 */
export function getRegulationScoreFromApiFootball(f: {
  fixture: { status: { short: string } };
  goals: ScorePair;
  score: {
    fulltime: ScorePair;
    extratime: ScorePair;
    penalty: ScorePair;
  };
}): { home: number; away: number } {
  const status = f.fixture.status.short;
  const fulltime = f.score.fulltime;
  const extratime = f.score.extratime;
  const penalty = f.score.penalty;
  const goals = f.goals;
  const hasPenalties = hasValidScore(penalty);

  // ── PEN: decidido nos pênaltis ──────────────────────────────────────────
  // Placar antes do shootout = empate. Nunca usar extratime (API coloca shootout lá).
  if (status === "PEN") {
    let regulation: { home: number; away: number };

    if (hasValidScore(goals) && hasValidScore(fulltime)) {
      if (hasPenalties && scoresEqual(goals, sumScores(fulltime, penalty))) {
        regulation = fulltime;
      } else if (isDraw(goals)) {
        regulation = goals;
      } else if (isDraw(fulltime)) {
        regulation = fulltime;
      } else {
        regulation = goals;
      }
    } else if (hasValidScore(goals)) {
      regulation = goals;
    } else if (hasValidScore(fulltime)) {
      regulation = fulltime;
    } else {
      throw new Error("Placar de tempo regulamentar indisponivel");
    }

    return fixRegulationBeforePenalties(regulation, fulltime, goals, penalty);
  }

  // ── AET: decidido na prorrogação ────────────────────────────────────────
  if (status === "AET") {
    if (hasValidScore(extratime) && !isExtratimePlaceholder(fulltime, extratime)) {
      return { home: extratime.home, away: extratime.away };
    }
    if (hasValidScore(goals)) {
      return { home: goals.home, away: goals.away };
    }
    if (hasValidScore(fulltime)) {
      return { home: fulltime.home, away: fulltime.away };
    }
    throw new Error("Placar de tempo regulamentar indisponivel");
  }

  // ── FT ou fallback ──────────────────────────────────────────────────────
  if (hasValidScore(fulltime)) {
    let regulation: { home: number; away: number } = {
      home: fulltime.home,
      away: fulltime.away,
    };

    if (
      hasValidScore(extratime) &&
      !isExtratimePlaceholder(fulltime, extratime) &&
      !extratimeIsPenaltyShootout(extratime, penalty, fulltime)
    ) {
      if (
        extratime.home >= fulltime.home &&
        extratime.away >= fulltime.away
      ) {
        regulation = { home: extratime.home, away: extratime.away };
      } else if (isDraw(fulltime)) {
        regulation = sumScores(fulltime, extratime);
      }
    }

    if (hasPenalties) {
      regulation = fixRegulationBeforePenalties(
        regulation,
        fulltime,
        goals,
        penalty
      );
    }

    return regulation;
  }

  if (hasValidScore(goals)) {
    return { home: goals.home, away: goals.away };
  }

  throw new Error("Placar de tempo regulamentar indisponivel");
}

export function getRegulationScoreFromFootballData(
  score: {
    fullTime: ScorePair;
    extraTime?: ScorePair;
    penalties?: ScorePair;
  },
  duration?: string
): { home: number; away: number } | null {
  const fulltime = score.fullTime;
  const extratime = score.extraTime ?? { home: null, away: null };
  const penalty = score.penalties ?? { home: null, away: null };
  const hasPenalties = hasValidScore(penalty);

  if (!hasValidScore(fulltime)) return null;

  // Decidido nos pênaltis — fullTime já inclui prorrogação, é o placar antes do shootout
  if (duration === "PENALTY_SHOOTOUT" || hasPenalties) {
    let regulation = fulltime;

    if (
      hasValidScore(extratime) &&
      !isExtratimePlaceholder(fulltime, extratime) &&
      !extratimeIsPenaltyShootout(extratime, penalty, fulltime) &&
      isDraw(extratime)
    ) {
      regulation = extratime;
    }

    return fixRegulationBeforePenalties(
      regulation,
      fulltime,
      fulltime,
      penalty
    );
  }

  // Decidido na prorrogação
  if (duration === "EXTRA_TIME" || duration === "AET") {
    if (
      hasValidScore(extratime) &&
      !isExtratimePlaceholder(fulltime, extratime)
    ) {
      return { home: extratime.home, away: extratime.away };
    }
    return fulltime;
  }

  if (
    hasValidScore(extratime) &&
    !isExtratimePlaceholder(fulltime, extratime) &&
    !extratimeIsPenaltyShootout(extratime, penalty, fulltime)
  ) {
    if (extratime.home >= fulltime.home && extratime.away >= fulltime.away) {
      return { home: extratime.home, away: extratime.away };
    }
  }

  return fulltime;
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
