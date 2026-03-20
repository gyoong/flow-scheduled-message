import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { db } from "@/db";
import { scheduledMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendChatMessage } from "@/lib/flow-api";

async function handler(req: NextRequest) {
  const { messageId } = await req.json();

  if (!messageId || isNaN(Number(messageId))) {
    return NextResponse.json({ error: "유효한 messageId가 필요합니다" }, { status: 400 });
  }

  const [msg] = await db
    .select()
    .from(scheduledMessages)
    .where(eq(scheduledMessages.id, Number(messageId)));

  if (!msg) {
    return NextResponse.json({ error: "메시지를 찾을 수 없습니다" }, { status: 404 });
  }

  if (msg.status !== "pending") {
    return NextResponse.json({ error: "대기 중인 메시지가 아닙니다", status: msg.status });
  }

  const now = new Date();

  try {
    await sendChatMessage(msg.targetId, msg.content, msg.authorEmail);

    await db
      .update(scheduledMessages)
      .set({ status: "sent", sentAt: now, updatedAt: now })
      .where(eq(scheduledMessages.id, msg.id));

    return NextResponse.json({ id: msg.id, status: "sent" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    await db
      .update(scheduledMessages)
      .set({ status: "failed", errorMessage, updatedAt: now })
      .where(eq(scheduledMessages.id, msg.id));

    return NextResponse.json({ id: msg.id, status: "failed", error: errorMessage }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
