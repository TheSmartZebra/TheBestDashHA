import { NextResponse } from "next/server";
import { env } from "../../../../../../lib/env";

// Proxies a Home Assistant camera's current snapshot. The HA bearer token is
// injected here, server-side, and never reaches the browser. This is a
// still-image refresh (the client re-requests on an interval) for Phase 1;
// HLS/WebRTC low-latency live video is a follow-up (see the phased plan).
export async function GET(_request: Request, { params }: { params: Promise<{ entityId: string }> }) {
  const { entityId } = await params;

  let res: Response;
  try {
    res = await fetch(`${env.haUrl}/api/camera_proxy/${entityId}`, {
      headers: { Authorization: `Bearer ${env.haToken}` },
      cache: "no-store"
    });
  } catch {
    return NextResponse.json({ error: "Could not reach Home Assistant" }, { status: 502 });
  }

  if (!res.ok || !res.body) {
    return NextResponse.json({ error: "Failed to fetch camera snapshot" }, { status: res.status || 502 });
  }

  return new NextResponse(res.body, {
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "no-store"
    }
  });
}
