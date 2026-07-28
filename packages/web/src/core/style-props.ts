/**
 * style-props — v2 ds/core/styleProps의 바닐라 이식 (B1 선행 과제, 00-inventory §core).
 *
 * v2 Box의 토큰 기반 스타일 프롭(p/bg/radius…)을 attribute/property로 받아
 * 호스트 인라인 스타일로 반영한다.
 *
 * **어휘는 tokens/*.json 하나다 (DEC-045).** v2는 `ds/tokens/*`(정본)와
 * `ds/core/styleProps.ts`(별개 리터럴) 두 벌을 들고 있었고, v3 초기 이식은 그 분열까지
 * 그대로 옮겼다. 결과가 `<jd-image radius="md">`(6px, --jd-radius-md)와
 * `<jd-box radius="md">`(8px, v2 리터럴)가 같은 화면에서 다른 곡률로 그려지는 상태였다.
 * iOS는 생성기를 통해 tokens/*.json만 읽으므로 웹 스타일 프롭만 홀로 어긋나 있었다.
 * 이제 전 항목이 --jd-* var를 가리킨다 — 이름 하나 = 값 하나 = 플랫폼 무관.
 *
 * - 색: --jd-color-*
 * - spacing: 값이 일치하는 키만 --jd-space-* var 참조, 나머지(7·9·14·28~40·수치 폴백)는
 *   px 리터럴. named(xs~4xl)는 값 일치 var 별칭.
 * - radius/fontSize/shadow/zIndex: --jd-radius-* / --jd-text-* / --jd-shadow-* / --jd-z-*.
 *   v2 어휘에만 있던 이름(radius xs·3xl, fontSize 6xl, zIndex docked·banner,
 *   shadow inner)은 전 저장소 호출부 0건이라 제거했고, 만나면 REMOVED가 경고한다.
 *   2xs는 여기 있었다가 빠졌다 — v2 styleProps 전용 이름인 줄 알았으나 실제로는
 *   typography.ts의 스텝이고 DocPager·NowPlayingBar가 쓰고 있었다. DEC-051에서
 *   토큰(--jd-text-2xs)으로 승격하며 어휘로 복귀했다.
 *
 * 반응형: v2의 `p={{base:4, md:6}}`는 attribute 마이크로문법 `p="4 md:6"`으로 받는다
 * (JSON-in-attribute 금지 — WEB-03). v2는 base를 인라인으로 방출해 미디어 규칙이
 * 항상 패배하는 실측 버그가 있었다 — v3는 반응형 사용 시 base 포함 전 구간을
 * 콘텐츠 해시 클래스 규칙(@layer junds.components)으로 방출해 의도대로 동작한다.
 * 해시는 내용 결정적 — 프리렌더 스냅샷이 실행 시점과 무관하게 동일(§3.1-3).
 */
import type { PropDef } from "./element.js";
import { adoptStyles } from "./styles.js";
import type { JdStyles } from "./styles.js";
import { BREAKPOINTS } from "./tokens.generated.js";

/* ─── 어휘 (v2 styleProps.ts 값 그대로) ─── */

