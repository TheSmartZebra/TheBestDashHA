import { Icon } from "../../ds/Icon";

export function IconCircle({
  kind,
  on,
  colorVar,
  size = 40
}: {
  kind: string;
  on: boolean;
  colorVar: string;
  size?: number;
}) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "none",
        background: on ? colorVar : "var(--icon-off-bg)",
        transition: "background .25s"
      }}
    >
      <Icon kind={kind} color={on ? "#fff" : "var(--ink-dim)"} size={size > 50 ? 28 : 19} />
    </span>
  );
}
