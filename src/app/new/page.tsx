import Link from "next/link";
import MessageForm from "@/components/message-form";

export default function NewMessagePage() {
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/"
          className="text-2xl font-title text-primary hover:opacity-70"
        >
          &lt;
        </Link>
        <h1 className="text-2xl font-title text-primary">메시지 예약 등록</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <MessageForm />
      </div>
    </main>
  );
}
