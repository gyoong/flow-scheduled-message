import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { scheduledMessages } from "@/db/schema";
import { eq, desc, and, or, lt, inArray } from "drizzle-orm";
import { qstashClient, getAppBaseUrl } from "@/lib/qstash";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  // 7일 지난 sent/failed 메시지 삭제
  await db
    .delete(scheduledMessages)
    .where(
      and(
        inArray(scheduledMessages.status, ["sent", "failed"]),
        lt(scheduledMessages.updatedAt, sevenDaysAgo)
      )
    );

  const messages = await db
    .select()
    .from(scheduledMessages)
    .where(eq(scheduledMessages.authorEmail, session.email))
    .orderBy(desc(scheduledMessages.scheduledAt));

  return NextResponse.json(messages);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  const { targetId, targetName, content, scheduledAt } = body;
  const authorEmail = session.email;

  if (!targetId || !content || !scheduledAt) {
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("QStash publish error:", errorMessage);
    return NextResponse.json(
      { error: "메시지 예약에 실패했습니다", detail: errorMessage },
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
