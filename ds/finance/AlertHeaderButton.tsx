"use client";

import Link from "next/link";
import { useAlerts } from "./lib/alerts";
import { AppIcon } from "./AppIcon";

export function AlertHeaderButton() {
  const { items } = useAlerts();
  const active = items.filter((a) => a.active).length;
  return (
    <Link
      href="/alerts"
      aria-label="가격 알림"
      className="relative size-9 rounded-full grid place-items-center shrink-0"
      style={{ color: "var(--bm-muted)" }}
    >
      <AppIcon name="bell" size={18} strokeWidth={1.8} />
      {active > 0 ? (
        <span
          className="absolute top-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full grid place-items-center bm-num text-[9.5px] font-extrabold text-white"
          style={{
            background: "var(--bm-up)",
            border: "2px solid var(--bm-bg)",
            lineHeight: 1,
          }}
        >
          {active}
        </span>
      ) : null}
    </Link>
  );
}
