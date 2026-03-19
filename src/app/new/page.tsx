import Link from "next/link";
import MessageForm from "@/components/message-form";

export default function NewMessagePage() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="text-gray-400 hover:text-gray-600 text-lg"
        >
          &larr;
        </Link>
        <h1 className="text-xl font-bold">예약 메시지 등록</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <MessageForm />
      </div>
    </main>
  );
}
