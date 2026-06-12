"use client";

export type BmSwitchSize = "sm" | "md" | "lg";

export interface BmSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: BmSwitchSize;
  label?: string;
  className?: string;
}

const TRACK: Record<BmSwitchSize, { w: number; h: number }> = {
  sm: { w: 36, h: 20 },
  md: { w: 44, h: 24 },
  lg: { w: 56, h: 28 },
};

const THUMB: Record<BmSwitchSize, number> = {
  sm: 14,
  md: 18,
  lg: 22,
};

export function BmSwitch({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
  className,
}: BmSwitchProps) {
  const t = TRACK[size];
  const thumb = THUMB[size];
  const inset = (t.h - thumb) / 2;
  const translate = t.w - thumb - inset * 2;

  return (
    <label
      className={[
        "inline-flex items-center gap-2 select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className="relative inline-flex shrink-0 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{
          width: t.w,
          height: t.h,
          background: checked
            ? "linear-gradient(135deg, var(--bm-accent) 0%, #5cdcd0 100%)"
            : "var(--bm-soft-200)",
          boxShadow: checked
            ? "inset 0 1px 2px rgba(0,0,0,0.08)"
            : "inset 0 1px 2px rgba(15,23,42,0.08)",
        }}
      >
        <span
          className="absolute top-1/2 rounded-full bg-[color:var(--bm-card)] transition-transform duration-200"
          style={{
            width: thumb,
            height: thumb,
            left: inset,
            transform: `translateY(-50%) translateX(${checked ? translate : 0}px)`,
            boxShadow:
              "0 1px 2px rgba(15,23,42,0.18), 0 2px 4px rgba(15,23,42,0.06)",
          }}
        />
      </button>
      {label ? (
        <span className="text-[13px] font-semibold" style={{ color: "var(--bm-text)" }}>
          {label}
        </span>
      ) : null}
    </label>
  );
}
