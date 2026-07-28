/**
 * junDS 콘텐츠 카테고리 액센트 토큰
 *
 * 블로그/데일리/서재처럼 글의 "종류"별로 색을 달리 주는 화면에서, 한 카테고리가
 * 네 군데(점·배경·테두리·텍스트)에 일관된 톤으로 나타나도록 묶어 둔 세트다.
 * 각 세트는 다음 4개 슬롯을 가진다.
 *
 * - `accent` — 점·아이콘 등 채도 높은 단색
 * - `soft`   — 뱃지/칩 배경으로 쓰는 저채도 반투명
 * - `border` — `soft` 배경 위에 얹는 테두리
 * - `text`   — `soft` 배경 위에서 대비를 확보하는 밝은 글자색
 *
 * 어두운 배경 기준으로 튜닝된 값이다. 밝은 테마에서는 `accent` 를 그대로 쓰고
 * `soft`/`text` 는 테마 측에서 덮어쓰는 것을 권장한다.
 */
export const categoryColors = {
  movie: {
    accent: "#67b1ff",
    soft: "rgba(59, 130, 246, 0.16)",
    border: "rgba(103, 177, 255, 0.46)",
    text: "#dcecff",
  },
  daily: {
    accent: "#4ade80",
    soft: "rgba(34, 197, 94, 0.14)",
    border: "rgba(74, 222, 128, 0.38)",
    text: "#dcfce7",
  },
  comic: {
    accent: "#fb7185",
    soft: "rgba(244, 114, 182, 0.15)",
    border: "rgba(251, 113, 133, 0.38)",
    text: "#ffe4eb",
  },
  retrospect: {
    accent: "#fbbf24",
    soft: "rgba(251, 191, 36, 0.14)",
    border: "rgba(251, 191, 36, 0.36)",
    text: "#fff1c5",
  },
  book: {
    accent: "#f59e0b",
    soft: "rgba(245, 158, 11, 0.14)",
    border: "rgba(245, 158, 11, 0.34)",
    text: "#ffefc3",
  },
  musical: {
    accent: "#c084fc",
    soft: "rgba(192, 132, 252, 0.14)",
    border: "rgba(192, 132, 252, 0.46)",
    text: "#f0e2ff",
  },
  anime: {
    accent: "#5eead4",
    soft: "rgba(45, 212, 191, 0.14)",
    border: "rgba(94, 234, 212, 0.4)",
    text: "#d5fff6",
  },
  /** 카테고리를 모르는 항목이 섞였을 때의 무채색 폴백 */
  neutral: {
    accent: "#a4aabc",
    soft: "rgba(164, 170, 188, 0.12)",
    border: "rgba(164, 170, 188, 0.32)",
    text: "#e8eaf2",
  },
} as const;

export type CategoryName = keyof typeof categoryColors;

export interface CategoryColorSet {
  accent: string;
  soft: string;
  border: string;
  text: string;
}

/**
 * 카테고리 이름으로 색 세트를 조회한다. 모르는 이름이면 `neutral` 로 떨어진다.
 *
 * @example
 * const c = getCategoryColor(post.category);
 * <span style={{ background: c.soft, borderColor: c.border, color: c.text }} />
 */
export function getCategoryColor(name: string | undefined | null): CategoryColorSet {
  if (!name) return categoryColors.neutral;
  return categoryColors[name.toLowerCase() as CategoryName] ?? categoryColors.neutral;
}

/**
 * 한 카테고리 세트를 인라인 CSS 변수로 펼친다. 자식 요소들이 `var(--cat-accent)`
 * 같은 이름으로 참조할 수 있어, 카테고리별 스타일을 CSS 쪽에 몰아둘 때 쓴다.
 *
 * @example
 * <article style={categoryColorVars("book")}>…</article>
 */
export function categoryColorVars(name: string | undefined | null): Record<string, string> {
  const c = getCategoryColor(name);
  return {
    "--cat-accent": c.accent,
    "--cat-soft": c.soft,
    "--cat-border": c.border,
    "--cat-text": c.text,
  };
}