/** 값 일치 확인된 키 → --jd-space-* 참조 (rem@16px == v2 px). named는 값 일치 별칭 */
const SPACE_VAR: Record<string, string> = {
  "0": "0", // var(--jd-space-0)=0 — 리터럴이 더 짧다
  "0.5": "var(--jd-space-0-5)",
  "1": "var(--jd-space-1)",
  "1.5": "var(--jd-space-1-5)",
  "2": "var(--jd-space-2)",
  "2.5": "var(--jd-space-2-5)",
  "3": "var(--jd-space-3)",
  "3.5": "var(--jd-space-3-5)",
  "4": "var(--jd-space-4)",
  "5": "var(--jd-space-5)",
  "6": "var(--jd-space-6)",
  "8": "var(--jd-space-8)",
  "10": "var(--jd-space-10)",
  "12": "var(--jd-space-12)",
  "16": "var(--jd-space-16)",
  "20": "var(--jd-space-20)",
  "24": "var(--jd-space-24)",
  xs: "var(--jd-space-1)",
  sm: "var(--jd-space-2)",
  md: "var(--jd-space-4)",
  lg: "var(--jd-space-6)",
  xl: "var(--jd-space-8)",
  "2xl": "var(--jd-space-12)",
  "3xl": "var(--jd-space-16)",
  "4xl": "var(--jd-space-24)",
};
/** v2 SPACING px 값 전량 — 토큰 부재 스텝(7·9·14·28~40)의 정방향 + 음수 반전의 원천 */
const SPACE_PX: Record<string, string> = {
  "0": "0px",
  "0.5": "2px",
  "1": "4px",
  "1.5": "6px",
  "2": "8px",
  "2.5": "10px",
  "3": "12px",
  "3.5": "14px",
  "4": "16px",
  "5": "20px",
  "6": "24px",
  "7": "28px",
  "8": "32px",
  "9": "36px",
  "10": "40px",
  "12": "48px",
  "14": "56px",
  "16": "64px",
  "20": "80px",
  "24": "96px",
  "28": "112px",
  "32": "128px",
  "36": "144px",
  "40": "160px",
  xs: "4px",
  sm: "8px",
  md: "16px",
  lg: "24px",
  xl: "32px",
  "2xl": "48px",
  "3xl": "64px",
  "4xl": "96px",
};

/** v2 COLORS — var() 참조를 --jd-color-* 로 기계 번역 (값 동일) */
const COLORS: Record<string, string> = {
  primary: "var(--jd-color-primary)",
  "primary-hover": "var(--jd-color-primary-hover)",
  "primary-light": "var(--jd-color-primary-light)",
  "primary-glow": "var(--jd-color-primary-glow)",
  accent: "var(--jd-color-accent)",
  "accent-light": "var(--jd-color-accent-light)",
  danger: "var(--jd-color-danger)",
  "danger-hover": "var(--jd-color-danger-hover)",
  "danger-light": "var(--jd-color-danger-light)",
  success: "var(--jd-color-success)",
  "success-light": "var(--jd-color-success-light)",
  warning: "var(--jd-color-warning)",
  "warning-light": "var(--jd-color-warning-light)",
  info: "var(--jd-color-info)",
  "info-light": "var(--jd-color-info-light)",
  background: "var(--jd-color-background)",
  foreground: "var(--jd-color-foreground)",
  surface: "var(--jd-color-background)", // v2: surface = var(--background)
  "surface-raised": "var(--jd-color-card)",
  card: "var(--jd-color-card)",
  "card-hover": "var(--jd-color-card-hover)",
  border: "var(--jd-color-border)",
  "border-light": "var(--jd-color-border-light)",
  muted: "var(--jd-color-muted)",
  "muted-light": "var(--jd-color-muted-light)",
  white: "#ffffff",
  black: "#000000",
  transparent: "transparent",
  inherit: "inherit",
  current: "currentColor",
};

/** radius — tokens/radius.json 정본 (DEC-008-(4)). iOS JdToken.Radius와 같은 값 */
const RADII: Record<string, string> = {
  none: "var(--jd-radius-none)",
  sm: "var(--jd-radius-sm)",
  md: "var(--jd-radius-md)",
  lg: "var(--jd-radius-lg)",
  xl: "var(--jd-radius-xl)",
  "2xl": "var(--jd-radius-2xl)",
  full: "var(--jd-radius-full)",
};

/**
 * shadow — tokens/shadow.json 정본 (DEC-039 2겹 엘리베이션). 다크는 var가 알아서 바뀐다.
 * focusRing까지 **예외 없이** 전부 노출한다: "tokens/shadow.json에 있는 이름은 그대로
 * 쓸 수 있다"가 외울 것 없는 규칙이고, 예외를 하나 두는 순간 표를 찾아봐야 한다.
 */
const SHADOWS: Record<string, string> = {
  none: "var(--jd-shadow-none)",
  xs: "var(--jd-shadow-xs)",
  sm: "var(--jd-shadow-sm)",
  md: "var(--jd-shadow-md)",
  lg: "var(--jd-shadow-lg)",
  xl: "var(--jd-shadow-xl)",
  "2xl": "var(--jd-shadow-2xl)",
  knob: "var(--jd-shadow-knob)",
  focusRing: "var(--jd-shadow-focus-ring)",
  focusRingDanger: "var(--jd-shadow-focus-ring-danger)",
};

