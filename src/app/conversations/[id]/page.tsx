"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  body: string;
  createdAt: string;
  sender: { id: string; email: string; role: string };
}

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/v1/conversations/${id}/messages`).then((r) => r.json());
    setMessages(res.data ?? []);
  }

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    await fetch(`/api/v1/conversations/${id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setBody("");
    await loadMessages();
    setSending(false);
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h1>

      <div className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4 mb-4">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center mt-8">No messages yet. Say hello!</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender.id === session?.user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                {!isMe && <p className="text-xs font-medium mb-1 opacity-60">{msg.sender.email}</p>}
                <p className="text-sm leading-relaxed">{msg.body}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-3">
        <input
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Type a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" loading={sending} disabled={!body.trim()}>Send</Button>
      </form>
    </div>
  );
}
