import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
  showSubtitle?: boolean;
}

const SIZE: Record<NonNullable<LogoProps["size"]>, { fs: number; gap: number }> = {
  sm: { fs: 18, gap: 6 },
  md: { fs: 20, gap: 8 },
  lg: { fs: 24, gap: 10 },
};

export function Logo({ size = "md", href, showSubtitle = false }: LogoProps) {
  const { fs, gap } = SIZE[size];
  const inner = (
    <span className="inline-flex items-baseline" style={{ gap }}>
      <span
        className="font-extrabold tracking-tight"
        style={{
          color: "var(--bm-accent-light)",
          fontSize: fs,
          letterSpacing: "-0.02em",
        }}
      >
        버터
      </span>
      {showSubtitle ? (
        <span
          className="text-[11px] font-bold tracking-wider"
          style={{ color: "var(--bm-muted)" }}
        >
          BUTTERMONEY
        </span>
      ) : null}
    </span>
  );
  return href ? (
    <Link href={href} className="inline-flex items-center">
      {inner}
    </Link>
  ) : (
    inner
  );
}
