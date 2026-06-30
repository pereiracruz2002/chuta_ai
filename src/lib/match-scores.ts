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

  // Dados antigos: penalty_winner definido mas placar principal nao e empate.
  // Provavelmente o shootout foi salvo em home_score/away_score por engano.
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

function shouldUseExtraTimeScore(
  fulltime: { home: number | null; away: number | null },
  extratime: { home: number | null; away: number | null }
): boolean {
  if (extratime.home == null || extratime.away == null) return false;
  if (fulltime.home == null || fulltime.away == null) return true;
  // extratime 0-0 com fulltime diferente = placeholder da API, nao houve prorrogação
  return extratime.home !== fulltime.home || extratime.away !== fulltime.away;
}

export function getRegulationScoreFromApiFootball(f: {
  goals: { home: number | null; away: number | null };
  score: {
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}): { home: number; away: number } {
  // goals = tempo normal + prorrogação, sem shootout (fonte mais confiável)
  if (f.goals.home != null && f.goals.away != null) {
    return { home: f.goals.home, away: f.goals.away };
  }

  const fulltime = f.score.fulltime;
  const extratime = f.score.extratime;

  if (shouldUseExtraTimeScore(fulltime, extratime)) {
    return { home: extratime.home!, away: extratime.away! };
  }

  if (fulltime?.home != null && fulltime?.away != null) {
    return { home: fulltime.home, away: fulltime.away };
  }

  throw new Error("Placar de tempo regulamentar indisponivel");
}

export function getRegulationScoreFromFootballData(score: {
  fullTime: { home: number | null; away: number | null };
  extraTime?: { home: number | null; away: number | null };
}): { home: number; away: number } | null {
  const full = score.fullTime;
  const extra = score.extraTime;

  if (shouldUseExtraTimeScore(full, extra ?? { home: null, away: null })) {
    return { home: extra!.home!, away: extra!.away! };
  }

  if (full?.home != null && full?.away != null) {
    return { home: full.home, away: full.away };
  }

  return null;
}
