import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, type AppSessionData } from "../../../../server/session";
import { env } from "../../../../lib/env";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };

  if (!password || password !== env.appPassword) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  const session = await getIronSession<AppSessionData>(await cookies(), sessionOptions());
  session.loggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
