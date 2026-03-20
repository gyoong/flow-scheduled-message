"use client";

import { ScheduledMessage } from "@/db/schema";

const STATUS_LABELS: Record<string, string> = {
  pending: "대기",
  sent: "전송됨",
  failed: "실패",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

interface Props {
  message: ScheduledMessage;
  onCancel: (id: number) => void;
}

export default function MessageCard({ message, onCancel }: Props) {
  const scheduledDate = new Date(message.scheduledAt);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold">
          {message.targetName || message.targetId}
        </span>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[message.status] || ""}`}>
          {STATUS_LABELS[message.status] || message.status}
        </span>
      </div>

      <p className="text-gray-800 mb-3 whitespace-pre-wrap break-words">
        {message.content}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {scheduledDate.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        {message.status === "pending" && (
          <button
            onClick={() => onCancel(message.id)}
            className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
          >
            취소
          </button>
        )}
        {message.status === "failed" && message.errorMessage && (
          <span className="text-red-500 text-xs truncate max-w-[200px]" title={message.errorMessage}>
            {message.errorMessage}
          </span>
        )}
      </div>
    </div>
  );
}
