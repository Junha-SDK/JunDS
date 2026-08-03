/**
 * @internal - 런타임 무결성 검증 및 안티 탬퍼링.
 * 빌드 시 난독화되어 역공학이 어려움.
 */

const _INTEGRITY_CHECK_INTERVAL = 1000 * 60 * 30; // 30분

interface _IntegrityState {
  _initialized: boolean;
  _intervalId: ReturnType<typeof setInterval> | null;
  _violations: number;
}

const _state: _IntegrityState = {
  _initialized: false,
  _intervalId: null,
  _violations: 0,
};

/**
 * 개발자 도구 감지 (프로덕션 전용)
 * - 콘솔 타이밍 분석
 * - 창 크기 변화 감지
 */
function _detectDevTools(): boolean {
  if (typeof window === "undefined") return false;

  // 외부/내부 창 크기 차이로 감지
  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;

  if (widthThreshold || heightThreshold) {
    return true;
  }

  return false;
}

/**
 * 프로토타입 변조 감지
 * - 핵심 함수들이 네이티브인지 확인
 */
function _detectPrototypeTampering(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const nativeToString = Function.prototype.toString;
    const fetchStr = nativeToString.call(fetch);

    // 네이티브 함수는 [native code]를 포함해야 함
    if (!fetchStr.includes("[native code]")) {
      return true;
    }
  } catch {
    return true;
  }

  return false;
}

/**
 * 글로벌 오버라이드 감지
 * - JSON.parse, fetch 등 핵심 API 변조 확인
 */
function _detectGlobalOverrides(): boolean {
  if (typeof window === "undefined") return false;

  const criticalAPIs = [
    { obj: window, name: "fetch" },
    { obj: JSON, name: "parse" },
    { obj: JSON, name: "stringify" },
  ];

  for (const api of criticalAPIs) {
    try {
      const descriptor = Object.getOwnPropertyDescriptor(api.obj, api.name);
      if (descriptor && (descriptor.get || descriptor.set)) {
        return true;
      }
    } catch {
      return true;
    }
  }

  return false;
}

/**
 * 무결성 검사를 실행하고 위반 시 콜백 호출
 */
export function _runIntegrityCheck(onViolation?: (type: string) => void): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  let clean = true;

  if (_detectDevTools()) {
    onViolation?.("devtools");
    _state._violations++;
    clean = false;
  }

  if (_detectPrototypeTampering()) {
    onViolation?.("prototype_tampering");
    _state._violations++;
    clean = false;
  }

  if (_detectGlobalOverrides()) {
    onViolation?.("global_override");
    _state._violations++;
    clean = false;
  }

  return clean;
}

/**
 * 주기적 무결성 검사 시작
 */
export function _startIntegrityMonitor(onViolation?: (type: string) => void): void {
  if (_state._initialized) return;
  if (process.env.NODE_ENV !== "production") return;

  _state._initialized = true;

  // 초기 검사
  _runIntegrityCheck(onViolation);

  // 주기적 검사
  _state._intervalId = setInterval(() => {
    _runIntegrityCheck(onViolation);

    // 위반이 누적되면 경고 강화
    if (_state._violations >= 3) {
      onViolation?.("repeated_violations");
    }
  }, _INTEGRITY_CHECK_INTERVAL);
}

/**
 * 무결성 모니터 중지
 */
export function _stopIntegrityMonitor(): void {
  if (_state._intervalId) {
    clearInterval(_state._intervalId);
    _state._intervalId = null;
  }
  _state._initialized = false;
}
