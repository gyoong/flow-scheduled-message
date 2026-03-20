"use client";

import { useState } from "react";

type Mode = "login" | "register";

export default function AuthForm({ onSuccess }: { onSuccess: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!/^\d{6}$/.test(password)) {
      setError("비밀번호는 숫자 6자리여야 합니다");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다");
        return;
      }

      onSuccess();
    } catch {
      setError("요청 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이메일
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
          className="w-full border rounded-lg px-3 py-2 text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          비밀번호 (숫자 6자리)
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 6);
            setPassword(v);
          }}
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          className="w-full border rounded-lg px-3 py-2 text-sm tracking-widest"
          required
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
      >
        {submitting
          ? "처리 중..."
          : mode === "login"
            ? "로그인"
            : "회원가입"}
      </button>

      <p className="text-center text-sm text-gray-500">
        {mode === "login" ? (
          <>
            계정이 없으신가요?{" "}
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              회원가입
            </button>
          </>
        ) : (
          <>
            이미 계정이 있으신가요?{" "}
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              로그인
            </button>
          </>
        )}
      </p>
    </form>
  );
}
