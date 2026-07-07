import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // We run Next in "custom server" mode (see server.ts) so our own
  // WebSocket relay can share the same HTTP upgrade handshake.
  // ESLint flat-config setup is left for a follow-up pass; don't let lint
  // configuration gaps block the production build in the meantime.
  eslint: { ignoreDuringBuilds: true }
};

export default nextConfig;
