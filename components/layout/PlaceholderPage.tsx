import { Header } from "./Header";

export function PlaceholderPage({ title, phase, note }: { title: string; phase: string; note?: string }) {
  return (
    <>
      <Header title={title} showEdit={false} />
      <div
        style={{
          marginTop: 8,
          padding: 20,
          borderRadius: 16,
          background: "var(--surface-glass)",
          backdropFilter: "blur(24px)",
          fontSize: 13.5,
          lineHeight: 1.6,
          opacity: 0.75,
          maxWidth: 560
        }}
      >
        <strong style={{ opacity: 1 }}>{title}</strong> is scheduled for {phase} of the build (see the project's
        phased delivery plan). {note ?? "This page is a placeholder so navigation and deep links already work end-to-end."}
      </div>
    </>
  );
}
