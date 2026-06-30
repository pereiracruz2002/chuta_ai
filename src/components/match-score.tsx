import {
  resolveMatchDisplayScores,
  type MatchForScoreDisplay,
} from "@/lib/match-scores";

interface MatchScoreProps {
  match: MatchForScoreDisplay;
  size?: "sm" | "lg";
}

export function MatchScore({ match, size = "lg" }: MatchScoreProps) {
  const scores = resolveMatchDisplayScores(match);

  const mainClass =
    size === "lg" ? "text-3xl font-black" : "font-black text-lg";
  const separatorClass =
    size === "lg"
      ? "text-muted-foreground text-xl font-bold"
      : "text-muted-foreground font-bold";
  const penaltyClass =
    size === "lg" ? "text-base font-bold" : "text-sm font-bold";

  const showRegulation = scores.home != null && scores.away != null;
  const showPenaltyScores =
    scores.homePenalty != null && scores.awayPenalty != null;
  const showLabels = scores.wentToPenalties;

  return (
    <div className="flex flex-col items-center gap-1">
      {showRegulation && (
        <div className="flex flex-col items-center gap-0.5">
          {showLabels && (
            <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/80">
              Tempo normal
            </span>
          )}
          <div className="flex items-center gap-2">
            <span className={mainClass}>{scores.home}</span>
            <span className={separatorClass}>:</span>
            <span className={mainClass}>{scores.away}</span>
          </div>
        </div>
      )}

      {scores.wentToPenalties && (
        <div
          className={`flex flex-col items-center gap-0.5 ${
            showRegulation ? "pt-1 border-t border-border/40 w-full" : ""
          }`}
        >
          <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80">
            Penaltis
          </span>
          {showPenaltyScores ? (
            <div className={`flex items-center gap-1.5 text-muted-foreground ${penaltyClass}`}>
              <span>{scores.homePenalty}</span>
              <span className="text-xs font-bold">:</span>
              <span>{scores.awayPenalty}</span>
            </div>
          ) : scores.penaltyWinner ? (
            <span className="text-xs font-semibold text-muted-foreground text-center max-w-[140px] leading-tight">
              {scores.penaltyWinner}
            </span>
          ) : null}
        </div>
      )}

      {!showRegulation && !scores.wentToPenalties && (
        <div className="flex items-center gap-2">
          <span className={mainClass}>—</span>
          <span className={separatorClass}>:</span>
          <span className={mainClass}>—</span>
        </div>
      )}
    </div>
  );
}
