"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

interface Message { id: string; body: string; createdAt: string; sender: { id: string; email: string } }

export default function ConversationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/v1/conversations/${id}/messages`).then((r) => r.json());
    setMessages(res.data ?? []);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [id]); // eslint-disable-line

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    await fetch(`/api/v1/conversations/${id}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    setBody("");
    await load();
    setSending(false);
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#1f2d27]">
        <div className="w-8 h-8 rounded-full bg-[#22c55e]/20 flex items-center justify-center">
          <span className="text-[#22c55e] text-xs font-bold">M</span>
        </div>
        <div>
          <p className="text-sm font-medium text-[#e8f0ec]">Match conversation</p>
          <p className="text-xs text-[#546b5e]">Private — visible only to matched parties</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-1">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-[#546b5e] text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender.id === session?.user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${isMe ? "bg-[#22c55e] text-[#0f1512]" : "bg-[#1c2620] text-[#e8f0ec] border border-[#2a3830]"}`}>
                {!isMe && <p className="text-xs font-medium mb-1 text-[#546b5e]">{msg.sender.email}</p>}
                <p className="text-sm leading-relaxed">{msg.body}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-[#0f1512]/60" : "text-[#546b5e]"}`}>
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
          className="flex-1 rounded-xl border border-[#2a3830] bg-[#161d19] px-4 py-2.5 text-sm text-[#e8f0ec] placeholder-[#546b5e] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40"
          placeholder="Type a message..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <Button type="submit" loading={sending} disabled={!body.trim()}>Send</Button>
      </form>
    </div>
  );
}