/** fontSize — tokens/type.json 정본. iOS JdToken.FontSize와 같은 값 */
const FONT_SIZES: Record<string, string> = {
  "2xs": "var(--jd-text-2xs)",
  xs: "var(--jd-text-xs)",
  sm: "var(--jd-text-sm)",
  md: "var(--jd-text-md)",
  lg: "var(--jd-text-lg)",
  xl: "var(--jd-text-xl)",
  "2xl": "var(--jd-text-2xl)",
  "3xl": "var(--jd-text-3xl)",
  "4xl": "var(--jd-text-4xl)",
  "5xl": "var(--jd-text-5xl)",
};

/** v2 FONT_WEIGHTS — 이름-값 일치분은 var, 토큰에 없는 스텝은 리터럴 */
const FONT_WEIGHTS: Record<string, string> = {
  thin: "100",
  light: "300",
  normal: "var(--jd-weight-normal)",
  medium: "var(--jd-weight-medium)",
  semibold: "var(--jd-weight-semibold)",
  bold: "var(--jd-weight-bold)",
  extrabold: "800",
  black: "900",
};

/** v2 LINE_HEIGHTS — 전 항목 토큰과 이름-값 일치 → var */
const LINE_HEIGHTS: Record<string, string> = {
  none: "var(--jd-leading-none)",
  tight: "var(--jd-leading-tight)",
  snug: "var(--jd-leading-snug)",
  normal: "var(--jd-leading-normal)",
  relaxed: "var(--jd-leading-relaxed)",
  loose: "var(--jd-leading-loose)",
};

/**
 * v2 LETTER_SPACINGS — 토큰 일치분 var, 토큰에 없는 widest만 리터럴.
 * wider는 DEC-051에서 토큰이 됐다(0.08em). 이식 당시 박아 둔 0.05em을 그대로 뒀다면
 * `tracking-wider` 클래스와 `letterSpacing="wider"`가 같은 이름으로 다른 자간을 그렸을 것이다.
 */
const LETTER_SPACINGS: Record<string, string> = {
  tighter: "var(--jd-tracking-tighter)",
  tight: "var(--jd-tracking-tight)",
  normal: "var(--jd-tracking-normal)",
  wide: "var(--jd-tracking-wide)",
  wider: "var(--jd-tracking-wider)",
  widest: "0.1em",
};

/** zIndex — tokens/zindex.json 정본. 층 순서는 v2와 동일하고 눈금만 10 간격이다 */
const Z_INDICES: Record<string, string> = {
  hide: "var(--jd-z-hide)",
  base: "var(--jd-z-base)",
  dropdown: "var(--jd-z-dropdown)",
  sticky: "var(--jd-z-sticky)",
  header: "var(--jd-z-header)",
  overlay: "var(--jd-z-overlay)",
  modal: "var(--jd-z-modal)",
  popover: "var(--jd-z-popover)",
  toast: "var(--jd-z-toast)",
  tooltip: "var(--jd-z-tooltip)",
  max: "var(--jd-z-max)",
};

/**
 * v2 어휘에만 있던 이름 → 대체 (DEC-045). 전 저장소 호출부 0건이라 값 폴백 없이
 * 경고만 하고 버린다 — 조용히 다른 값으로 바꿔주는 쪽이 더 나쁘다.
 */
const REMOVED: Record<string, string> = {
  "radius:xs": 'radius="sm" (4px — v2 xs와 같은 값)',
  "radius:3xl": 'radius="2xl" (16px). v2 3xl(24px)은 토큰 척도에 없다',
  "fontSize:6xl": 'fontSize="5xl" (2.25rem)',
  "zIndex:docked": 'zIndex="dropdown" (v2 docked와 같은 층)',
  "zIndex:banner": 'zIndex="header" (sticky와 overlay 사이 — v2 banner 자리)',
  "shadow:inner": "직접 box-shadow를 적어라 — inset은 엘리베이션 척도가 아니다",
};
const warned = new Set<string>();

