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

function isExtratimePlaceholder(
  fulltime: ScorePair,
  extratime: ScorePair
): boolean {
  if (extratime.home == null || extratime.away == null) return true;
  if (fulltime.home == null || fulltime.away == null) return false;

  // API envia 0-0 na prorrogação quando o jogo foi direto aos pênaltis
  if (
    extratime.home === 0 &&
    extratime.away === 0 &&
    (fulltime.home !== 0 || fulltime.away !== 0)
  ) {
    return true;
  }

  // Sem gols na prorrogação — placar igual ao tempo regulamentar
  return extratime.home === fulltime.home && extratime.away === fulltime.away;
}

function hasValidScore(pair: ScorePair): pair is { home: number; away: number } {
  return pair.home != null && pair.away != null;
}

/**
 * Placar após tempo regulamentar + prorrogação, antes de shootout.
 * Usa status da partida para evitar confundir placeholder de extratime com placar real.
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
  const goals = f.goals;
  const extraIsReal = !isExtratimePlaceholder(fulltime, extratime);

  // Decidido na prorrogação — extratime tem o placar final (ex: 2-2 no FT → 3-2 no AET)
  if (status === "AET") {
    if (hasValidScore(extratime)) {
      return { home: extratime.home, away: extratime.away };
    }
    if (hasValidScore(goals)) {
      return { home: goals.home, away: goals.away };
    }
  }

  // Decidido nos pênaltis — placar antes do shootout
  if (status === "PEN") {
    if (extraIsReal && hasValidScore(extratime)) {
      return { home: extratime.home, away: extratime.away };
    }
    if (hasValidScore(goals)) {
      return { home: goals.home, away: goals.away };
    }
    if (hasValidScore(fulltime)) {
      return { home: fulltime.home, away: fulltime.away };
    }
  }

  // Houve prorrogação com gols mesmo sem status AET explícito
  if (extraIsReal && hasValidScore(extratime)) {
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

export function getRegulationScoreFromFootballData(score: {
  fullTime: ScorePair;
  extraTime?: ScorePair;
  duration?: string;
}): { home: number; away: number } | null {
  const full = score.fullTime;
  const extra = score.extraTime ?? { home: null, away: null };
  const extraIsReal = !isExtratimePlaceholder(full, extra);
  const duration = score.duration ?? "";

  if (
    (duration === "EXTRA_TIME" || duration === "AET") &&
    extraIsReal &&
    hasValidScore(extra)
  ) {
    return { home: extra.home, away: extra.away };
  }

  if (duration === "PENALTY_SHOOTOUT") {
    if (extraIsReal && hasValidScore(extra)) {
      return { home: extra.home, away: extra.away };
    }
    if (hasValidScore(full)) {
      return { home: full.home, away: full.away };
    }
    return null;
  }

  if (extraIsReal && hasValidScore(extra)) {
    return { home: extra.home, away: extra.away };
  }

  if (hasValidScore(full)) {
    return { home: full.home, away: full.away };
  }

  return null;
}
