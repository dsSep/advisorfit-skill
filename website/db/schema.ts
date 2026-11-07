import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

// No question, answer, email, name, or raw authentication identifier is stored.
export const demoUsage = sqliteTable("demo_usage", {
  requestId: text("request_id").primaryKey(),
  userKey: text("user_key").notNull(),
  day: text("day").notNull(),
  createdAt: integer("created_at").notNull(),
  busyUntil: integer("busy_until").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  budgetMicros: integer("budget_micros").notNull().default(150000),
}, (table) => [index("demo_usage_day_user_idx").on(table.day, table.userKey), index("demo_usage_user_busy_idx").on(table.userKey, table.busyUntil)]);