function warnRemoved(key: string, raw: string): void {
  const hit = REMOVED[`${key}:${raw}`];
  if (!hit || warned.has(`${key}:${raw}`)) return;
  warned.add(`${key}:${raw}`);
  console.warn(`[junds] ${key}="${raw}"는 v3에서 제거된 v2 어휘입니다 — ${hit}`);
}

/** v2 TRANSITIONS 그대로 */
const TRANSITIONS: Record<string, string> = {
  none: "none",
  fast: "all 100ms cubic-bezier(0.4, 0, 0.2, 1)",
  normal: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  slow: "all 300ms cubic-bezier(0.4, 0, 0.2, 1)",
  colors: "color, background-color, border-color 200ms ease",
  transform: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
  shadow: "box-shadow 200ms ease",
};

const JUSTIFY_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
  evenly: "space-evenly",
};
const ALIGN_MAP: Record<string, string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
  baseline: "baseline",
};

/**
 * min-width 미디어 조건 기준점 — tokens/breakpoint.json 정본 (생성물 재수출).
 * 여기 숫자를 손으로 적어 두면 토큰을 고쳤을 때 이 파일만 조용히 뒤처진다.
 */
export { BREAKPOINTS };

/* ─── 리졸버 ─── */

const NUMERIC = /^-?\d+(?:\.\d+)?$/;

/**
 * spacing 토큰 → CSS 값. v2 resolveSpacing 동형:
 * 알려진 키 → var/px, 음수 → 부호 반전, 수치 폴백 n×4px, "auto" 허용(v2 실측 버그 보정).
 */
export function resolveSpace(raw: string): string | null {
  if (raw === "auto") return "auto"; // v2는 auto가 조용히 무시됐다(실측 버그) — 의도 보정
  const direct = SPACE_VAR[raw] ?? SPACE_PX[raw];
  if (direct !== undefined) return direct;
  if (raw.startsWith("-")) {
    // 음수는 v2 그대로 px 리터럴 반전 (`-${SPACING[abs]}`)
    const abs = raw.slice(1);
    const px = SPACE_PX[abs];
    if (px !== undefined) return px === "0px" ? "0px" : `-${px}`;
    if (NUMERIC.test(abs)) return `-${Number(abs) * 4}px`;
    return null;
  }
  if (NUMERIC.test(raw)) return `${Number(raw) * 4}px`;
  return null; // v2와 동일 — 미지 토큰은 무시
}

/** color 토큰 → CSS 값 (미지 값은 원문 통과 — v2 동형) */
export function resolveColor(raw: string): string {
  return COLORS[raw] ?? raw;
}

/** w/h/minW… 치수 — v2 resolveSize 동형 */
function resolveSize(raw: string): string {
  if (raw === "full") return "100%";
  if (raw === "screen") return "100vw";
  if (raw === "screenH") return "100vh";
  if (NUMERIC.test(raw)) return `${raw}px`;
  return raw;
}

type Decl = [prop: string, value: string];

const SPACING_TARGETS: Record<string, string[]> = {
  p: ["padding"],
  px: ["padding-left", "padding-right"],
  py: ["padding-top", "padding-bottom"],
  pt: ["padding-top"],
  pr: ["padding-right"],
  pb: ["padding-bottom"],
  pl: ["padding-left"],
  m: ["margin"],
  mx: ["margin-left", "margin-right"],
  my: ["margin-top", "margin-bottom"],
  mt: ["margin-top"],
  mr: ["margin-right"],
  mb: ["margin-bottom"],
  ml: ["margin-left"],
  gap: ["gap"],
  rowGap: ["row-gap"],
  columnGap: ["column-gap"],
  top: ["top"],
  right: ["right"],
  bottom: ["bottom"],
  left: ["left"],
};

