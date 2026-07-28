"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { useBrand } from "../../providers/BrandProvider";

export interface BrandSwitcherProps {
  /** 시각 변형 */
  variant?: "chips" | "list" | "select";
  /** 추가 클래스 */
  className?: string;
}

/**
 * 브랜드 전환 UI — `BrandProvider` 안에서 사용하면 자동으로 현재 브랜드를
 * 표시하고 변경할 수 있다.
 *
 * @example
 *   <BrandProvider>
 *     <BrandSwitcher variant="chips" />
 *     <App />
 *   </BrandProvider>
 *
 * @status stable
 * @since 2.5.0
 * @tags theme, control
 */
export const BrandSwitcher = forwardRef<HTMLDivElement, BrandSwitcherProps>(
  ({ variant = "chips", className }, ref) => {
    const { brand, presets, setBrand } = useBrand();

    if (variant === "select") {
      return (
        <select
          ref={ref as never}
          aria-label="브랜드 선택"
          value={brand?.id ?? "default"}
          onChange={(e) => setBrand(e.target.value)}
          className={cn(
            "h-9 px-3 text-sm rounded-xl border border-border bg-surface text-foreground cursor-pointer",
            "transition-colors duration-150 hover:border-muted-light",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            className,
          )}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      );
    }

    if (variant === "list") {
      return (
        <div
          ref={ref}
          role="radiogroup"
          aria-label="브랜드 선택"
          className={cn("space-y-1", className)}
        >
          {presets.map((p) => {
            const active = brand?.id === p.id;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setBrand(p.id)}
                className={cn(
                  // 바뀌는 건 테두리·배경색뿐이다 — transition-all 이면 padding 까지 대상이 된다.
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-colors duration-150 cursor-pointer text-left",
                  "active:scale-[0.99] motion-reduce:active:scale-100 motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "border-primary bg-primary/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                    : "border-border hover:border-primary/40 hover:bg-surface-soft",
                )}
              >
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-md shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${p.theme.primary}, ${p.theme.accent})`,
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{p.label}</span>
                  {p.tagline && (
                    <span className="block text-xs text-muted truncate">{p.tagline}</span>
                  )}
                </span>
                {active && (
                  <span aria-hidden="true" className="text-primary-ink text-sm">
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      );
    }

    // chips (default)
    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label="브랜드 선택"
        className={cn("flex flex-wrap gap-2", className)}
      >
        {presets.map((p) => {
          const active = brand?.id === p.id;
          return (
            <button
              key={p.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setBrand(p.id)}
              className={cn(
                // 활성/비활성 모두 테두리를 둔다 — 한쪽만 두면 전환할 때 1px 씩 밀린다.
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors duration-150 cursor-pointer",
                "active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                active
                  ? "bg-primary border-primary text-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.18)]"
                  : "bg-surface-soft border-border text-foreground hover:bg-surface hover:border-muted-light",
              )}
            >
              <span
                aria-hidden="true"
                className="w-3 h-3 rounded-full ring-2 ring-white/30"
                style={{ background: p.theme.primary }}
              />
              {p.label}
            </button>
          );
        })}
      </div>
    );
  },
);
BrandSwitcher.displayName = "BrandSwitcher";
