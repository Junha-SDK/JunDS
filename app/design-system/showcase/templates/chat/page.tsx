"use client";
import { useState } from "react";
import { Button } from "@/ds/primitives/Button";
import { Input } from "@/ds/primitives/Input";
import { Avatar } from "@/ds/primitives/Avatar";
import { Badge } from "@/ds/primitives/Badge";
import { ChatBubble } from "@/ds/composites/ChatBubble";

interface Message {
  id: number;
  text: string;
  sender: string;
  side: "left" | "right";
  time: string;
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "안녕하세요! JunDS 프로젝트 진행 상황이 어떻게 되나요?",
    sender: "이서연",
    side: "left",
    time: "오후 2:30",
  },
  {
    id: 2,
    text: "네, 현재 컴포넌트 219개 완성했습니다. 테스트도 전부 통과했어요!",
    sender: "나",
    side: "right",
    time: "오후 2:31",
  },
  {
    id: 3,
    text: "와 대단하네요! DataTable은 어떤 기능이 있나요?",
    sender: "이서연",
    side: "left",
    time: "오후 2:32",
  },
  {
    id: 4,
    text: "검색, 필터, 정렬, 가상스크롤, CSV 내보내기, 인라인 편집까지 25개 기능을 지원합니다 🚀",
    sender: "나",
    side: "right",
    time: "오후 2:33",
  },
  {
    id: 5,
    text: "프레임워크 모드도 있다고 들었는데요?",
    sender: "이서연",
    side: "left",
    time: "오후 2:34",
  },
  {
    id: 6,
    text: "네! Box, Flex, Page 같은 코어 컴포넌트로 레이아웃을 토큰 기반으로 제어합니다. 반응형 props도 지원해요.",
    sender: "나",
    side: "right",
    time: "오후 2:35",
  },
];

export default function ChatTemplate() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        id: messages.length + 1,
        text: input,
        sender: "나",
        side: "right",
        time: "지금",
      },
    ]);
    setInput("");
  };

  return (
    <div className="max-w-lg mx-auto h-[600px] flex flex-col rounded-2xl border border-border bg-white overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-white shrink-0">
        <Avatar name="이서연" size="sm" />
        <div className="flex-1">
          <p className="text-sm font-semibold">이서연</p>
          <p className="text-[10px] text-muted">온라인</p>
        </div>
        <Badge variant="success" size="sm" dot>
          접속 중
        </Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            side={msg.side}
            sender={msg.side === "left" ? msg.sender : undefined}
            avatar={msg.side === "left" ? <Avatar name={msg.sender} size="sm" /> : undefined}
            timestamp={msg.time}
            variant={msg.side === "right" ? "primary" : "default"}
          >
            {msg.text}
          </ChatBubble>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t border-border bg-white shrink-0">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="메시지를 입력하세요..."
          size="sm"
          className="flex-1"
        />
        <Button variant="primary" size="sm" onClick={send} disabled={!input.trim()}>
          전송
        </Button>
      </div>
      {/* Code */}
      <details className="rounded-2xl border border-border bg-white overflow-hidden">
        <summary className="px-5 py-3 text-sm font-semibold cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted">
            <path
              d="M4.5 3L1.5 7l3 4M9.5 3l3 4-3 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          코드 보기
        </summary>
        <pre className="p-5 text-xs font-mono text-gray-300 bg-gray-950 overflow-x-auto leading-relaxed border-t border-border max-h-[500px] overflow-y-auto">
          <code>{`import { useState } from "react";
import { Button, Input, Avatar, Badge } from "@junds/ui";
import { ChatBubble } from "@junds/ui";

export default function ChatPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, {
      id: messages.length + 1,
      text: input,
      sender: "나",
      side: "right",
      time: "지금",
    }]);
    setInput("");
  };

  return (
    <div className="max-w-lg mx-auto h-[600px] flex flex-col border rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b">
        <Avatar name="이서연" size="sm" />
        <p className="text-sm font-semibold">이서연</p>
        <Badge variant="success" size="sm" dot>접속 중</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            side={msg.side}
            sender={msg.side === "left" ? msg.sender : undefined}
            timestamp={msg.time}
            variant={msg.side === "right" ? "primary" : "default"}
          >
            {msg.text}
          </ChatBubble>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 p-3 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="메시지를 입력하세요..."
        />
        <Button variant="primary" size="sm" onClick={send}>전송</Button>
      </div>
    </div>
  );
}`}</code>
        </pre>
      </details>
    </div>
  );
}
