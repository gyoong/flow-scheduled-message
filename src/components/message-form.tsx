"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MessageForm() {
  const router = useRouter();
  const [targetId, setTargetId] = useState("");
  const [content, setContent] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setScheduledDate(tomorrow.toISOString().slice(0, 10));
    setScheduledTime("09:00");
  }, []);

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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          채팅방 번호
        </label>
        <input
          type="text"
          value={targetId}
          onChange={(e) => setTargetId(e.target.value)}
          placeholder="채팅방 번호 입력"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
        <p className="mt-1 text-xs text-gray-400">
          채팅방 더보기 &gt; 채팅방 설정 &gt; 채팅방 번호 복사
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          메시지 내용
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="보낼 메시지를 입력하세요"
          rows={4}
          className="w-full border rounded-lg px-3 py-2 text-sm resize-y"
          required
        />
      </div>

      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            날짜
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시간
          </label>
          <input
            type="time"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
      >
        {submitting ? "등록 중..." : "예약 등록"}
      </button>
    </form>
  );
}
