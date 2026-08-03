"use client";
import { useState, useRef } from "react";
import { cn } from "../../utils/cn";

export interface RichTextEditorProps {
  /** HTML 값 */
  value?: string;
  /** 값 변경 콜백 */
  onChange?: (html: string) => void;
  /** 플레이스홀더 */
  placeholder?: string;
  /** 최소 높이 */
  minHeight?: number;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 클래스 */
  className?: string;
}

type Cmd =
  | "bold"
  | "italic"
  | "underline"
  | "strikeThrough"
  | "insertUnorderedList"
  | "insertOrderedList"
  | "formatBlock";

const tools: { cmd: Cmd; arg?: string; icon: string; label: string }[] = [
  { cmd: "bold", icon: "B", label: "굵게" },
  { cmd: "italic", icon: "I", label: "기울임" },
  { cmd: "underline", icon: "U", label: "밑줄" },
  { cmd: "strikeThrough", icon: "S", label: "취소선" },
  { cmd: "insertUnorderedList", icon: "•", label: "목록" },
  { cmd: "insertOrderedList", icon: "1.", label: "번호 목록" },
  { cmd: "formatBlock", arg: "h2", icon: "H", label: "제목" },
];

/**
 * 리치 텍스트 에디터 (contentEditable 기반)
 * @example
 * <RichTextEditor value={html} onChange={setHtml} placeholder="내용을 입력하세요..." />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "내용을 입력하세요...",
  minHeight = 150,
  disabled,
  className,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  const exec = (cmd: Cmd, arg?: string) => {
    document.execCommand(cmd, false, arg ? `<${arg}>` : undefined);
    editorRef.current?.focus();
    onChange?.(editorRef.current?.innerHTML || "");
  };

  const handleInput = () => {
    onChange?.(editorRef.current?.innerHTML || "");
  };

  const isEmpty = !value || value === "<br>" || value === "<div><br></div>";

  return (
    <div
      className={cn(
        "border rounded-xl overflow-hidden bg-card transition-[border-color,box-shadow] duration-150",
        focused ? "border-primary shadow-[0_0_0_3px_var(--primary-glow)]" : "border-border",
        disabled && "opacity-50 pointer-events-none",
        className,
      )}
    >
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border-light bg-surface-soft">
        {tools.map((t) => (
          <button
            key={t.cmd + (t.arg || "")}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              exec(t.cmd, t.arg);
            }}
            title={t.label}
            className={cn(
              "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-muted",
              "transition-colors cursor-pointer hover:bg-muted/15 hover:text-foreground active:bg-muted/25",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-soft",
              t.cmd === "bold" && "font-extrabold",
              t.cmd === "italic" && "italic",
              t.cmd === "underline" && "underline",
              t.cmd === "strikeThrough" && "line-through",
            )}
          >
            {t.icon}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="relative">
        {isEmpty && !focused && (
          <div className="absolute inset-0 px-3 py-2 text-sm text-muted-light pointer-events-none">
            {placeholder}
          </div>
        )}
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          dangerouslySetInnerHTML={{ __html: value || "" }}
          className="px-3 py-2 text-sm text-foreground outline-none prose-sm max-w-none"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}
