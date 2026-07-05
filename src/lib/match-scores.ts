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

function totalGoals(score: { home: number; away: number }): number {
  return score.home + score.away;
}

function sumScores(
  a: { home: number; away: number },
  b: { home: number; away: number }
): { home: number; away: number } {
  return { home: a.home + b.home, away: a.away + b.away };
}

function isExtratimePlaceholder(fulltime: ScorePair, extratime: ScorePair): boolean {
  if (!hasValidScore(fulltime) || !hasValidScore(extratime)) return true;
  if (extratime.home === 0 && extratime.away === 0) return true;
  return scoresEqual(fulltime, extratime);
}

/** extratime contém placar do shootout (igual ao penalty), não gols de prorrogação */
function extratimeIsPenaltyShootout(
  extratime: { home: number; away: number },
  penalty: ScorePair
): boolean {
  return hasValidScore(penalty) && scoresEqual(extratime, penalty);
}

function fixRegulationBeforePenalties(
  regulation: { home: number; away: number },
  fulltime: ScorePair,
  goals: ScorePair,
  penalty: ScorePair
): { home: number; away: number } {
  if (!hasValidScore(penalty)) return regulation;
  if (isDraw(regulation)) return regulation;

  if (hasValidScore(goals) && scoresEqual(goals, sumScores(regulation, penalty))) {
    const stripped = {
      home: goals.home - penalty.home,
      away: goals.away - penalty.away,
    };
    if (stripped.home >= 0 && stripped.away >= 0 && isDraw(stripped)) {
      return stripped;
    }
  }

  if (
    hasValidScore(goals) &&
    hasValidScore(fulltime) &&
    scoresEqual(goals, sumScores(fulltime, penalty)) &&
    isDraw(fulltime)
  ) {
    return fulltime;
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

/** Combina fulltime + extratime incremental ou cumulativo */
function mergeExtraTimeScore(
  fulltime: { home: number; away: number },
  extratime: { home: number; away: number }
): { home: number; away: number } {
  if (extratime.home >= fulltime.home && extratime.away >= fulltime.away) {
    return extratime;
  }
  if (isDraw(fulltime)) {
    return sumScores(fulltime, extratime);
  }
  return fulltime;
}

/** Escolhe o melhor candidato a placar final (90' + prorrogação) */
function pickBestRegulationCandidate(
  candidates: Array<{ home: number; away: number } | null>,
  fulltime: ScorePair
): { home: number; away: number } | null {
  const valid = candidates.filter(
    (c): c is { home: number; away: number } => c != null
  );
  if (valid.length === 0) return null;

  if (hasValidScore(fulltime)) {
    const withExtraTime = valid.filter(
      (c) =>
        c.home !== fulltime.home ||
        c.away !== fulltime.away ||
        totalGoals(c) > totalGoals(fulltime)
    );
    if (withExtraTime.length > 0) {
      return withExtraTime.reduce((best, c) =>
        totalGoals(c) > totalGoals(best) ? c : best
      );
    }
  }

  return valid.reduce((best, c) =>
    totalGoals(c) > totalGoals(best) ? c : best
  );
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

  // ── AET / FT: 90' + prorrogação ────────────────────────────────────────
  let extratimeMerged: { home: number; away: number } | null = null;

  if (
    hasValidScore(fulltime) &&
    hasValidScore(extratime) &&
    !isExtratimePlaceholder(fulltime, extratime) &&
    !extratimeIsPenaltyShootout(extratime, penalty)
  ) {
    extratimeMerged = mergeExtraTimeScore(fulltime, extratime);
  }

  const goalsScore = hasValidScore(goals)
    ? { home: goals.home, away: goals.away }
    : null;

  const best = pickBestRegulationCandidate(
    [goalsScore, extratimeMerged, hasValidScore(fulltime) ? fulltime : null],
    fulltime
  );

  if (best) {
    if (hasPenalties) {
      return fixRegulationBeforePenalties(best, fulltime, goals, penalty);
    }
    return best;
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

  if (duration === "PENALTY_SHOOTOUT" || hasPenalties) {
    let regulation = fulltime;

    if (
      hasValidScore(extratime) &&
      !isExtratimePlaceholder(fulltime, extratime) &&
      !extratimeIsPenaltyShootout(extratime, penalty) &&
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

  let extratimeMerged: { home: number; away: number } | null = null;

  if (
    hasValidScore(extratime) &&
    !isExtratimePlaceholder(fulltime, extratime) &&
    !extratimeIsPenaltyShootout(extratime, penalty)
  ) {
    extratimeMerged = mergeExtraTimeScore(fulltime, extratime);
  }

  const best = pickBestRegulationCandidate(
    [extratimeMerged, fulltime],
    fulltime
  );

  return best ?? fulltime;
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
