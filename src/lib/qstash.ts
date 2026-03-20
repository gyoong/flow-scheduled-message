import { Client } from "@upstash/qstash";

export const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export function getAppBaseUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_APP_URL 또는 VERCEL_URL 환경 변수가 필요합니다");
  }

  // VERCEL_URL에는 프로토콜이 없음
  return url.startsWith("http") ? url : `https://${url}`;
}
