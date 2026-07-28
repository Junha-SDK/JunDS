/**
 * Node 25는 `--localstorage-file` 없이도 불완전한 전역 Storage 접근자를 노출할
 * 수 있다. 필요한 경우에만 표준 표면의 메모리 구현을 주입해 Node 22 CI와 최신
 * 로컬 Node에서 테스트·coverage 결과가 같게 한다.
 */
function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(String(key)) ?? null;
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
    removeItem(key) {
      values.delete(String(key));
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
  };
}

function ensureStorage(name: "localStorage" | "sessionStorage"): void {
  if (typeof window === "undefined") return;
  // Node 25의 accessor 자체를 읽으면 `--localstorage-file` 경고가 발생한다.
  // descriptor의 value만 검사해 getter를 실행하지 않는다.
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  if (descriptor && "value" in descriptor && typeof descriptor.value?.clear === "function") {
    return;
  }
  const storage = memoryStorage();
  Object.defineProperty(globalThis, name, { configurable: true, value: storage });
  if (window !== globalThis) {
    Object.defineProperty(window, name, { configurable: true, value: storage });
  }
}

ensureStorage("localStorage");
ensureStorage("sessionStorage");
