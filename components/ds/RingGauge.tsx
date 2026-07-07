interface RingGaugeProps {
  frac: number; // 0-1
  size: number;
  color: string;
  label?: string;
  labelSize?: number;
}

export function RingGauge({ frac, size, color, label, labelSize }: RingGaugeProps) {
  const r = size / 2 - 5;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, frac));
  return (
    <span
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.14)" strokeWidth={5} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${clamped * c} ${c}`}
          style={{ transition: "stroke-dasharray .3s cubic-bezier(.2,.8,.2,1)" }}
        />
      </svg>
      {label ? (
        <span style={{ position: "absolute", fontSize: labelSize ?? (size > 70 ? 17 : 11.5), fontWeight: 700, letterSpacing: "-.01em" }}>
          {label}
        </span>
      ) : null}
    </span>
  );
}
