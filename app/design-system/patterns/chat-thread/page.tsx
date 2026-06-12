"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ChatThread } from "@/ds/patterns/ChatThread";
import type { ChatMessage } from "@/ds/patterns/ChatThread";
import { Input } from "@/ds/primitives/Input";
import { Button } from "@/ds/primitives/Button";

const seed: ChatMessage[] = [
  { id: "1", authorId: "u1", authorName: "지우", body: "오늘 회의 5시 맞죠?", createdAt: Date.now() - 60_000 * 12 },
  { id: "2", authorId: "me", authorName: "준하", body: "네 맞아요!", createdAt: Date.now() - 60_000 * 11, status: "sent", readBy: ["u1"] },
  { id: "3", authorId: "me", authorName: "준하", body: "준비 다 됐습니다.", createdAt: Date.now() - 60_000 * 11, status: "sent", readBy: ["u1"] },
  { id: "4", authorId: "u1", authorName: "지우", body: "👍", createdAt: Date.now() - 60_000 * 5 },
];

export default function ChatThreadPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(seed);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { id: String(Date.now()), authorId: "me", authorName: "준하", body: draft, createdAt: Date.now(), status: "sending" }]);
    setDraft("");
    setTimeout(() => {
      setMessages((m) => m.map((x) => x.status === "sending" ? { ...x, status: "sent" } : x));
    }, 600);
  };

  return (
    <ComponentPage
      name="ChatThread"
      description="메시지 그룹핑 + 좌/우 정렬 + 읽음/타이핑/실패 상태 + 자동 스크롤 채팅 패턴."
      importPath='import { ChatThread } from "@/ds/patterns/ChatThread"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <div style={{ height: 480 }}>
            <ChatThread
              currentUserId="me"
              messages={messages}
              typingUsers={["지우"]}
              composer={
                <form
                  onSubmit={(e) => { e.preventDefault(); send(); }}
                  className="flex items-center gap-2"
                >
                  <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="메시지 입력…" aria-label="메시지 입력" />
                  <Button type="submit" disabled={!draft.trim()}>보내기</Button>
                </form>
              }
              className="h-full"
            />
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
