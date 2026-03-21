// Google OAuth로 전환되어 더 이상 사용하지 않습니다.
// /api/auth/google 을 사용하세요.
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "이 엔드포인트는 더 이상 사용되지 않습니다. Google 로그인을 사용해주세요." },
    { status: 410 }
  );
}
