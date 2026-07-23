/**
 * 테스트 헬퍼 — 실 API 호출 금지(01-repo-structure §9 finance-data-test).
 * fetch/EventSource 를 여기 스텁으로 대체한다.
 */
import { vi } from "vitest";

/** JSON Response 생성 (node 22 내장 Response 사용). */
export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export function textResponse(body: string, status = 200): Response {
  return new Response(body, { status });
}

/** URL 부분 문자열 → 응답 팩토리 매핑으로 fetch 를 스텁. 매칭 순서는 삽입 순서. */
export function stubFetchByUrl(
  routes: Array<[match: string, respond: (url: string) => Response | Promise<Response>]>,
): ReturnType<typeof vi.fn> {
  const fn = vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    for (const [match, respond] of routes) {
      if (url.includes(match)) return respond(url);
    }
    throw new Error(`unstubbed fetch: ${url}`);
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

/** EventSource 스텁 — 생성 인스턴스를 기록하고 emit 으로 이벤트를 주입한다. */
export class FakeEventSource {
  static instances: FakeEventSource[] = [];
  static reset(): void {
    FakeEventSource.instances = [];
  }
  url: string;
  withCredentials: boolean;
  closed = false;
  private listeners = new Map<string, Set<(ev: MessageEvent) => void>>();

  constructor(url: string, opts?: { withCredentials?: boolean }) {
    this.url = url;
    this.withCredentials = opts?.withCredentials ?? false;
    FakeEventSource.instances.push(this);
  }

  addEventListener(type: string, cb: (ev: MessageEvent) => void): void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(cb);
  }

  close(): void {
    this.closed = true;
  }

  /** 서버가 SSE 이벤트를 보낸 것처럼 주입. data 는 JSON 직렬화된다. */
  emit(type: string, data: unknown): void {
    const set = this.listeners.get(type);
    if (!set) return;
    const ev = { data: typeof data === "string" ? data : JSON.stringify(data) } as MessageEvent;
    for (const cb of set) cb(ev);
  }
}

/** livePrices/liveIndices 가 클라 경로를 타도록 window + EventSource 를 스텁. */
export function stubBrowserGlobals(): void {
  FakeEventSource.reset();
  vi.stubGlobal("window", {});
  vi.stubGlobal("EventSource", FakeEventSource);
}
