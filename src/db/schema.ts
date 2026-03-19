import { pgTable, serial, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const scheduledMessages = pgTable("scheduled_messages", {
  id: serial("id").primaryKey(),
  authorEmail: varchar("author_email", { length: 255 }).notNull(),
  targetId: varchar("target_id", { length: 255 }).notNull(),
  targetName: varchar("target_name", { length: 255 }),
  content: text("content").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
