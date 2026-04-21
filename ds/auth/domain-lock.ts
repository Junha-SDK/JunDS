/**
 * @internal - 도메인 잠금 검증.
 * 라이선스에 등록된 도메인에서만 동작하도록 제한.
 */

const _ALLOWED_LOCAL = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
] as const;

/**
 * 현재 도메인이 허용 목록에 있는지 확인
 */
export function _isDomainAllowed(allowedDomains?: string[]): boolean {
  if (typeof window === "undefined") return true; // SSR 허용

  const currentDomain = window.location.hostname;

  // 로컬 개발 환경은 항상 허용
  if (
    (_ALLOWED_LOCAL as readonly string[]).includes(currentDomain) ||
    currentDomain.endsWith(".local")
  ) {
    return true;
  }

  // 도메인 목록이 없으면 (서버에서 미제공) 일단 허용
  if (!allowedDomains || allowedDomains.length === 0) {
    return true;
  }

  // 정확 매칭 또는 와일드카드 서브도메인 매칭
  return allowedDomains.some((allowed) => {
    if (allowed.startsWith("*.")) {
      const baseDomain = allowed.slice(2);
      return (
        currentDomain === baseDomain ||
        currentDomain.endsWith(`.${baseDomain}`)
      );
    }
    return currentDomain === allowed;
  });
}

/**
 * 도메인 변조 감지
 * location 객체가 조작되었는지 확인
 */
export function _isLocationTampered(): boolean {
  if (typeof window === "undefined") return false;

  try {
    // location 객체의 프로퍼티가 읽기 전용인지 확인
    const descriptor = Object.getOwnPropertyDescriptor(
      window,
      "location"
    );
    if (descriptor && descriptor.configurable) {
      return true; // 정상적인 브라우저에서는 configurable이 false
    }
  } catch {
    // 접근 에러는 정상
  }

  return false;
}
