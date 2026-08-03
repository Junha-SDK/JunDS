"use client";
import { useRef } from "react";
import { cn } from "../../utils/cn";
import { useT } from "../../providers/I18nProvider";

export interface CodeEditorProps {
  /** 편집기 코드 값 */
  value: string;
  /** 값 변경 콜백 */
  onChange?: (value: string) => void;
  /** 언어 라벨 (상단 표시) */
  language?: string;
  /** 읽기 전용 여부 */
  readOnly?: boolean;
  /** 줄 번호 표시 여부 */
  lineNumbers?: boolean;
  /** 최소 높이(px) */
  minHeight?: number;
  /** 추가 클래스 */
  className?: string;
  /** 스크린리더용 라벨 (기본 "코드 편집기") */
  "aria-label"?: string;
}

/**
 * 신택스 하이라이팅이 적용된 코드 편집기.
 * @example
 * <CodeEditor value={code} onChange={setCode} language="typescript" lineNumbers />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function CodeEditor({
  value,
  onChange,
  language,
  readOnly,
  lineNumbers = true,
  minHeight = 200,
  className,
  "aria-label": ariaLabel,
}: CodeEditorProps) {
  const t = useT();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lines = value.split("\n");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newVal = value.substring(0, start) + "  " + value.substring(end);
      onChange?.(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div className={cn("rounded-xl border border-border overflow-hidden", className)}>
      {language && (
        <div className="flex items-center justify-between px-4 py-2 bg-surface-soft border-b border-border">
          <span className="text-xs font-medium text-muted uppercase tracking-wider">
            {language}
          </span>
        </div>
      )}
      <div className="relative flex bg-gray-950" style={{ minHeight }}>
        {lineNumbers && (
          <div className="shrink-0 py-3 px-2 text-right select-none border-r border-gray-800">
            {lines.map((_, i) => (
              <div key={i} className="text-xs tabular-nums text-gray-500 leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          readOnly={readOnly}
          spellCheck={false}
          aria-label={
            ariaLabel ?? (language ? t("ariaCodeEditorOf", { language }) : t("ariaCodeEditor"))
          }
          className={cn(
            "flex-1 p-3 text-sm text-gray-100 bg-transparent resize-none font-mono leading-relaxed",
            // outline 을 끄면 대신할 표시를 같은 자리에서 줘야 한다. 편집기가 어두운
            // 면을 꽉 채우므로 바깥 링은 잘린다 — inset 으로 건다
            "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60",
            "placeholder:text-gray-500 caret-primary",
          )}
          style={{ minHeight, tabSize: 2 }}
        />
      </div>
    </div>
  );
}
