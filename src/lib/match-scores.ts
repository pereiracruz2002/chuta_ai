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
type FinalScore = { home: number; away: number };

function hasValidScore(pair: ScorePair): pair is FinalScore {
  return pair.home != null && pair.away != null;
}

function scoresEqual(a: FinalScore, b: FinalScore): boolean {
  return a.home === b.home && a.away === b.away;
}

function isDraw(score: FinalScore): boolean {
  return score.home === score.away;
}

function totalGoals(score: FinalScore): number {
  return score.home + score.away;
}

function sumScores(a: FinalScore, b: FinalScore): FinalScore {
  return { home: a.home + b.home, away: a.away + b.away };
}

function subtractScores(a: FinalScore, b: FinalScore): FinalScore | null {
  const home = a.home - b.home;
  const away = a.away - b.away;
  if (home < 0 || away < 0) return null;
  return { home, away };
}

function isExtratimePlaceholder(fulltime: ScorePair, extratime: ScorePair): boolean {
  if (!hasValidScore(fulltime) || !hasValidScore(extratime)) return true;
  if (extratime.home === 0 && extratime.away === 0) return true;
  return scoresEqual(fulltime, extratime);
}

function extratimeIsPenaltyShootout(
  extratime: FinalScore,
  penalty: ScorePair
): boolean {
  return hasValidScore(penalty) && scoresEqual(extratime, penalty);
}

function addUniqueDraw(list: FinalScore[], score: FinalScore | null) {
  if (!score || !isDraw(score)) return;
  if (list.some((s) => scoresEqual(s, score))) return;
  list.push(score);
}

/**
 * Jogos com pênaltis empataram antes do shootout.
 * Coleta todos os empates possíveis e escolhe o de maior soma de gols
 * (1x1 vence 0x0). Nunca usa placar de shootout nem força 0x0 cedo demais.
 */
function regulationBeforePenalties(
  fulltime: ScorePair,
  goals: ScorePair,
  extratime: ScorePair,
  penalty: ScorePair
): FinalScore {
  const draws: FinalScore[] = [];

  if (hasValidScore(fulltime)) {
    addUniqueDraw(draws, fulltime);
  }

  if (hasValidScore(goals)) {
    // goals poluído com o placar dos penaltis
    if (!(hasValidScore(penalty) && scoresEqual(goals, penalty))) {
      addUniqueDraw(draws, goals);
    }
  }

  if (
    hasValidScore(extratime) &&
    !extratimeIsPenaltyShootout(extratime, penalty) &&
    !(hasValidScore(fulltime) && isExtratimePlaceholder(fulltime, extratime))
  ) {
    addUniqueDraw(draws, extratime);
  }

  if (hasValidScore(penalty)) {
    if (hasValidScore(goals)) {
      addUniqueDraw(draws, subtractScores(goals, penalty));
    }
    if (hasValidScore(fulltime)) {
      addUniqueDraw(draws, subtractScores(fulltime, penalty));
    }
  }

  if (draws.length > 0) {
    return draws.reduce((best, score) =>
      totalGoals(score) > totalGoals(best) ? score : best
    );
  }

  // Sem empate explícito: tenta fulltime/goals sem o shootout
  if (hasValidScore(fulltime) && hasValidScore(penalty)) {
    const stripped = subtractScores(fulltime, penalty);
    if (stripped && isDraw(stripped)) return stripped;
  }

  if (hasValidScore(goals) && hasValidScore(penalty)) {
    const stripped = subtractScores(goals, penalty);
    if (stripped && isDraw(stripped)) return stripped;
  }

  // Último recurso: se fulltime existe e não parece o shootout, usa fulltime
  if (
    hasValidScore(fulltime) &&
    !(hasValidScore(penalty) && scoresEqual(fulltime, penalty))
  ) {
    return fulltime;
  }

  if (
    hasValidScore(goals) &&
    !(hasValidScore(penalty) && scoresEqual(goals, penalty))
  ) {
    return goals;
  }

  return { home: 0, away: 0 };
}

function mergeExtraTimeScore(
  fulltime: FinalScore,
  extratime: FinalScore
): FinalScore {
  if (extratime.home >= fulltime.home && extratime.away >= fulltime.away) {
    return extratime;
  }
  if (isDraw(fulltime)) {
    return sumScores(fulltime, extratime);
  }
  return fulltime;
}

function pickBestRegulationCandidate(
  candidates: Array<FinalScore | null>,
  fulltime: ScorePair
): FinalScore | null {
  const valid = candidates.filter((c): c is FinalScore => c != null);
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
 * Usado na pontuação dos palpites.
 */
export function getRegulationScoreFromApiFootball(f: {
  fixture: { status: { short: string } };
  goals: ScorePair;
  score: {
    fulltime: ScorePair;
    extratime: ScorePair;
    penalty: ScorePair;
  };
}): FinalScore {
  const status = f.fixture.status.short;
  const fulltime = f.score.fulltime;
  const extratime = f.score.extratime;
  const penalty = f.score.penalty;
  const goals = f.goals;
  const hasPenalties = hasValidScore(penalty);
  const decidedByPenalties = status === "PEN" || hasPenalties;

  if (decidedByPenalties) {
    return regulationBeforePenalties(fulltime, goals, extratime, penalty);
  }

  let extratimeMerged: FinalScore | null = null;

  if (
    hasValidScore(fulltime) &&
    hasValidScore(extratime) &&
    !isExtratimePlaceholder(fulltime, extratime)
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

  if (best) return best;

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
): FinalScore | null {
  const fulltime = score.fullTime;
  const extratime = score.extraTime ?? { home: null, away: null };
  const penalty = score.penalties ?? { home: null, away: null };
  const hasPenalties = hasValidScore(penalty);

  if (!hasValidScore(fulltime)) return null;

  if (duration === "PENALTY_SHOOTOUT" || hasPenalties) {
    return regulationBeforePenalties(fulltime, fulltime, extratime, penalty);
  }

  let extratimeMerged: FinalScore | null = null;

  if (
    hasValidScore(extratime) &&
    !isExtratimePlaceholder(fulltime, extratime)
  ) {
    extratimeMerged = mergeExtraTimeScore(fulltime, extratime);
  }

  return (
    pickBestRegulationCandidate([extratimeMerged, fulltime], fulltime) ??
    fulltime
  );
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
