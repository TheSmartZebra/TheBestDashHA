export function FanPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        padding: "5px 11px",
        borderRadius: 13,
        border: "none",
        cursor: "pointer",
        flex: "none",
        fontSize: 11.5,
        fontWeight: 600,
        fontFamily: "inherit",
        color: "var(--ink)",
        background: "var(--icon-off-bg)"
      }}
    >
      {label}
    </button>
  );
}
