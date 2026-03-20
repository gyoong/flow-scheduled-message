import { NextRequest, NextResponse } from "next/server";
import { getChatRoom } from "@/lib/flow-api";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const roomId = request.nextUrl.searchParams.get("roomId");
  if (!roomId) {
    return NextResponse.json({ error: "roomId가 필요합니다" }, { status: 400 });
  }

  try {
    const data = await getChatRoom(roomId);
    return NextResponse.json({ title: data.title });
  } catch {
    return NextResponse.json({ error: "채팅방을 찾을 수 없습니다" }, { status: 404 });
  }
}
