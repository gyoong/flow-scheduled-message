"use client";

import { useState, useEffect, useCallback } from "react";
import { ScheduledMessage } from "@/db/schema";
import MessageCard from "./message-card";

const TABS: { key: string; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "대기" },
  { key: "sent", label: "전송됨" },
  { key: "failed", label: "실패" },
  { key: "cancelled", label: "취소됨" },
];

export default function MessageList() {
  const [email, setEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("flow_email");
    if (saved) {
      setEmail(saved);
      setEmailInput(saved);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/messages?email=${encodeURIComponent(email)}`);
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

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("flow_email", emailInput);
    setEmail(emailInput);
  };

  const handleCancel = async (id: number) => {
    if (!confirm("예약을 취소하시겠습니까?")) return;
    await fetch(`/api/messages/${id}`, { method: "DELETE" });
    fetchMessages();
  };

  const filtered = activeTab === "all"
    ? messages
    : messages.filter((m) => m.status === activeTab);

  return (
    <div>
      {!email ? (
        <form onSubmit={handleEmailSubmit} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이메일을 입력하세요
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="name@company.com"
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer"
            >
              확인
            </button>
          </div>
        </form>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">{email}</span>
          <button
            onClick={() => {
              setEmail("");
              localStorage.removeItem("flow_email");
            }}
            className="text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            변경
          </button>
        </div>
      )}

      {email && (
        <>
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
        </>
      )}
    </div>
  );
}