/** 스타일 프롭 1개 → CSS 선언들. 해석 불가면 [] (v2: undefined 무시와 동형) */
function resolveOne(key: string, raw: string): Decl[] {
  const spacing = SPACING_TARGETS[key];
  if (spacing) {
    const v = resolveSpace(raw);
    return v === null ? [] : spacing.map((p): Decl => [p, v]);
  }
  switch (key) {
    case "w":
      return [["width", resolveSize(raw)]];
    case "h":
      return [["height", resolveSize(raw)]];
    case "minW":
      return [["min-width", resolveSize(raw)]];
    case "minH":
      return [["min-height", resolveSize(raw)]];
    case "maxW":
      return [["max-width", resolveSize(raw)]];
    case "maxH":
      return [["max-height", resolveSize(raw)]];
    case "bg":
      return [["background-color", resolveColor(raw)]];
    case "color":
      return [["color", resolveColor(raw)]];
    case "borderColor":
      return [["border-color", resolveColor(raw)]];
    case "display":
      return [["display", raw]];
    case "direction":
      return [["flex-direction", raw]];
    case "align": {
      const v = ALIGN_MAP[raw];
      return v ? [["align-items", v]] : [];
    }
    case "justify": {
      const v = JUSTIFY_MAP[raw];
      return v ? [["justify-content", v]] : [];
    }
    case "wrap":
      return [["flex-wrap", raw]];
    case "flex":
      return [["flex", raw]];
    case "grow":
      return [["flex-grow", raw]];
    case "shrink":
      return [["flex-shrink", raw]];
    case "cols":
      return [["grid-template-columns", NUMERIC.test(raw) ? `repeat(${raw}, 1fr)` : raw]];
    case "rows":
      return [["grid-template-rows", NUMERIC.test(raw) ? `repeat(${raw}, 1fr)` : raw]];
    case "colSpan":
      return [["grid-column", `span ${raw}`]];
    case "rowSpan":
      return [["grid-row", `span ${raw}`]];
    case "position":
      return [["position", raw]];
    case "zIndex": {
      const v = Z_INDICES[raw] ?? (NUMERIC.test(raw) ? raw : null);
      if (v === null) warnRemoved(key, raw);
      return v === null ? [] : [["z-index", v]];
    }
    case "radius":
      if (!(raw in RADII)) warnRemoved(key, raw);
      return [["border-radius", RADII[raw] ?? raw]];
    case "border":
      // boolean attribute(빈 값)·"true" → 기본 보더를 롱핸드로(v2 동형 — width/style/color
      // 개별 방출이라 var() 색이 shorthand 파서에 잘리지 않는다). 문자열이면 원문.
      if (raw === "true") {
        return [
          ["border-width", "1px"],
          ["border-style", "solid"],
          ["border-color", "var(--jd-color-border)"],
        ];
      }
      return [["border", raw]];
    case "borderWidth":
      return NUMERIC.test(raw)
        ? [
            ["border-width", `${raw}px`],
            ["border-style", "solid"],
          ]
        : [];
    case "shadow":
      if (!(raw in SHADOWS)) warnRemoved(key, raw);
      return [["box-shadow", SHADOWS[raw] ?? raw]];
    case "opacity":
      return [["opacity", raw]];
    case "overflow":
      return [["overflow", raw]];
    case "cursor":
      return [["cursor", raw]];
    case "fontSize":
      if (!(raw in FONT_SIZES)) warnRemoved(key, raw);
      return [["font-size", FONT_SIZES[raw] ?? raw]];
    case "fontWeight":
      return [["font-weight", FONT_WEIGHTS[raw] ?? raw]];
    case "textAlign":
      return [["text-align", raw]];
    case "lineHeight":
      return [["line-height", LINE_HEIGHTS[raw] ?? raw]];
    case "letterSpacing":
      return [["letter-spacing", LETTER_SPACINGS[raw] ?? raw]];
    case "textTransform":
      return [["text-transform", raw]];
    case "textDecoration":
      return [["text-decoration", raw]];
    case "transition": {
      if (raw === "true") return [["transition", TRANSITIONS.normal!]];
      if (raw === "false") return [["transition", TRANSITIONS.none!]];
      return [["transition", TRANSITIONS[raw] ?? raw]];
    }
    case "userSelect":
      return [["user-select", raw]];
    case "pointerEvents":
      return [["pointer-events", raw]];
    default:
      return [];
  }
}

/* ─── 프롭 선언 ─── */

/**
 * 적용 순서 고정 배열 — border(shorthand)가 borderColor보다 앞이라
 * `border` + `borderColor` 병용 시 색 오버라이드가 성립한다(v2 동형).
 */
