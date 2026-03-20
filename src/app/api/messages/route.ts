import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { scheduledMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { qstashClient, getAppBaseUrl } from "@/lib/qstash";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "email 파라미터가 필요합니다" }, { status: 400 });
  }

  const messages = await db
    .select()
    .from(scheduledMessages)
    .where(eq(scheduledMessages.authorEmail, email))
    .orderBy(desc(scheduledMessages.scheduledAt));

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { authorEmail, targetId, targetName, content, scheduledAt } = body;

  if (!authorEmail || !targetId || !content || !scheduledAt) {
    return NextResponse.json(
      { error: "필수 필드가 누락되었습니다" },
      { status: 400 }
    );
  }

  const now = new Date();
  const scheduledDate = new Date(scheduledAt);
  const delaySeconds = Math.max(0, Math.floor((scheduledDate.getTime() - now.getTime()) / 1000));

  const [message] = await db
    .insert(scheduledMessages)
    .values({
      authorEmail,
      targetId,
      targetName: targetName || targetId,
      content,
      scheduledAt: scheduledDate,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  // QStash에 지연 메시지 발행
  let res;
  try {
    const baseUrl = getAppBaseUrl();
    res = await qstashClient.publishJSON({
      url: `${baseUrl}/api/send-message`,
      body: { messageId: message.id },
      delay: delaySeconds,
      retries: 3,
    });
  } catch (error) {
    // QStash 발행 실패 시 DB 행 정리
    await db
      .delete(scheduledMessages)
      .where(eq(scheduledMessages.id, message.id));
    return NextResponse.json(
      { error: "메시지 예약에 실패했습니다" },
      { status: 502 }
    );
  }

  // QStash messageId를 DB에 저장 (취소 시 사용)
  await db
    .update(scheduledMessages)
    .set({ qstashMessageId: res.messageId })
    .where(eq(scheduledMessages.id, message.id));

  return NextResponse.json({ ...message, qstashMessageId: res.messageId }, { status: 201 });
}
