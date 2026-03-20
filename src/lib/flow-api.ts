const FLOW_BASE_URL = "https://api.flow.team";

async function flowFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${FLOW_BASE_URL}${path}`, {
    ...options,
    headers: {
      "x-flow-api-key": process.env.FLOW_API_KEY!,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await res.text();
  const parsed = body ? JSON.parse(body) : null;

  if (!parsed?.response?.success) {
    const errMsg = parsed?.response?.error?.message || `Flow API ${res.status}`;
    throw new Error(errMsg);
  }
  return parsed.response.data;
}

// 채팅방 상세정보 조회
export async function getChatRoom(roomId: string) {
  return flowFetch(`/v1/chats/${roomId}`);
}

// 채팅방에 메시지 전송
export async function sendChatMessage(
  roomId: string,
  contents: string,
  registerId: string
) {
  return flowFetch(`/v1/chats/${roomId}/messages`, {
    method: "POST",
    body: JSON.stringify({ registerId, contents }),
  });
}
