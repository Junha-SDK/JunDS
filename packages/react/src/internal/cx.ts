/**
 * cx — 클래스 결합 (03-web-arch §7.1 / WEB-09 동형의 어댑터 사본).
 * v2 utils/cn(tailwind-merge)과 달리 충돌 해소가 없다 — v3 클래스는 jd- 네임스페이스라
 * 유틸 충돌이 없고, 소비자 className은 뒤에 붙어 CSS 캐스케이드로 이긴다(@layer 계약 §4.4).
 */
export type CxInput = string | false | null | undefined;

export function cx(...parts: CxInput[]): string {
  return parts.filter(Boolean).join(" ");
}
