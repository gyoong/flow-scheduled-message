import Link from "next/link";
import MessageList from "@/components/message-list";

export default function Home() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Flow 예약 메시지</h1>
        <Link
          href="/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          + 새 예약
        </Link>
      </div>
      <MessageList />
    </main>
  );
}
