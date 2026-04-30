"use client";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { ChatBubble } from "@/ds/composites/ChatBubble";

export default function ChatBubblePage() {
  return (
    <ComponentPage
      name="ChatBubble"
      description="채팅 인터페이스의 메시지 말풍선. 좌/우 정렬과 발신자/타임스탬프를 지원합니다."
      importPath='import { ChatBubble } from "@/ds/composites/ChatBubble"'
      props={[
        { name: "side", type: '"left"|"right"', default: '"left"', description: "정렬 방향" },
        { name: "variant", type: '"default"|"primary"', default: '"default"', description: "오른쪽일 때 강조 색상 적용" },
        { name: "sender", type: "string", description: "발신자 이름" },
        { name: "avatar", type: "ReactNode", description: "아바타 노드" },
        { name: "timestamp", type: "string", description: "시간 표시 (예: 오후 2:34)" },
      ]}
    >
      <Section title="Default">
        <Preview>
          <div className="flex flex-col gap-2 w-full max-w-md">
            <ChatBubble sender="알리스" timestamp="오후 2:30">
              안녕하세요! 오늘 회의 시간 확인해 주실 수 있나요?
            </ChatBubble>
            <ChatBubble side="right" variant="primary" timestamp="오후 2:31">
              네, 3시에 화상회의 잡혀 있어요.
            </ChatBubble>
            <ChatBubble sender="알리스" timestamp="오후 2:32">
              감사합니다!
            </ChatBubble>
          </div>
        </Preview>
      </Section>

      <Section title="아바타 포함">
        <Preview>
          <div className="flex flex-col gap-2 w-full max-w-md">
            <ChatBubble
              sender="봇"
              avatar={<div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">B</div>}
            >
              무엇을 도와드릴까요?
            </ChatBubble>
            <ChatBubble side="right" variant="primary">
              주문 내역을 확인하고 싶어요.
            </ChatBubble>
          </div>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