export const STYLE_PROP_KEYS = [
  "p",
  "px",
  "py",
  "pt",
  "pr",
  "pb",
  "pl",
  "m",
  "mx",
  "my",
  "mt",
  "mr",
  "mb",
  "ml",
  "gap",
  "rowGap",
  "columnGap",
  "w",
  "h",
  "minW",
  "minH",
  "maxW",
  "maxH",
  "bg",
  "color",
  "display",
  "direction",
  "align",
  "justify",
  "wrap",
  "flex",
  "grow",
  "shrink",
  "cols",
  "rows",
  "colSpan",
  "rowSpan",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "zIndex",
  "radius",
  "border",
  "borderColor",
  "borderWidth",
  "shadow",
  "opacity",
  "overflow",
  "cursor",
  "fontSize",
  "fontWeight",
  "textAlign",
  "lineHeight",
  "letterSpacing",
  "textTransform",
  "textDecoration",
  "transition",
  "userSelect",
  "pointerEvents",
] as const;

export type StylePropKey = (typeof STYLE_PROP_KEYS)[number];

/** JdElement `static props`에 스프레드할 선언 맵 — 전부 String, 반영 없음(스타일 훅 아님) */
export const STYLE_PROPS: Record<string, PropDef> = Object.fromEntries(
  STYLE_PROP_KEYS.map((k) => [k, { type: String }]),
);

/** 소비자 타입 표면 — `interface JdBox extends JdStyleProps {}` 선언 병합용 */
export interface JdStyleProps {
  p?: string | number;
  px?: string | number;
  py?: string | number;
  pt?: string | number;
  pr?: string | number;
  pb?: string | number;
  pl?: string | number;
  m?: string | number;
  mx?: string | number;
  my?: string | number;
  mt?: string | number;
  mr?: string | number;
  mb?: string | number;
  ml?: string | number;
  gap?: string | number;
  rowGap?: string | number;
  columnGap?: string | number;
  w?: string | number;
  h?: string | number;
  minW?: string | number;
  minH?: string | number;
  maxW?: string | number;
  maxH?: string | number;
  bg?: string;
  color?: string;
  borderColor?: string;
  display?: string;
  direction?: string;
  align?: string;
  justify?: string;
  wrap?: string;
  flex?: string | number;
  grow?: string | number;
  shrink?: string | number;
  cols?: string | number;
  rows?: string | number;
  colSpan?: string | number;
  rowSpan?: string | number;
  position?: string;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: string | number;
  radius?: string;
  border?: string | boolean;
  borderWidth?: string | number;
  shadow?: string;
  opacity?: string | number;
  overflow?: string;
  cursor?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: string;
  lineHeight?: string | number;
  letterSpacing?: string;
  textTransform?: string;
  textDecoration?: string;
  transition?: string | boolean;
  userSelect?: string;
  pointerEvents?: string;
}

/* ─── 반응형 ─── */

/** v2 generateResponsiveCSS가 다루던 프롭 집합 그대로 */
const RESPONSIVE_KEYS = new Set<string>([
  ...Object.keys(SPACING_TARGETS).filter((k) => !["top", "right", "bottom", "left"].includes(k)),
  "display",
  "direction",
  "cols",
  "bg",
  "color",
  "fontSize",
  "radius",
  "textAlign",
  "w",
  "h",
]);

const BP_SEG = /^(sm|md|lg|xl|2xl):(.+)$/;
const HAS_BP = /(?:^|\s)(?:sm|md|lg|xl|2xl):/;

/** 동적 반응형 규칙 시트 — 문서당 1회 채택, 내용은 클래스 추가 시마다 replaceSync */
const respParts: string[] = [];
const respCache = new Map<string, string>(); // canonical body → class name
let respSheet: CSSStyleSheet | undefined;
const RESP_STYLES: JdStyles = {
  text: "", // 정적 CSS 추출 대상 아님 — 런타임 전용
  sheet() {
    if (!respSheet) respSheet = new CSSStyleSheet();
    return respSheet;
  },
};

