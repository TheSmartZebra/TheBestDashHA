import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, type AppSessionData } from "../../../../server/session";

export async function POST() {
  const session = await getIronSession<AppSessionData>(await cookies(), sessionOptions());
  session.destroy();
  return NextResponse.json({ ok: true });
}
