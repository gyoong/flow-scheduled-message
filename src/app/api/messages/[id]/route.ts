import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { scheduledMessages } from "@/db/schema";
import { eq } from "drizzle-orm";

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

  const [cancelled] = await db
    .update(scheduledMessages)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(scheduledMessages.id, Number(id)))
    .returning();

  return NextResponse.json(cancelled);
}
