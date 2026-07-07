import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import type { IncomingMessage, ServerResponse } from "node:http";
import { env } from "../lib/env";

export interface AppSessionData {
  loggedIn?: boolean;
}

export function sessionOptions(): SessionOptions {
  return {
    cookieName: "hd_session",
    password: env.sessionSecret,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax"
    }
  };
}

export function getSession(
  req: IncomingMessage,
  res: ServerResponse
): Promise<IronSession<AppSessionData>> {
  return getIronSession<AppSessionData>(req, res, sessionOptions());
}

/** Parses the session cookie from a raw Cookie header, for the WS upgrade path. */
export async function getSessionFromCookieHeader(cookieHeader: string | undefined) {
  const req = { headers: { cookie: cookieHeader ?? "" } } as IncomingMessage;
  const res = { getHeader: () => undefined, setHeader: () => undefined } as unknown as ServerResponse;
  return getIronSession<AppSessionData>(req, res, sessionOptions());
}
