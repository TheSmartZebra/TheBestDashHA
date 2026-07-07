import { createServer } from "node:http";
import nextEnv from "@next/env";

const dev = process.env.NODE_ENV !== "production";
// Custom server entry, so Next's automatic .env/.env.local loading (normally
// done by the `next` CLI) has to be triggered explicitly, before anything
// else reads process.env.
nextEnv.loadEnvConfig(process.cwd(), dev);

const next = (await import("next")).default;
const { attachRelay } = await import("./server/relay-server");
const { haHub } = await import("./server/ha-connection");
const { env } = await import("./lib/env");

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  attachRelay(server);

  // Establish the HA connection eagerly so it's warm before the first
  // browser client connects, rather than lazily on first WS message.
  haHub.getConnection().catch((err) => {
    console.error("[server] failed to connect to Home Assistant:", err instanceof Error ? err.message : err);
  });

  server.listen(env.port, () => {
    console.log(`> Ready on http://localhost:${env.port}`);
  });
});
