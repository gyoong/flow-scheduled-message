import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { scheduledMessages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

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

  const [message] = await db
    .insert(scheduledMessages)
    .values({
      authorEmail,
      targetId,
      targetName: targetName || targetId,
      content,
      scheduledAt: new Date(scheduledAt),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return NextResponse.json(message, { status: 201 });
}
