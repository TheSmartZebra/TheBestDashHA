export function Steppers({ onDown, onUp, size = 26 }: { onDown: () => void; onUp: () => void; size?: number }) {
  const btnStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    border: "none",
    cursor: "pointer",
    fontSize: size > 26 ? 16 : 15,
    lineHeight: 1,
    fontFamily: "inherit",
    color: "var(--ink)",
    background: "var(--icon-off-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };
  return (
    <span style={{ display: "flex", gap: 5, flex: "none" }}>
      <button
        style={btnStyle}
        onClick={(e) => {
          e.stopPropagation();
          onDown();
        }}
      >
        −
      </button>
      <button
        style={btnStyle}
        onClick={(e) => {
          e.stopPropagation();
          onUp();
        }}
      >
        +
      </button>
    </span>
  );
}
