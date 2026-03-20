import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { scheduledMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { qstashClient } from "@/lib/qstash";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [existing] = await db
    .select()
    .from(scheduledMessages)
    .where(eq(scheduledMessages.id, Number(id)));

  if (!existing) {
    return NextResponse.json({ error: "메시지를 찾을 수 없습니다" }, { status: 404 });
  }
  if (existing.status !== "pending") {
    return NextResponse.json({ error: "대기 중인 메시지만 취소할 수 있습니다" }, { status: 400 });
  }

  // QStash 취소와 DB 삭제를 병렬 실행
  const qstashDelete = existing.qstashMessageId
    ? qstashClient.messages.delete(existing.qstashMessageId).catch(() => {})
    : Promise.resolve();

  await Promise.all([
    qstashDelete,
    db
      .delete(scheduledMessages)
      .where(eq(scheduledMessages.id, Number(id))),
  ]);

  return NextResponse.json({ ok: true });
}
