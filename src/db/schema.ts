import { pgTable, serial, varchar, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
}, (table) => [
  uniqueIndex("users_email_idx").on(table.email),
]);

export type User = typeof users.$inferSelect;

export const scheduledMessages = pgTable("scheduled_messages", {
  id: serial("id").primaryKey(),
  authorEmail: varchar("author_email", { length: 255 }).notNull(),
  targetId: varchar("target_id", { length: 255 }).notNull(),
  targetName: varchar("target_name", { length: 255 }),
  content: text("content").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  qstashMessageId: varchar("qstash_message_id", { length: 255 }),
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
