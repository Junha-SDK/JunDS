"use client";

import { useState } from "react";
import { Badge, useDsToast } from "@junds/ui";
import { useAlerts } from "./lib/alerts";
import { AlertSheet } from "./AlertSheet";

interface AlertButtonProps {
  name: string;
}

export function AlertButton({ name }: AlertButtonProps) {
  const [open, setOpen] = useState(false);
  const { items } = useAlerts();
  const mine = items.filter((a) => a.name === name && a.active);
  const toast = useDsToast();

  return (
    <>
      <button
        type="button"
        aria-label={mine.length > 0 ? `가격 알림 ${mine.length}개 등록됨` : "가격 알림 추가"}
        onClick={() => {
          if (mine.length >= 5) {
            toast.info("이 종목에는 이미 5개의 알림이 등록되어 있습니다.");
            return;
          }
          setOpen(true);
        }}
        className={[
          "relative inline-flex items-center gap-1.5 px-3 h-9 rounded-full font-bold text-[12px] cursor-pointer",
          "transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.96]",
          // 나머지 finance 조작부와 같은 포커스 어법 — 액센트 링 + 페이지 배경 오프셋.
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--bm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bm-bg)]",
          "motion-reduce:transition-none motion-reduce:active:scale-100",
        ].join(" ")}
        style={{
          background: mine.length > 0 ? "var(--bm-accent-soft-bg)" : "var(--bm-soft-100)",
          color: mine.length > 0 ? "var(--bm-accent-strong)" : "var(--bm-text-soft)",
          border: `1px solid ${mine.length > 0 ? "var(--bm-accent)" : "var(--bm-border)"}`,
        }}
      >
        <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>
          🔔
        </span>
        <span>알림</span>
        {mine.length > 0 ? (
          <Badge size="sm" variant="danger">
            {mine.length}
          </Badge>
        ) : null}
      </button>
      {open ? <AlertSheet open={open} onClose={() => setOpen(false)} name={name} /> : null}
    </>
  );
}
