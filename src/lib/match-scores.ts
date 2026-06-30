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

export function getRegulationScoreFromApiFootball(f: {
  goals: { home: number | null; away: number | null };
  score: {
    fulltime: { home: number | null; away: number | null };
    extratime: { home: number | null; away: number | null };
    penalty: { home: number | null; away: number | null };
  };
}): { home: number; away: number } {
  if (f.score.extratime?.home != null && f.score.extratime?.away != null) {
    return { home: f.score.extratime.home, away: f.score.extratime.away };
  }
  if (f.score.fulltime?.home != null && f.score.fulltime?.away != null) {
    return { home: f.score.fulltime.home, away: f.score.fulltime.away };
  }
  if (f.goals.home != null && f.goals.away != null) {
    return { home: f.goals.home, away: f.goals.away };
  }
  throw new Error("Placar de tempo regulamentar indisponivel");
}
