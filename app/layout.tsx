import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Home",
  description: "A liquid-glass, Apple Home-inspired dashboard for Home Assistant."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-tint="Graphite">
      <body>{children}</body>
    </html>
  );
}
