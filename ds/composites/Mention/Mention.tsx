"use client";
import { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { cn } from "../../utils/cn";
import { useClickOutside } from "../../hooks/useClickOutside";
import { Portal } from "../../primitives/Portal";

export interface MentionUser {
  key: string;
  label: string;
  /** 아바타 이미지 URL */
  avatar?: string;
  /** 추가 설명 */
  description?: string;
}

export interface MentionProps {
  /** 입력 값 */
  value: string;
  /** 값 변경 콜백 */
  onChange: (value: string) => void;
  /** 사용자 목록 */
  users: MentionUser[];
  /** 트리거 문자 */
  trigger?: string;
  /** 플레이스홀더 텍스트 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 멘션 입력
 * @example
 * <Mention value={text} onChange={setText} users={userList} trigger="@" />
 */
const DROPDOWN_WIDTH = 256;
const DROPDOWN_MAX_HEIGHT = 192;

/**
 * @ 입력으로 사용자를 멘션할 수 있는 텍스트 입력.
 * @example
 * <Mention value={text} onChange={setText} users={users} trigger="@" />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function Mention({
  value,
  onChange,
  users,
  trigger = "@",
  placeholder = "내용을 입력하세요...",
  disabled,
  className,
}: MentionProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightIdx, setHighlightIdx] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    dropdownRef,
    () => {
      setOpen(false);
      setMentionStart(null);
    },
    open,
  );

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) => u.label.toLowerCase().includes(q) || u.description?.toLowerCase().includes(q),
    );
  }, [users, query]);

  const updateDropdownPosition = useCallback(() => {
    if (!textareaRef.current) return;
    const rect = textareaRef.current.getBoundingClientRect();
    const dropdownWidth = DROPDOWN_WIDTH;
    const dropdownHeight = DROPDOWN_MAX_HEIGHT;
    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
    setDropdownPos({
      top: clamp(rect.bottom + 4, 8, window.innerHeight - dropdownHeight - 8),
      left: clamp(rect.left, 8, window.innerWidth - dropdownWidth - 8),
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    const cursorPos = e.target.selectionStart ?? 0;
    // Check for trigger character
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const lastTriggerIdx = textBeforeCursor.lastIndexOf(trigger);

    if (lastTriggerIdx >= 0) {
      const textBetween = textBeforeCursor.slice(lastTriggerIdx + trigger.length);
      // Only valid if no space in the mention query
      if (
        !textBetween.includes(" ") &&
        (lastTriggerIdx === 0 ||
          newValue[lastTriggerIdx - 1] === " " ||
          newValue[lastTriggerIdx - 1] === "\n")
      ) {
        setMentionStart(lastTriggerIdx);
        setQuery(textBetween);
        setHighlightIdx(0);
        setOpen(true);
        updateDropdownPosition();
        return;
      }
    }

    setOpen(false);
    setMentionStart(null);
  };

  const handleSelect = useCallback(
    (user: MentionUser) => {
      if (mentionStart === null || !textareaRef.current) return;
      const cursorPos = textareaRef.current.selectionStart ?? 0;
      const before = value.slice(0, mentionStart);
      const after = value.slice(cursorPos);
      const mention = `${trigger}${user.label} `;
      const newValue = before + mention + after;
      onChange(newValue);

      setOpen(false);
      setMentionStart(null);
      setQuery("");

      // Restore focus and cursor
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newPos = before.length + mention.length;
          textareaRef.current.setSelectionRange(newPos, newPos);
        }
      });
    },
    [mentionStart, value, trigger, onChange],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      setMentionStart(null);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, filtered.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && filtered[highlightIdx]) {
      e.preventDefault();
      handleSelect(filtered[highlightIdx]);
    }
  };

  useEffect(() => {
    if (open) setHighlightIdx(0);
  }, [query, open]);

  return (
    <div className={cn("relative w-full", className)}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "w-full min-h-[80px] px-3 py-2 text-sm border bg-card rounded-xl resize-y",
          // resize-y 로 사용자가 높이를 끌 수 있다. transition-all 이면 그 드래그마다 전이가 걸려
          // 늘어나는 게 뒤늦게 따라온다 — 포커스가 바꾸는 두 속성만 지목한다.
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 ease-out",
          "focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow),0_1px_2px_rgba(0,0,0,0.04)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "border-border hover:border-muted-light placeholder:text-muted-light",
        )}
      />

      {open && filtered.length > 0 && (
        <Portal>
          <div
            ref={dropdownRef}
            // 떠 있는 목록은 shadow-lg 한 겹으로는 배경에서 떨어지지 않는다.
            // 다층 그림자 + 얇은 링으로 세운다(Snackbar 와 같은 형태).
            className={cn(
              "fixed z-50 w-64 bg-card border border-border rounded-xl max-h-48 overflow-auto p-1",
              "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-black/[0.04]",
              "animate-fade-in-scale motion-reduce:animate-none",
            )}
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            {filtered.map((user, i) => (
              <button
                key={user.key}
                type="button"
                onClick={() => handleSelect(user)}
                className={cn(
                  "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer text-sm",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-inset",
                  // 배경만으로는 하이라이트가 약하다 — 배경 + 전경을 함께 바꾼다.
                  i === highlightIdx ? "bg-primary/10 text-primary-ink" : "hover:bg-surface-soft",
                )}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.label}
                    className="w-6 h-6 rounded-full shrink-0 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full shrink-0 bg-primary/10 text-primary-ink flex items-center justify-center text-xs font-medium">
                    {user.label[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="truncate font-medium">{user.label}</div>
                  {user.description && (
                    <div className="text-xs text-muted truncate">{user.description}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Portal>
      )}
    </div>
  );
}
