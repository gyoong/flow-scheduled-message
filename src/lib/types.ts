export interface ScheduledMessage {
  id: number;
  authorEmail: string;
  targetType: string;
  targetId: string;
  targetName: string | null;
  content: string;
  scheduledAt: string;
  status: string;
  errorMessage: string | null;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatRoom {
  roomId: string;
  title: string;
  type: string;
}

export type MessageStatus = "pending" | "sent" | "failed";

export const STATUS_LABELS: Record<MessageStatus, string> = {
  pending: "대기",
  sent: "전송됨",
  failed: "실패",
};

export const STATUS_COLORS: Record<MessageStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};
