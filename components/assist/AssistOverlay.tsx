"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "../ds/Icon";
import { getHaClient } from "../../lib/ha/client";
import styles from "./AssistOverlay.module.css";

interface Message {
  from: "user" | "assist";
  text: string;
}

export function AssistOverlay({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMessages((m) => [...m, { from: "user", text }]);
    setBusy(true);
    try {
      const reply = await getHaClient().assistText(text, conversationId);
      setConversationId(reply.conversationId);
      setMessages((m) => [...m, { from: "assist", text: reply.text }]);
    } catch (err) {
      setMessages((m) => [...m, { from: "assist", text: `(error: ${err instanceof Error ? err.message : String(err)})` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <Icon kind="mic" color="var(--accent)" size={18} />
          Assist
        </div>
        <div className={styles.transcript}>
          {messages.length === 0 ? <div style={{ opacity: 0.5, fontSize: 13.5 }}>Ask Home Assistant anything — "turn off the kitchen lights", "is the front door locked?"</div> : null}
          {messages.map((m, i) => (
            <div key={i} className={`${styles.bubble} ${m.from === "user" ? styles.bubbleUser : styles.bubbleAssist}`}>
              {m.text}
            </div>
          ))}
        </div>
        <form className={styles.form} onSubmit={send}>
          <input
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a command…"
            autoFocus
          />
          <button className={styles.send} type="submit" disabled={busy}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
