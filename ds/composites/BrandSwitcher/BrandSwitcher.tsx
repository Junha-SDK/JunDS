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
            "h-9 px-3 text-sm rounded-md border border-border bg-surface text-foreground cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            className,
          )}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      );
    }

    if (variant === "list") {
      return (
        <div ref={ref} role="radiogroup" aria-label="브랜드 선택" className={cn("space-y-1", className)}>
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
                  "w-full flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer text-left",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                )}
              >
                <span
                  aria-hidden="true"
                  className="w-8 h-8 rounded-md shrink-0"
                  style={{ background: `linear-gradient(135deg, ${p.theme.primary}, ${p.theme.accent})` }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-foreground">{p.label}</span>
                  {p.tagline && <span className="block text-xs text-muted truncate">{p.tagline}</span>}
                </span>
                {active && <span aria-hidden="true" className="text-primary text-sm">✓</span>}
              </button>
            );
          })}
        </div>
      );
    }

    // chips (default)
    return (
      <div ref={ref} role="radiogroup" aria-label="브랜드 선택" className={cn("flex flex-wrap gap-2", className)}>
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
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                active ? "bg-primary text-white" : "bg-surface-soft text-foreground hover:bg-surface",
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
