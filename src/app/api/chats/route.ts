import { NextRequest, NextResponse } from "next/server";
import { getChatRoom, getChatRoomsByParticipant } from "@/lib/flow-api";
import { getSession } from "@/lib/auth";
import { ChatRoom } from "@/lib/types";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const roomId = request.nextUrl.searchParams.get("roomId");

  if (!roomId) {
    try {
      const data = await getChatRoomsByParticipant(session.email);
      const rooms: ChatRoom[] = data.projects.chatRooms.map((room: ChatRoom) => ({
        roomId: room.roomId,
        title: room.title || "(이름 없는 채팅방)",
        type: room.type,
      }));
      return NextResponse.json({ rooms });
    } catch {
      return NextResponse.json({ error: "채팅방 목록을 불러올 수 없습니다" }, { status: 500 });
    }
  }

  try {
    const data = await getChatRoom(roomId);
    return NextResponse.json({ title: data.projects.title || "(이름 없는 채팅방)" });
  } catch {
    return NextResponse.json({ error: "채팅방을 찾을 수 없습니다" }, { status: 404 });
  }
}
