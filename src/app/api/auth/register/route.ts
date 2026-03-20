import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "이메일과 비밀번호를 입력해주세요" },
      { status: 400 }
    );
  }

  if (!email.endsWith("@kolon.com")) {
    return NextResponse.json(
      { error: "@kolon.com 이메일만 가입할 수 있습니다" },
      { status: 400 }
    );
  }

  if (!/^\d{6}$/.test(password)) {
    return NextResponse.json(
      { error: "비밀번호는 숫자 6자리여야 합니다" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existing) {
    return NextResponse.json(
      { error: "이미 등록된 이메일입니다" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({ email, passwordHash });
  await createSession(email);

  return NextResponse.json({ email }, { status: 201 });
}
