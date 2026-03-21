"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChatRoom } from "@/lib/types";

export default function MessageForm() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [targetId, setTargetId] = useState("");
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date();
    setScheduledDate(today.toISOString().slice(0, 10));
    setScheduledTime(`${String(today.getHours()).padStart(2, "0")}:${String(today.getMinutes()).padStart(2, "0")}`);

    fetch("/api/chats")
      .then((res) => res.json())
      .then((data) => {
        if (data.rooms) setRooms(data.rooms);
      })
      .catch(() => setError("채팅방 목록을 불러올 수 없습니다"))
      .finally(() => setLoadingRooms(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`);
    if (scheduledAt <= new Date()) {
      setError("예약 시간은 현재 시간 이후여야 합니다");
      return;
    }

    const room = rooms.find((r) => r.roomId === targetId);

    setSubmitting(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId,
          targetName: room?.title || targetId,
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
          채팅방
        </label>
        <div className="relative">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-base bg-white appearance-none"
            required
            disabled={loadingRooms}
          >
            <option value="">
              {loadingRooms ? "채팅방 목록 불러오는 중..." : "채팅방을 선택하세요"}
            </option>
            {rooms.map((room) => (
              <option key={room.roomId} value={room.roomId}>
                {room.title}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
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
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base resize-y"
          required
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-base font-medium text-gray-700 mb-1">
            날짜
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
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
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {submitting ? "등록 중..." : "예약 등록"}
      </button>
    </form>
  );
}
