"use client";

import { useState, useEffect, useCallback } from "react";
import { ScheduledMessage } from "@/db/schema";
import MessageCard from "./message-card";
import AuthForm from "./auth-form";

const TABS: { key: string; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "대기" },
  { key: "sent", label: "전송됨" },
  { key: "failed", label: "실패" },
];

export default function MessageList() {
  const [email, setEmail] = useState<string | null>(null);
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setEmail(data.email);
      } else {
        setEmail(null);
      }
    } catch {
      setEmail(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const fetchMessages = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setEmail(null);
    setMessages([]);
  };

  const handleCancel = async (id: number) => {
    if (!confirm("예약을 취소하시겠습니까?")) return;
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    fetchMessages();
  };

  const filtered = activeTab === "all"
    ? messages
    : messages.filter((m) => m.status === activeTab);

  if (loading && !email) {
    return <p className="text-center text-gray-400 py-8">로딩 중...</p>;
  }

  if (!email) {
    return <AuthForm onSuccess={checkSession} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">{email}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
        >
          로그아웃
        </button>
      </div>

      <div className="flex gap-1 mb-4 border-b">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-2 text-sm font-medium cursor-pointer ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-8">불러오는 중...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-8">예약된 메시지가 없습니다</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((msg) => (
            <MessageCard key={msg.id} message={msg} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
}
