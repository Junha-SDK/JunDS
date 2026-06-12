"use client";
import { forwardRef, useState } from "react";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface SettingsSection {
  /** 섹션 ID */
  id: string;
  /** 사이드바 라벨 */
  label: string;
  /** 좌측 아이콘 */
  icon?: ReactNode;
  /** 그룹 (있으면 카테고리 구분선) */
  group?: string;
  /** 컨텐츠 (탭형) */
  content?: ReactNode;
}

export interface SettingsLayoutProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "title"> {
  /** 섹션 목록 */
  sections: SettingsSection[];
  /** 현재 활성 섹션 ID (controlled) */
  activeId?: string;
  /** 기본 활성 ID */
  defaultActiveId?: string;
  /** 변경 콜백 */
  onChange?: (id: string) => void;
  /** 페이지 제목 */
  title?: ReactNode;
  /** 사이드바 폭 */
  sidebarWidth?: number;
}

/**
 * 설정 페이지 표준 레이아웃: 사이드바 네비 + 컨텐츠.
 * @example
 * <SettingsLayout title="설정" sections={[{id:"profile",label:"프로필",content:<X/>}]} />
 * @status stable
 * @since 2.3.0
 * @tags layout
 */
export const SettingsLayout = forwardRef<HTMLDivElement, SettingsLayoutProps>(function SettingsLayout(
  { sections, activeId, defaultActiveId, onChange, title, sidebarWidth = 220, className, ...props },
  ref,
) {
  const [internal, setInternal] = useState(defaultActiveId ?? sections[0]?.id);
  const active = activeId ?? internal;
  const current = sections.find((s) => s.id === active);

  const setActive = (id: string) => {
    if (!activeId) setInternal(id);
    onChange?.(id);
  };

  // group sections
  const groups = sections.reduce<Map<string | undefined, SettingsSection[]>>((acc, s) => {
    const list = acc.get(s.group) ?? [];
    list.push(s);
    acc.set(s.group, list);
    return acc;
  }, new Map());

  return (
    <div
      ref={ref}
      className={cn("flex flex-col lg:flex-row min-h-[480px] bg-background", className)}
      {...props}
    >
      <aside
        className="border-b lg:border-b-0 lg:border-r border-border bg-surface p-4"
        style={{ width: sidebarWidth, minWidth: sidebarWidth }}
      >
        {title && <div className="px-2 mb-4 text-sm font-semibold uppercase tracking-wider text-muted">{title}</div>}
        <nav className="flex flex-col gap-3">
          {[...groups.entries()].map(([group, items], gi) => (
            <div key={group ?? `__g${gi}`} className="flex flex-col gap-0.5">
              {group && <div className="px-2 pt-2 text-[10px] uppercase tracking-wider text-muted">{group}</div>}
              {items.map((s) => {
                const isActive = s.id === active;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActive(s.id)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left transition-colors cursor-pointer",
                      isActive
                        ? "bg-primary-soft text-primary font-medium"
                        : "hover:bg-surface-soft text-foreground",
                    )}
                  >
                    {s.icon && <span className="shrink-0">{s.icon}</span>}
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        {current?.content}
      </main>
    </div>
  );
});
