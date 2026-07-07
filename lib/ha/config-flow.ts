import { haRest } from "./rest";

export interface SchemaEntry {
  name: string;
  required?: boolean;
  default?: unknown;
  type?: string;
  selector?: Record<string, any>;
  description?: { suggested_value?: unknown };
}

export interface FlowStep {
  flow_id: string;
  handler: string | string[];
  step_id?: string;
  type: "form" | "menu" | "create_entry" | "abort" | "progress" | "external" | "show_progress_done";
  data_schema?: SchemaEntry[];
  errors?: Record<string, string>;
  description_placeholders?: Record<string, string>;
  last_step?: boolean | null;
  menu_options?: string[] | Record<string, string>;
  reason?: string;
  title?: string;
  result?: { entry_id: string; title: string };
  progress_action?: string;
}

export const configFlow = {
  listHandlers: () => haRest.get<string[]>("config/config_entries/flow_handlers"),
  start: (domain: string) => haRest.post<FlowStep>("config/config_entries/flow", { handler: domain, show_advanced_options: false }),
  startOptions: (entryId: string) => haRest.post<FlowStep>("config/config_entries/options/flow", { handler: entryId }),
  step: (flowId: string, data: Record<string, unknown>) => haRest.post<FlowStep>(`config/config_entries/flow/${flowId}`, data),
  abort: (flowId: string) => haRest.del<void>(`config/config_entries/flow/${flowId}`)
};
