"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { AnnouncerProvider, useAnnouncer } from "@/ds/primitives/Announcer";
import { Button } from "@/ds/primitives/Button";

function AnnouncerDemo() {
  const { announce } = useAnnouncer();
  const [log, setLog] = useState<string[]>([]);
  const fire = (msg: string, p: "polite" | "assertive") => {
    announce(msg, p);
    setLog((prev) => [`[${p}] ${msg}`, ...prev].slice(0, 5));
  };
  return (
    <div className="flex flex-col gap-3 max-w-md">
      <div className="flex gap-2">
        <Button size="sm" onClick={() => fire("저장이 완료되었습니다", "polite")}>
          Polite 알림
        </Button>
        <Button size="sm" variant="danger" onClick={() => fire("오류가 발생했습니다", "assertive")}>
          Assertive 알림
        </Button>
      </div>
      <ul className="text-xs text-muted space-y-1 font-mono">
        {log.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </div>
  );
}

export default function AnnouncerPage() {
  return (
    <ComponentPage
      name="Announcer"
      description="스크린리더 사용자에게 동적 변경 사항을 알리는 ARIA live region 프로바이더입니다. polite / assertive 두 가지 알림 강도를 지원합니다."
      importPath='import { AnnouncerProvider, useAnnouncer } from "@/ds/primitives/Announcer"'
      props={[
        {
          name: "children",
          type: "ReactNode",
          description: "Provider 하위 트리. useAnnouncer 훅을 사용하는 컴포넌트를 감쌉니다.",
        },
      ]}
    >
      <Section
        title="Basic Usage"
        description="useAnnouncer 훅으로 announce(message, politeness) 함수를 호출해 스크린리더에 메시지를 전달합니다."
      >
        <Preview>
          <AnnouncerProvider>
            <AnnouncerDemo />
          </AnnouncerProvider>
        </Preview>
      </Section>
    </ComponentPage>
  );
}
