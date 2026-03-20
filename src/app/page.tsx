import MessageList from "@/components/message-list";

export default function Home() {
  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-xl font-bold mb-6">Flow 예약 메시지</h1>
      <MessageList />
    </main>
  );
}
