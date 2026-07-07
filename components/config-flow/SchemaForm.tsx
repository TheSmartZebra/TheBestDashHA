"use client";

import type { SchemaEntry } from "../../lib/ha/config-flow";
import { SchemaField } from "./SchemaField";

export function SchemaForm({
  schema,
  values,
  onChange,
  errors
}: {
  schema: SchemaEntry[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  errors?: Record<string, string>;
}) {
  return (
    <div>
      {schema.map((entry) => (
        <SchemaField
          key={entry.name}
          entry={entry}
          value={values[entry.name] ?? entry.default ?? entry.description?.suggested_value}
          onChange={(v) => onChange(entry.name, v)}
          error={errors?.[entry.name]}
        />
      ))}
    </div>
  );
}