function djb2(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

interface RespBuckets {
  base: Decl[];
  byBp: Map<string, Decl[]>;
}

/**
 * 반응형 선언 묶음 → 결정적 클래스명. 같은 내용이면 같은 클래스(중복 규칙 없음).
 * 규칙은 @layer junds.components 안 — 소비자 무레이어 CSS가 항상 이긴다(WEB-08).
 */
function ensureRespClass(buckets: RespBuckets): string {
  const declText = (ds: Decl[]): string => ds.map(([p, v]) => `${p}:${v};`).join("");
  let body = buckets.base.length ? `&{${declText(buckets.base)}}` : "";
  for (const [bp, px] of Object.entries(BREAKPOINTS)) {
    const ds = buckets.byBp.get(bp);
    if (ds?.length) body += `@media (min-width:${px}px){&{${declText(ds)}}}`;
  }
  const cached = respCache.get(body);
  if (cached) return cached;
  const cls = `jd-r-${djb2(body)}`;
  respCache.set(body, cls);
  respParts.push(body.replaceAll("&", `.${cls}`));
  RESP_STYLES.sheet().replaceSync(`@layer junds.components{${respParts.join("")}}`);
  adoptStyles(RESP_STYLES);
  return cls;
}

/* ─── 적용기 ─── */

interface AppliedState {
  inline: string[];
  cls: string | null;
}
const applied = new WeakMap<Element, AppliedState>();

export interface ApplyOptions {
  /** 컴포넌트가 자체 의미로 소비하는 키 — 호스트 적용에서 제외 */
  skip?: readonly string[];
  /** 프롭 값 강제 (예: Text dimmed → color:"muted" — v2의 조건 분기 동형) */
  overrides?: Record<string, unknown>;
}

/**
 * 엘리먼트의 스타일 프롭 전체를 호스트에 반영한다.
 * - 비반응형 값 → 인라인 스타일 (이전 적용분만 diff 제거 — 소비자 인라인 보존)
 * - 반응형 값(`"4 md:6"`) → 콘텐츠 해시 클래스 (이전 클래스만 교체 — 소비자 클래스 보존)
 */
export function applyStyleProps(el: HTMLElement, opts?: ApplyOptions): void {
  const skip = opts?.skip;
  const overrides = opts?.overrides;
  const record = el as unknown as Record<string, unknown>;

  const inline: Decl[] = [];
  const buckets: RespBuckets = { base: [], byBp: new Map() };
  let hasResp = false;

  for (const key of STYLE_PROP_KEYS) {
    if (skip?.includes(key)) continue;
    let v = overrides && key in overrides ? overrides[key] : record[key];
    if (v === true) v = "true";
    else if (v === false || v == null) continue;
    // boolean attribute 표기(`border`·`transition` 빈 값) → true 의미
    if (v === "" && (key === "border" || key === "transition") && el.hasAttribute(key)) v = "true";
    if (v === "") continue;
    const raw = String(v);

    if (RESPONSIVE_KEYS.has(key) && HAS_BP.test(raw)) {
      hasResp = true;
      for (const seg of raw.trim().split(/\s+/)) {
        const m = BP_SEG.exec(seg);
        if (m) {
          const bp = m[1]!;
          let ds = buckets.byBp.get(bp);
          if (!ds) buckets.byBp.set(bp, (ds = []));
          ds.push(...resolveOne(key, m[2]!));
        } else {
          buckets.base.push(...resolveOne(key, seg));
        }
      }
    } else {
      inline.push(...resolveOne(key, raw));
    }
  }

  const prev = applied.get(el);

  // 인라인 diff — 이전에 우리가 쓴 프로퍼티 중 사라진 것만 제거
  const nextProps = inline.map(([p]) => p);
  if (prev) {
    for (const p of prev.inline) {
      if (!nextProps.includes(p)) el.style.removeProperty(p);
    }
  }
  for (const [p, v] of inline) el.style.setProperty(p, v);

  // 반응형 클래스 교체
  const cls = hasResp ? ensureRespClass(buckets) : null;
  if (prev?.cls && prev.cls !== cls) el.classList.remove(prev.cls);
  if (cls && !el.classList.contains(cls)) el.classList.add(cls);
  if (el.getAttribute("class") === "") el.removeAttribute("class");

  applied.set(el, { inline: nextProps, cls });
}
