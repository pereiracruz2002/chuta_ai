/**
 * Scoring logic for predictions
 * Mirrors the database function for client-side display
 */

export interface ScoreResult {
  points: number;
  label: string;
}

export function calculatePoints(
  homePred: number,
  awayPred: number,
  homeScore: number | null,
  awayScore: number | null
): ScoreResult {
  if (homeScore === null || awayScore === null) {
    return { points: 0, label: "Aguardando resultado" };
  }

  // Exact score
  if (homePred === homeScore && awayPred === awayScore) {
    return { points: 10, label: "Placar exato!" };
  }

  const predDiff = homePred - awayPred;
  const actualDiff = homeScore - awayScore;

  // Check if winner/draw is correct
  const correctOutcome =
    (predDiff > 0 && actualDiff > 0) ||
    (predDiff < 0 && actualDiff < 0) ||
    (predDiff === 0 && actualDiff === 0);

  if (!correctOutcome) {
    return { points: 0, label: "Errou" };
  }

  // Correct goal difference
  if (predDiff === actualDiff) {
    return { points: 7, label: "Vencedor + saldo correto" };
  }

  // Got one team's goals right
  if (homePred === homeScore || awayPred === awayScore) {
    return { points: 5, label: "Vencedor + gols de um time" };
  }

  // Just the winner
  return { points: 3, label: "Vencedor correto" };
}
