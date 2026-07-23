/**
 * 등록 가드 (03-web-arch §2, WEB-06).
 * SSR/Node no-op + "선등록 승리 + 경고" — CE 레지스트리 재정의 throw 회피(MFE 안전).
 * defineJunds(전량 등록 진입점)는 컴포넌트 슬라이스에서 레지스트리와 함께 추가된다.
 */
export function defineElement(tag: string, ctor: CustomElementConstructor): void {
  if (typeof customElements === "undefined") return; // SSR/Node no-op
  const existing = customElements.get(tag);
  if (existing) {
    if (existing !== ctor) {
      console.warn(
        `[junds] <${tag}> 태그가 이미 다른 클래스로 정의되어 있어 건너뜁니다. ` +
          `JunDS 중복 번들(버전 충돌) 가능성을 확인하세요.`,
      );
    }
    return; // 선등록 승리 — 예외를 던지지 않는다
  }
  customElements.define(tag, ctor);
}
