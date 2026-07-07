import { NextResponse } from "next/server";
import { env } from "../../../../../lib/env";

// Dev Tools > States "Set State" uses HA's REST endpoint directly since there
// is no WS command for setting arbitrary state -- this is the one bespoke
// REST proxy route; everything else in Phases 2-4 goes through the generic
// ha_command WS passthrough instead.
export async function POST(request: Request, { params }: { params: Promise<{ entityId: string }> }) {
  const { entityId } = await params;
  const body = await request.json();

  let res: Response;
  try {
    res = await fetch(`${env.haUrl}/api/states/${entityId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.haToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  } catch {
    return NextResponse.json({ error: "Could not reach Home Assistant" }, { status: 502 });
  }

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
