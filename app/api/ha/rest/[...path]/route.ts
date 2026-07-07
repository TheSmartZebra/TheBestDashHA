import { NextResponse } from "next/server";
import { env } from "../../../../../lib/env";

// Thin, allowlisted proxy onto HA's REST API for the admin surfaces (Phases
// 2-4) whose canonical API is REST rather than the WS command set --
// history/logbook, config entries + their setup flows, backups, and the
// Supervisor (hassio) API. The app already sits behind its own login as a
// full-control gateway to the house (the WS `ha_command`/`call_service`
// passthroughs are equally unrestricted), so this allowlist exists to keep
// the proxy's *surface area* documented and intentional, not to add a
// meaningfully different trust boundary.
const ALLOWED_PREFIXES = [/^history\/period\//, /^logbook(\/|$)/, /^config\//, /^backup(\/|$)/, /^hassio\//, /^template$/, /^error_log$/];

function checkAllowed(path: string[]) {
  const joined = path.join("/");
  return ALLOWED_PREFIXES.some((re) => re.test(joined)) ? joined : null;
}

async function proxy(request: Request, joined: string, method: string) {
  const search = new URL(request.url).search;
  const hasBody = method === "POST" || method === "PUT";
  let body: string | undefined;
  if (hasBody) {
    const text = await request.text();
    body = text || undefined;
  }

  let res: Response;
  try {
    res = await fetch(`${env.haUrl}/api/${joined}${search}`, {
      method,
      headers: {
        Authorization: `Bearer ${env.haToken}`,
        ...(body ? { "Content-Type": "application/json" } : {})
      },
      body,
      cache: "no-store"
    });
  } catch {
    return NextResponse.json({ error: "Could not reach Home Assistant" }, { status: 502 });
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return NextResponse.json(data, { status: res.status });
}

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const joined = checkAllowed((await params).path);
  if (!joined) return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  return proxy(request, joined, "GET");
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const joined = checkAllowed((await params).path);
  if (!joined) return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  return proxy(request, joined, "POST");
}

export async function DELETE(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const joined = checkAllowed((await params).path);
  if (!joined) return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  return proxy(request, joined, "DELETE");
}
