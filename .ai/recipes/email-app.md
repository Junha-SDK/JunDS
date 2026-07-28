# Recipe — Email Application

## Goal

Gmail 스타일 3-pane 이메일 클라이언트 — 폴더, 리스트(검색·별표), 본문, 작성 모달.

## Used components

- `EmailInbox` — `@/ds/patterns/EmailInbox`
- `Modal`, `Button`, `Input`, `Textarea` — 작성 모달
- `useResource`, `useMutation` — 메일 CRUD

## Recipe

```tsx
"use client";
import { useState } from "react";
import { EmailInbox, type EmailMessage } from "@/ds/patterns/EmailInbox";
import { Modal } from "@/ds/composites/Modal";
import { Input } from "@/ds/primitives/Input";
import { Textarea } from "@/ds/primitives/Textarea";
import { Button } from "@/ds/primitives/Button";
import { useResource } from "@/ds/hooks/useResource";
import { useMutation } from "@/ds/hooks/useMutation";

const folders = [
  { id: "inbox", label: "받은편지함" },
  { id: "starred", label: "별표" },
  { id: "sent", label: "보낸편지함" },
  { id: "drafts", label: "임시보관함" },
  { id: "trash", label: "휴지통" },
];

export default function EmailApp() {
  const [folder, setFolder] = useState("inbox");
  const [active, setActive] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const inbox = useResource<EmailMessage[]>(
    ["mail", folder],
    () => fetch(`/api/mail?folder=${folder}`).then((r) => r.json()),
    { revalidateOnFocus: true },
  );

  const star = useMutation(
    (id: string) => fetch(`/api/mail/${id}/star`, { method: "POST" }),
    { invalidates: [["mail", folder]] },
  );

  const send = useMutation(
    (input: { to: string; subject: string; body: string }) =>
      fetch("/api/mail", { method: "POST", body: JSON.stringify(input) }),
    { invalidates: [["mail", "sent"]] },
  );

  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">메일</h1>
        <Button onClick={() => setComposeOpen(true)}>+ 새 메일</Button>
      </div>

      <EmailInbox
        folders={folders.map((f) => ({
          ...f,
          unreadCount:
            f.id === folder ? inbox.data?.filter((m) => m.unread).length : undefined,
        }))}
        messages={inbox.data ?? []}
        activeFolderId={folder}
        onFolderChange={(id) => {
          setFolder(id);
          setActive(null);
        }}
        activeMessageId={active}
        onMessageSelect={(m) => setActive(m.id)}
        onToggleStar={(id) => star.mutate(id)}
      />

      {composeOpen && (
        <Modal open onClose={() => setComposeOpen(false)} title="새 메일" size="lg">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              await send.mutate({
                to: String(fd.get("to")),
                subject: String(fd.get("subject")),
                body: String(fd.get("body")),
              });
              setComposeOpen(false);
            }}
            className="space-y-3"
          >
            <Input
              name="to"
              type="email"
              placeholder="받는 사람"
              required
              aria-label="받는 사람"
            />
            <Input name="subject" placeholder="제목" required aria-label="제목" />
            <Textarea
              name="body"
              rows={8}
              placeholder="본문"
              required
              aria-label="본문"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setComposeOpen(false)}>
                취소
              </Button>
              <Button type="submit" loading={send.loading}>
                보내기
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
```

## Variations

- **답장/전달**: `Modal` 안에 `defaultValue` 채워서 동일 form 재사용
- **무한 스크롤**: `useInfiniteFeed`로 메일 페이지네이션 (날짜 cursor)
- **레이블 색상화**: `EmailMessage.labels`에 색상 매핑 + `EmailInbox` 자식 커스터마이징

## See also

- `app/design-system/patterns/email-inbox/page.tsx`
