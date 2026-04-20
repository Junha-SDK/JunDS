/**
 * 비동기 작업의 race condition 방지 유틸리티
 * 여러 비동기 호출이 동시에 발생할 때 마지막 호출의 결과만 적용합니다.
 *
 * @example
 * const guard = createRaceGuard();
 *
 * async function fetchData(query: string) {
 *   const token = guard.next();
 *   const result = await api.search(query);
 *   if (!guard.isCurrent(token)) return; // 이미 새 요청이 시작됨
 *   setData(result);
 * }
 */
export function createRaceGuard() {
  let current = 0;

  return {
    /** 새 토큰 발급 (이전 토큰 무효화) */
    next(): number {
      return ++current;
    },
    /** 해당 토큰이 아직 유효한지 확인 */
    isCurrent(token: number): boolean {
      return token === current;
    },
    /** 현재 토큰 값 */
    get value() {
      return current;
    },
  };
}
