import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { scheduledMessages } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import { sendChatMessage } from "@/lib/flow-api";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const pendingMessages = await db
    .select()
    .from(scheduledMessages)
    .where(
      and(
        eq(scheduledMessages.status, "pending"),
        lte(scheduledMessages.scheduledAt, now)
      )
    )
    .limit(10);

  const results = [];

  for (const msg of pendingMessages) {
    try {
      await sendChatMessage(msg.targetId, msg.content, msg.authorEmail);

      await db
        .update(scheduledMessages)
        .set({ status: "sent", sentAt: now, updatedAt: now })
        .where(eq(scheduledMessages.id, msg.id));

      results.push({ id: msg.id, status: "sent" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      await db
        .update(scheduledMessages)
        .set({ status: "failed", errorMessage, updatedAt: now })
        .where(eq(scheduledMessages.id, msg.id));

      results.push({ id: msg.id, status: "failed", error: errorMessage });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
