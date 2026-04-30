"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface InlineEditProps {
  /** 현재 값 */
  value: string;
  /** 값 변경 콜백 */
  onChange: (value: string) => void;
  /** 빈 값일 때 표시할 안내 문구 */
  placeholder?: string;
  /** 편집 비활성화 여부 */
  disabled?: boolean;
  /** 렌더링할 태그 */
  as?: "span" | "h1" | "h2" | "h3" | "p";
  /** 추가 클래스 */
  className?: string;
}

/**
 * 클릭으로 인라인 편집 모드로 전환되는 텍스트.
 * @example
 * <InlineEdit value={title} onChange={setTitle} placeholder="제목을 입력하세요" />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function InlineEdit({
  value,
  onChange,
  placeholder = "클릭하여 편집",
  disabled,
  as: Tag = "span",
  className,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const save = useCallback(() => {
    setEditing(false);
    if (draft !== value) onChange(draft);
  }, [draft, value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") { setDraft(value); setEditing(false); }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        className={cn(
          "border-b-2 border-primary bg-transparent outline-none transition-colors",
          "text-inherit font-inherit",
          className,
        )}
      />
    );
  }

  return (
    <Tag
      onClick={() => !disabled && setEditing(true)}
      tabIndex={disabled ? undefined : 0}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" && !disabled) setEditing(true); }}
      className={cn(
        "border-b-2 border-transparent transition-colors inline-block",
        !disabled && "cursor-pointer hover:border-primary/30 focus:border-primary/40 outline-none",
        disabled && "cursor-default",
        !value && "text-muted italic",
        className,
      )}
      role={disabled ? undefined : "button"}
      aria-label={disabled ? undefined : "클릭하여 편집"}
    >
      {value || placeholder}
      {!disabled && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="inline ml-1.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">
          <path d="M8.5 1.5l2 2-6 6H2.5V7.5z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </Tag>
  );
}
