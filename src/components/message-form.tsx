"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MessageForm() {
  const router = useRouter();
  const [targetId, setTargetId] = useState("");
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [roomName, setRoomName] = useState("");
  const [fetchingRoom, setFetchingRoom] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date();
    setScheduledDate(today.toISOString().slice(0, 10));
    setScheduledTime(`${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`);
  }, []);

  const handleFetchRoom = async () => {
    if (!targetId || roomName) return;
    setFetchingRoom(true);
    setRoomName("");
    setError("");
    try {
      const res = await fetch(`/api/chats?roomId=${targetId}`);
      const data = await res.json();
      if (res.ok) {
        setRoomName(data.title);
      } else {
        setError(data.error || "채팅방을 찾을 수 없습니다");
      }
    } catch {
      setError("채팅방 조회 중 오류가 발생했습니다");
    } finally {
      setFetchingRoom(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
    if (scheduledAt <= new Date()) {
      setError("예약 시간은 현재 시간 이후여야 합니다");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId,
          targetName: roomName || targetId,
          content,
          scheduledAt: scheduledAt.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다");
        return;
      }

      router.push("/");
    } catch {
      setError("요청 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">
          채팅방 번호
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={targetId}
            onChange={(e) => { setTargetId(e.target.value); setRoomName(""); }}
            placeholder="채팅방 번호 입력"
            className="flex-1 border rounded-lg px-4 py-3 text-base"
            required
          />
          <button
            type="button"
            onClick={handleFetchRoom}
            disabled={!targetId || fetchingRoom}
            className="bg-primary text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-50 cursor-pointer whitespace-nowrap"
          >
            {fetchingRoom ? "조회 중..." : "가져오기"}
          </button>
        </div>
        {roomName && (
          <p className="mt-1 text-sm font-medium">이름 : <span className="text-primary">{roomName}</span></p>
        )}
        <p className="mt-1 text-xs text-gray-400">
          채팅방 더보기 &gt; 채팅방 설정 &gt; 채팅방 번호 복사
        </p>
      </div>

      <div>
        <label className="block text-base font-medium text-gray-700 mb-1">
          메시지 내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="보낼 메시지를 입력하세요"
          rows={4}
          className="w-full border rounded-lg px-4 py-3 text-base resize-y"
          required
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-base font-medium text-gray-700 mb-1">
            날짜
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-base font-medium text-gray-700 mb-1">
            시간
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full border rounded-lg px-4 py-3 text-base"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 cursor-pointer"
      >
        {submitting ? "등록 중..." : "예약 등록"}
      </button>
    </form>
  );
}
