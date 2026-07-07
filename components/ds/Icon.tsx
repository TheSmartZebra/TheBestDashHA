const PATHS: Record<string, (c: string) => React.ReactNode> = {
  light: (c) => (
    <>
      <circle cx={10} cy={8} r={4.6} fill={c} />
      <rect x={8.4} y={13} width={3.2} height={3.6} rx={1.2} fill={c} />
    </>
  ),
  climate: (c) => (
    <>
      <rect x={8.6} y={2.6} width={2.8} height={9} rx={1.4} fill={c} />
      <circle cx={10} cy={14} r={3.4} fill={c} />
    </>
  ),
  lock: (c) => (
    <>
      <rect x={4.8} y={8.6} width={10.4} height={8.2} rx={2.2} fill={c} />
      <path d="M6.8 8.6V6.6a3.2 3.2 0 0 1 6.4 0v2" stroke={c} strokeWidth={1.9} fill="none" />
    </>
  ),
  unlock: (c) => (
    <>
      <rect x={4.8} y={8.6} width={10.4} height={8.2} rx={2.2} fill={c} />
      <path d="M10.2 8.6V6.6a3.2 3.2 0 0 1 6.4 0" stroke={c} strokeWidth={1.9} fill="none" />
    </>
  ),
  camera: (c) => (
    <>
      <rect x={2.4} y={5.8} width={10} height={8.4} rx={2.2} fill={c} />
      <path d="M12.4 8.8l5-2.4v7.2l-5-2.4z" fill={c} />
    </>
  ),
  media_player: (c) => (
    <>
      <rect x={2.6} y={4.4} width={14.8} height={9.4} rx={2} fill={c} />
      <rect x={6.4} y={15.2} width={7.2} height={1.8} rx={0.9} fill={c} />
    </>
  ),
  speaker: (c) => (
    <>
      <rect x={5.6} y={2.8} width={8.8} height={14.4} rx={2.4} stroke={c} strokeWidth={1.7} />
      <circle cx={10} cy={12} r={2.6} fill={c} />
      <circle cx={10} cy={6.4} r={1.2} fill={c} />
    </>
  ),
  outlet: (c) => (
    <>
      <circle cx={10} cy={10} r={6.8} stroke={c} strokeWidth={1.8} />
      <circle cx={7.8} cy={10} r={1.1} fill={c} />
      <circle cx={12.2} cy={10} r={1.1} fill={c} />
    </>
  ),
  switch: (c) => (
    <>
      <rect x={3} y={7} width={14} height={6} rx={3} stroke={c} strokeWidth={1.7} />
      <circle cx={13} cy={10} r={2} fill={c} />
    </>
  ),
  fan: (c) => (
    <>
      <circle cx={10} cy={10} r={1.8} fill={c} />
      <circle cx={10} cy={5} r={2.7} fill={c} opacity={0.85} />
      <circle cx={5.8} cy={12.6} r={2.7} fill={c} opacity={0.85} />
      <circle cx={14.2} cy={12.6} r={2.7} fill={c} opacity={0.85} />
    </>
  ),
  cover: (c) => (
    <>
      <rect x={3.6} y={3.6} width={12.8} height={12.8} rx={2} stroke={c} strokeWidth={1.8} />
      <rect x={4.6} y={6.8} width={10.8} height={1.6} fill={c} />
      <rect x={4.6} y={10} width={10.8} height={1.6} fill={c} />
    </>
  ),
  sensor: (c) => (
    <>
      <rect x={5} y={2.8} width={10} height={14.4} rx={2.2} stroke={c} strokeWidth={1.7} />
      <rect x={5} y={8.4} width={10} height={1.5} fill={c} />
      <rect x={7} y={5} width={1.5} height={2.2} rx={0.75} fill={c} />
    </>
  ),
  binary_sensor: (c) => (
    <>
      <circle cx={10} cy={10} r={6.6} stroke={c} strokeWidth={1.8} />
      <circle cx={10} cy={10} r={2.4} fill={c} />
    </>
  ),
  humidifier: (c) => (
    <>
      <path d="M10 2.6c3 4 4.6 6.6 4.6 9a4.6 4.6 0 1 1-9.2 0c0-2.4 1.6-5 4.6-9z" fill={c} />
    </>
  ),
  vacuum: (c) => (
    <>
      <circle cx={10} cy={10} r={6.8} stroke={c} strokeWidth={1.8} />
      <circle cx={10} cy={10} r={2} fill={c} />
    </>
  ),
  alarm_control_panel: (c) => (
    <>
      <path d="M10 2.6l6.4 2.8v4.4c0 4-2.7 6.8-6.4 8-3.7-1.2-6.4-4-6.4-8V5.4z" fill={c} />
    </>
  ),
  home: (c) => (
    <>
      <rect x={3.4} y={3.4} width={6} height={6} rx={1.6} fill={c} />
      <rect x={10.6} y={3.4} width={6} height={6} rx={1.6} fill={c} />
      <rect x={3.4} y={10.6} width={6} height={6} rx={1.6} fill={c} />
      <rect x={10.6} y={10.6} width={6} height={6} rx={1.6} fill={c} />
    </>
  ),
  clock: (c) => (
    <>
      <circle cx={10} cy={10} r={6.8} stroke={c} strokeWidth={1.8} />
      <rect x={9.3} y={5.8} width={1.5} height={4.8} rx={0.75} fill={c} />
      <rect x={9.4} y={9.4} width={4.2} height={1.5} rx={0.75} fill={c} />
    </>
  ),
  diamond: (c) => <rect x={5.5} y={5.5} width={9} height={9} rx={1.6} fill={c} transform="rotate(45 10 10)" />,
  door: (c) => (
    <>
      <rect x={5.4} y={3} width={9.2} height={14} rx={1.8} fill={c} />
      <circle cx={12.2} cy={10.2} r={1.1} fill="#00000055" />
    </>
  ),
  sun: (c) => (
    <>
      <circle cx={10} cy={10} r={3.6} fill={c} />
      <rect x={9.2} y={2.4} width={1.6} height={3.2} rx={0.8} fill={c} />
      <rect x={9.2} y={14.4} width={1.6} height={3.2} rx={0.8} fill={c} />
      <rect x={2.4} y={9.2} width={3.2} height={1.6} rx={0.8} fill={c} />
      <rect x={14.4} y={9.2} width={3.2} height={1.6} rx={0.8} fill={c} />
    </>
  ),
  moon: (c) => (
    <>
      <circle cx={10} cy={10} r={5.4} fill={c} />
      <circle cx={15.4} cy={5} r={1.4} fill={c} opacity={0.7} />
    </>
  ),
  film: (c) => (
    <>
      <rect x={3} y={4.6} width={14} height={10.8} rx={2} fill={c} />
      <circle cx={7} cy={10} r={1.2} fill="#00000055" />
      <circle cx={13} cy={10} r={1.2} fill="#00000055" />
    </>
  ),
  plus: (c) => (
    <>
      <rect x={9.2} y={4} width={1.6} height={12} rx={0.8} fill={c} />
      <rect x={4} y={9.2} width={12} height={1.6} rx={0.8} fill={c} />
    </>
  ),
  dots: (c) => (
    <>
      <circle cx={4.6} cy={10} r={1.5} fill={c} />
      <circle cx={10} cy={10} r={1.5} fill={c} />
      <circle cx={15.4} cy={10} r={1.5} fill={c} />
    </>
  ),
  sliders: (c) => (
    <>
      <rect x={3} y={5} width={14} height={1.6} rx={0.8} fill={c} />
      <rect x={3} y={13.4} width={14} height={1.6} rx={0.8} fill={c} />
      <circle cx={7} cy={5.8} r={2.1} fill={c} />
      <circle cx={13} cy={14.2} r={2.1} fill={c} />
    </>
  ),
  ham: (c) => (
    <>
      <rect x={3.4} y={5} width={13.2} height={1.6} rx={0.8} fill={c} />
      <rect x={3.4} y={9.2} width={13.2} height={1.6} rx={0.8} fill={c} />
      <rect x={3.4} y={13.4} width={13.2} height={1.6} rx={0.8} fill={c} />
    </>
  ),
  mic: (c) => (
    <>
      <rect x={7.4} y={2.6} width={5.2} height={9.6} rx={2.6} fill={c} />
      <path d="M5 9.4a5 5 0 0 0 10 0" stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" />
      <rect x={9.3} y={14.6} width={1.4} height={2.8} rx={0.7} fill={c} />
    </>
  ),
  person: (c) => (
    <>
      <circle cx={10} cy={6.6} r={3.4} fill={c} />
      <path d="M3.4 17c0-3.6 3-6 6.6-6s6.6 2.4 6.6 6" stroke={c} strokeWidth={1.8} fill="none" strokeLinecap="round" />
    </>
  )
};

export function Icon({ kind, color = "currentColor", size = 18 }: { kind: string; color?: string; size?: number }) {
  const draw = PATHS[kind] ?? PATHS.light!;
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      {draw(color)}
    </svg>
  );
}
