# Recipe — Chat Application

## Goal

WhatsApp/Slack 스타일 1:1 또는 그룹 채팅. 좌측 대화 목록 + 우측 활성 스레드
+ 입력 composer를 한 화면에 묶고, `useResource`로 메시지 캐시 + `useMutation`
으로 전송 + `useOptimisticState`로 즉시 표시한다.

## Used components

- `ChatThread` — `@/ds/patterns/ChatThread`
- `Avatar`, `Badge` — `@/ds/primitives/*`
- `Input`, `Button` — `@/ds/primitives/*`
- `EmptyState` — `@/ds/composites/EmptyState`
- `useResource` + `useMutation` + `useOptimisticState` — `@/ds/hooks/*`

## Recipe

```tsx
"use client";
import { useState } from "react";
import { ChatThread } from "@/ds/patterns/ChatThread";
import type { ChatMessage } from "@/ds/patterns/ChatThread";
import { Input } from "@/ds/primitives/Input";
import { Button } from "@/ds/primitives/Button";
import { EmptyState } from "@/ds/composites/EmptyState";
import { useResource } from "@/ds/hooks/useResource";
import { useMutation } from "@/ds/hooks/useMutation";
import { useOptimisticState } from "@/ds/hooks/useOptimistic";

interface Conversation {
  id: string;
  name: string;
  avatar?: string;
  unread: number;
  lastPreview: string;
}

const me = "me";

export default function ChatApp() {
  const [activeId, setActiveId] = useState<string | null>(null);

  const conversations = useResource<Conversation[]>(
    ["conversations"],
    () => fetch("/api/conversations").then((r) => r.json()),
  );

  const thread = useResource<ChatMessage[]>(
    ["messages", activeId ?? "none"],
    async () => {
      if (!activeId) return [];
      return fetch(`/api/conversations/${activeId}/messages`).then((r) => r.json());
    },
    { enabled: !!activeId },
  );

  // 옵티미스틱 메시지 상태 — 서버 응답 전에 UI에 즉시 표시
  const [messages, optimistic, setTruth] = useOptimisticState<ChatMessage[]>([]);
  // thread.data 가 갱신되면 truth 동기화
  if (thread.data && messages !== thread.data) {
    // 단순 비교용 — 실제로는 useEffect 사용
    setTruth(thread.data);
  }

  const sendMutation = useMutation(
    async (body: string) => {
      const res = await fetch(`/api/conversations/${activeId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      return res.json() as Promise<ChatMessage>;
    },
    { invalidates: [["messages", activeId ?? ""]] },
  );

  const [draft, setDraft] = useState("");
  const send = async () => {
    if (!draft.trim() || !activeId) return;
    const provisional: ChatMessage = {
      id: `tmp-${Date.now()}`,
      authorId: me,
      authorName: "나",
      body: draft,
      createdAt: Date.now(),
      status: "sending",
    };
    const text = draft;
    setDraft("");
    await optimistic.run(
      (cur) => [...cur, provisional],
      () => sendMutation.mutate(text),
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] h-[640px] rounded-xl border border-border bg-surface overflow-hidden">
      <aside className="border-r border-border overflow-y-auto" aria-label="대화 목록">
        {conversations.loading && <div className="p-4 text-sm text-muted">불러오는 중…</div>}
        {conversations.data?.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveId(c.id)}
              aria-current={active ? "true" : undefined}
              className={`w-full p-3 flex items-center gap-3 text-left border-b border-border-light cursor-pointer hover:bg-surface-soft ${active ? "bg-primary/10" : ""}`}
            >
              {c.avatar ? (
                <img src={c.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary inline-flex items-center justify-center font-semibold">
                  {c.name.slice(0, 1)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{c.name}</p>
                <p className="text-xs text-muted truncate">{c.lastPreview}</p>
              </div>
              {c.unread > 0 && <span className="text-[10px] font-bold rounded-full bg-primary text-white px-1.5 py-0.5">{c.unread}</span>}
            </button>
          );
        })}
      </aside>

      {activeId ? (
        <ChatThread
          currentUserId={me}
          messages={messages}
          composer={
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
              <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="메시지 입력…" aria-label="메시지 입력" />
              <Button type="submit" disabled={!draft.trim() || sendMutation.loading}>보내기</Button>
            </form>
          }
        />
      ) : (
        <EmptyState icon="💬" title="대화를 선택하세요" description="좌측에서 대화를 클릭하세요." />
      )}
    </div>
  );
}
```

## Variations

- **그룹 채팅**: `currentUserId`는 동일, `messages[].authorId`/`authorName`만
  다양하게 — `ChatThread`가 그룹핑 자동 처리
- **이미지 첨부**: 메시지에 `attachmentUrl` 추가 → 버블 아래 자동 표시
- **읽음 인디케이터**: `readBy: ["u1","u2"]` 채워주면 발신 메시지 옆에 자동 표시

## See also

- `requirements/data-layer.md`
- `.ai/recipes/social-feed.md` — 같은 useResource 패턴
