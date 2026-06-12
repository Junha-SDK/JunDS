"use client";
import { useState } from "react";
import { ComponentPage, Section } from "../../_components/ComponentPage";
import { Preview } from "../../_components/Preview";
import { EmailInbox, type EmailMessage } from "@/ds/patterns/EmailInbox";

const folders = [
  { id: "inbox", label: "받은편지함", unreadCount: 2 },
  { id: "starred", label: "별표", unreadCount: 0 },
  { id: "sent", label: "보낸편지함" },
  { id: "drafts", label: "임시보관함" },
  { id: "trash", label: "휴지통" },
];

const initial: EmailMessage[] = [
  { id: "m1", folderId: "inbox", from: "디자인팀 지우", subject: "v3.0 디자인 토큰 검토", preview: "변경된 토큰 목록 첨부합니다…", receivedAt: Date.now() - 60_000 * 12, unread: true, attachments: 1, labels: ["디자인", "긴급"] },
  { id: "m2", folderId: "inbox", from: "GitHub", subject: "PR #421 리뷰 요청", preview: "junha/JunDS 저장소…", receivedAt: Date.now() - 60_000 * 60 * 2, unread: true },
  { id: "m3", folderId: "inbox", from: "결제", subject: "구독 갱신 알림", preview: "다음 갱신은 5월 30일입니다.", receivedAt: Date.now() - 60_000 * 60 * 24 * 2 },
];

export default function EmailInboxPage() {
  const [folder, setFolder] = useState("inbox");
  const [messages, setMessages] = useState(initial);
  const [active, setActive] = useState<string | null>("m1");
  return (
    <ComponentPage
      name="EmailInbox"
      description="3-pane 메일 인박스 — 폴더 / 리스트(검색·별표) / 본문 (모바일은 1-pane으로 자동 스택)."
      importPath='import { EmailInbox } from "@/ds/patterns/EmailInbox"'
      props={[]}
    >
      <Section title="Default">
        <Preview>
          <EmailInbox
            folders={folders}
            messages={messages}
            activeFolderId={folder}
            onFolderChange={setFolder}
            activeMessageId={active}
            onMessageSelect={(m) => { setActive(m.id); setMessages((arr) => arr.map((x) => x.id === m.id ? { ...x, unread: false } : x)); }}
            onToggleStar={(id) => setMessages((arr) => arr.map((x) => x.id === id ? { ...x, starred: !x.starred } : x))}
          />
        </Preview>
      </Section>
    </ComponentPage>
  );
}
