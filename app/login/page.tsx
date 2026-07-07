"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./page.module.css";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Login failed");
        return;
      }
      router.push(params.get("next") ?? "/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.card} onSubmit={onSubmit}>
        <div className={styles.title}>My Home</div>
        <div className={styles.sub}>Sign in to your dashboard</div>
        <input
          className={styles.input}
          type="password"
          placeholder="Password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error ? <div className={styles.error}>{error}</div> : null}
        <button className={styles.button} type="submit" disabled={loading || !password}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className={styles.wrap} />}>
      <LoginForm />
    </Suspense>
  );
}
