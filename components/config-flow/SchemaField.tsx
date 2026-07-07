"use client";

import { useRegistries, useAllStates } from "../../store/entities-store";
import type { SchemaEntry } from "../../lib/ha/config-flow";
import adminStyles from "../admin/admin.module.css";

function humanize(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function SchemaField({
  entry,
  value,
  onChange,
  error
}: {
  entry: SchemaEntry;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const registries = useRegistries();
  const states = useAllStates();

  const selectorKind = entry.selector ? Object.keys(entry.selector)[0] : undefined;
  const selectorConfig = selectorKind ? entry.selector![selectorKind] : undefined;

  let field: React.ReactNode;

  if (selectorKind === "boolean" || entry.type === "boolean") {
    field = (
      <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
        <span style={{ fontSize: 13 }}>{humanize(entry.name)}</span>
      </label>
    );
  } else if (selectorKind === "select") {
    const options: Array<string | { value: string; label: string }> = selectorConfig?.options ?? [];
    field = (
      <select className={adminStyles.select} style={{ width: "100%" }} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          Choose…
        </option>
        {options.map((opt) => {
          const v = typeof opt === "string" ? opt : opt.value;
          const label = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={v} value={v}>
              {label}
            </option>
          );
        })}
      </select>
    );
  } else if (selectorKind === "entity") {
    const domain = selectorConfig?.domain as string | string[] | undefined;
    const domains = domain ? (Array.isArray(domain) ? domain : [domain]) : null;
    const ids = Object.keys(states).filter((id) => !domains || domains.includes(id.split(".")[0]!));
    field = (
      <>
        <input
          className={adminStyles.search}
          list={`entities-${entry.name}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
        <datalist id={`entities-${entry.name}`}>
          {ids.map((id) => (
            <option key={id} value={id} />
          ))}
        </datalist>
      </>
    );
  } else if (selectorKind === "device") {
    field = (
      <select className={adminStyles.select} style={{ width: "100%" }} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">None</option>
        {registries.devices.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name_by_user ?? d.name ?? d.id}
          </option>
        ))}
      </select>
    );
  } else if (selectorKind === "area") {
    field = (
      <select className={adminStyles.select} style={{ width: "100%" }} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">None</option>
        {registries.areas.map((a) => (
          <option key={a.area_id} value={a.area_id}>
            {a.name}
          </option>
        ))}
      </select>
    );
  } else if (selectorKind === "number" || entry.type === "integer" || entry.type === "float") {
    field = (
      <input
        className={adminStyles.search}
        type="number"
        min={selectorConfig?.min}
        max={selectorConfig?.max}
        step={selectorConfig?.step ?? (entry.type === "integer" ? 1 : "any")}
        value={(value as number | string | undefined) ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
      />
    );
  } else if (selectorKind === "time") {
    field = <input className={adminStyles.search} type="time" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  } else if (selectorKind === "date") {
    field = <input className={adminStyles.search} type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  } else if (selectorKind === "text" && selectorConfig?.type === "password") {
    field = <input className={adminStyles.search} type="password" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  } else if (selectorKind === "text" || entry.type === "string" || !entry.selector) {
    field = <input className={adminStyles.search} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  } else {
    // Unrecognized/exotic selector (object, template, color_rgb, media, etc.) -- raw JSON fallback
    // so new HA selector kinds never crash the flow, just degrade to a manual field.
    field = (
      <textarea
        className={adminStyles.textarea}
        rows={3}
        value={typeof value === "string" ? value : JSON.stringify(value ?? "")}
        onChange={(e) => {
          try {
            onChange(JSON.parse(e.target.value));
          } catch {
            onChange(e.target.value);
          }
        }}
      />
    );
  }

  if (selectorKind === "boolean" || entry.type === "boolean") {
    return (
      <div style={{ marginBottom: 4 }}>
        {field}
        {error ? <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{error}</div> : null}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 4 }}>
      <div className={adminStyles.label} style={{ marginTop: 12 }}>
        {humanize(entry.name)}
        {entry.required ? " *" : ""}
      </div>
      {field}
      {error ? <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 4 }}>{error}</div> : null}
    </div>
  );
}
