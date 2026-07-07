export function FillBar({
  pct,
  orientation,
  variant
}: {
  pct: number;
  orientation: "horizontal" | "vertical";
  variant: "row" | "favorite";
}) {
  const size = variant === "row" ? { w: 56, h: 28 } : { w: 44, h: 92 };
  const radius = variant === "row" ? 14 : 22;

  return (
    <span
      style={{
        width: size.w,
        height: size.h,
        borderRadius: radius,
        flex: "none",
        background: "rgba(255,255,255,.12)",
        overflow: "hidden",
        display: "flex",
        flexDirection: orientation === "vertical" ? "column" : "row",
        justifyContent: orientation === "vertical" ? "flex-end" : "flex-start"
      }}
    >
      <span
        style={{
          display: "block",
          width: orientation === "vertical" ? "100%" : `${pct}%`,
          height: orientation === "vertical" ? `${pct}%` : "100%",
          background:
            orientation === "vertical"
              ? "linear-gradient(180deg, var(--accent-lite), var(--accent))"
              : "linear-gradient(90deg, var(--accent), var(--accent-lite))",
          transition: "width .15s, height .15s"
        }}
      />
    </span>
  );
}
