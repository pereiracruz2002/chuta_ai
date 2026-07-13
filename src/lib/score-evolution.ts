export type EvolutionMember = {
  user_id: string;
  users?: { name?: string | null; avatar_url?: string | null } | null;
};

export type EvolutionPrediction = {
  user_id: string;
  match_id: string;
  points: number | null;
};

export type EvolutionMatch = {
  id: string;
  home_team: string;
  away_team: string;
  starts_at: string;
  finished: boolean;
};

export type EvolutionPoint = {
  matchId: string;
  label: string;
  dateLabel: string;
  startsAt: string;
  scores: Record<string, number>;
  ranks: Record<string, number>;
};

export type RankMovement = {
  userId: string;
  name: string;
  avatarUrl: string | null;
  currentScore: number;
  currentRank: number;
  bestRank: number;
  worstRank: number;
  startRank: number;
  delta: number;
};

function shortTeamName(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return parts
    .map((p) => p[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function formatMatchLabel(match: EvolutionMatch): string {
  return `${shortTeamName(match.home_team)}×${shortTeamName(match.away_team)}`;
}

function formatDateLabel(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function computeRanks(scores: Record<string, number>, userIds: string[]): Record<string, number> {
  const sorted = [...userIds].sort((a, b) => {
    const scoreDiff = (scores[b] ?? 0) - (scores[a] ?? 0);
    if (scoreDiff !== 0) return scoreDiff;
    return a.localeCompare(b);
  });

  const ranks: Record<string, number> = {};
  sorted.forEach((userId, index) => {
    ranks[userId] = index + 1;
  });
  return ranks;
}

export function buildScoreEvolution(
  members: EvolutionMember[],
  matches: EvolutionMatch[],
  predictions: EvolutionPrediction[]
): { points: EvolutionPoint[]; movements: RankMovement[] } {
  const userIds = members.map((m) => m.user_id);
  if (userIds.length === 0) {
    return { points: [], movements: [] };
  }

  const finishedMatches = [...matches]
    .filter((m) => m.finished)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());

  const pointsByUserMatch = new Map<string, number>();
  for (const prediction of predictions) {
    pointsByUserMatch.set(
      `${prediction.user_id}:${prediction.match_id}`,
      prediction.points ?? 0
    );
  }

  const cumulative: Record<string, number> = Object.fromEntries(
    userIds.map((id) => [id, 0])
  );

  const initialRanks = computeRanks(cumulative, userIds);
  const points: EvolutionPoint[] = [
    {
      matchId: "start",
      label: "Início",
      dateLabel: "Início",
      startsAt: "",
      scores: { ...cumulative },
      ranks: initialRanks,
    },
  ];

  const rankHistory: Record<string, number[]> = Object.fromEntries(
    userIds.map((id) => [id, [initialRanks[id]]])
  );

  for (const match of finishedMatches) {
    for (const userId of userIds) {
      const earned = pointsByUserMatch.get(`${userId}:${match.id}`) ?? 0;
      cumulative[userId] = (cumulative[userId] ?? 0) + earned;
    }

    const ranks = computeRanks(cumulative, userIds);
    for (const userId of userIds) {
      rankHistory[userId].push(ranks[userId]);
    }

    points.push({
      matchId: match.id,
      label: formatMatchLabel(match),
      dateLabel: formatDateLabel(match.starts_at),
      startsAt: match.starts_at,
      scores: { ...cumulative },
      ranks,
    });
  }

  const lastPoint = points[points.length - 1];
  const movements: RankMovement[] = members
    .map((member) => {
      const history = rankHistory[member.user_id] ?? [1];
      // Skip the artificial "all tied at 0" snapshot; baseline is after the first finished match
      const rankedHistory = history.length > 1 ? history.slice(1) : history;
      const startRank = rankedHistory[0] ?? 1;
      const currentRank = lastPoint.ranks[member.user_id] ?? startRank;
      // Positive delta = climbed (lower rank number is better)
      const delta = startRank - currentRank;

      return {
        userId: member.user_id,
        name: member.users?.name || "Usuário",
        avatarUrl: member.users?.avatar_url ?? null,
        currentScore: lastPoint.scores[member.user_id] ?? 0,
        currentRank,
        bestRank: Math.min(...rankedHistory),
        worstRank: Math.max(...rankedHistory),
        startRank,
        delta,
      };
    })
    .sort((a, b) => a.currentRank - b.currentRank);

  return { points, movements };
}

export const SERIES_COLORS = [
  "#059669", // emerald
  "#2563eb", // blue
  "#d97706", // amber
  "#dc2626", // red
  "#7c3aed", // violet
  "#0891b2", // cyan
  "#ea580c", // orange
  "#db2777", // pink
  "#4f46e5", // indigo
  "#65a30d", // lime
  "#0d9488", // teal
  "#9333ea", // purple
];
