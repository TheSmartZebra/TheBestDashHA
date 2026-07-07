"use client";

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api/ha/rest/${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error((data && (data.message || data.error)) || `Request failed (${res.status})`);
  }
  return data as T;
}

export const haRest = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body?: unknown) => request<T>("POST", path, body ?? {}),
  del: <T>(path: string) => request<T>("DELETE", path)
};
