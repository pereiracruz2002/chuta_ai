interface MatchScoreProps {
  homeScore: number | null;
  awayScore: number | null;
  homePenaltyScore?: number | null;
  awayPenaltyScore?: number | null;
  size?: "sm" | "lg";
}

export function MatchScore({
  homeScore,
  awayScore,
  homePenaltyScore,
  awayPenaltyScore,
  size = "lg",
}: MatchScoreProps) {
  const hasPenalties =
    homePenaltyScore != null && awayPenaltyScore != null;

  const mainClass =
    size === "lg"
      ? "text-3xl font-black"
      : "font-black text-lg";
  const separatorClass =
    size === "lg"
      ? "text-muted-foreground text-xl font-bold"
      : "text-muted-foreground font-bold";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="flex items-center gap-2">
        <span className={mainClass}>{homeScore}</span>
        <span className={separatorClass}>:</span>
        <span className={mainClass}>{awayScore}</span>
      </div>
      {hasPenalties && (
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            pen.
          </span>
          <span className="text-sm font-bold">{homePenaltyScore}</span>
          <span className="text-xs font-bold">:</span>
          <span className="text-sm font-bold">{awayPenaltyScore}</span>
        </div>
      )}
    </div>
  );
}
