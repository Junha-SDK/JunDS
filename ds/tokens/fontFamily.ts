/**
 * junDS 폰트 패밀리 토큰
 *
 * 각 스택은 웹폰트가 없는 환경에서도 무너지지 않도록 시스템 폰트까지 내려가는
 * 완전한 fallback 체인을 포함한다. 웹폰트(Pretendard / Inter / Noto Serif KR /
 * Playfair Display / Caveat)는 호스트 앱이 로드해야 하며, 로드되지 않아도
 * 동일한 계열의 시스템 폰트로 대체된다.
 */
export const fontFamily = {
  /** 기본 UI 본문 — Pretendard 우선, 한글/영문 혼용에 최적화 */
  sans:
    '"Pretendard Variable", Pretendard, "Inter", "Noto Sans KR", ui-sans-serif, ' +
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, ' +
    'sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
  /** 장문 읽기(에세이·책 본문)용 명조 계열 */
  serif: '"Noto Serif KR", "Nanum Myeongjo", Georgia, "Times New Roman", serif',
  /** 히어로 타이틀·표지 등 디스플레이 용도 */
  display: '"Playfair Display", Georgia, "Times New Roman", serif',
  /** 손글씨 느낌의 강조(인용·서명 등) */
  hand: '"Caveat", "Bradley Hand", "Segoe Script", cursive',
  /** 코드·수치 정렬용 고정폭 */
  mono:
    'ui-monospace, "SF Mono", "JetBrains Mono", "Fira Code", Menlo, Consolas, ' +
    '"Liberation Mono", monospace',
} as const;

export type FontFamily = keyof typeof fontFamily;
