/**
 * B8~B12 Behavior — v2 훅 55종의 바닐라 대응 계약 고정.
 * 관찰자 공통 골격(구독/해제/destroy 멱등), 타이밍 유틸, 저장소, 입력, 폼, 데이터.
 */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createWatcher } from "../src/behaviors/subscribe.js";
import { resolveBreakpointValue, createMediaQueryWatcher } from "../src/behaviors/media.js";
import { createNetworkWatcher, createSizeObserver, createInViewObserver } from "../src/behaviors/viewport.js";
import {
  debounce,
  throttle,
  createInterval,
  createTimeout,
  createIdleWatcher,
  createRafLoop,
  createCountUp,
} from "../src/behaviors/timing.js";
import {
  on,
  createClickOutside,
  createHotkeys,
  createKeyHandler,
  normalizeChord,
  createLongPress,
  createHoverWatcher,
} from "../src/behaviors/input.js";
import { createStoredValue, getCookie, setCookie, removeCookie } from "../src/behaviors/storage.js";
import { lockScroll, setDocumentTitle, setFavicon, copyText, preloadImages } from "../src/behaviors/document.js";
import { createForm } from "../src/behaviors/form.js";
import { createResource, clearResourceCache, runMutation } from "../src/behaviors/data.js";

beforeEach(() => {
  document.body.innerHTML = "";
  clearResourceCache();
});

describe("createWatcher (관찰자 공통 골격)", () => {
  test("현재값·구독·개별 해제·destroy 멱등", () => {
    let push: ((v: number) => void) | null = null;
    const stop = vi.fn();
    const w = createWatcher(0, (set) => {
      push = set;
      return stop;
    });
    expect(w.get()).toBe(0);

    const a = vi.fn();
    const b = vi.fn();
    const offA = w.subscribe(a);
    w.subscribe(b);
    push!(1);
    expect(w.get()).toBe(1);
    expect(a).toHaveBeenCalledWith(1);
    expect(b).toHaveBeenCalledWith(1);

    offA();
    push!(2);
    expect(a).toHaveBeenCalledTimes(1); // 해제된 구독은 더 안 온다
    expect(b).toHaveBeenCalledTimes(2);

    w.destroy();
    w.destroy(); // 멱등
    expect(stop).toHaveBeenCalledTimes(1);
    push!(3);
    expect(w.get()).toBe(2); // destroy 후에는 값이 멈춘다
  });

  test("같은 값 재설정은 통지하지 않는다", () => {
    let push: ((v: string) => void) | null = null;
    const w = createWatcher("a", (set) => {
      push = set;
    });
    const fn = vi.fn();
    w.subscribe(fn);
    push!("a");
    expect(fn).not.toHaveBeenCalled();
    push!("b");
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe("media / viewport", () => {
  test("createMediaQueryWatcher는 matchMedia 부재 환경에서도 안전하다", () => {
    const w = createMediaQueryWatcher("(min-width: 1000px)");
    expect(typeof w.get()).toBe("boolean");
    expect(() => w.destroy()).not.toThrow();
  });

  test("resolveBreakpointValue는 현재 이하에서 가장 큰 정의값을 고른다", () => {
    const map = { base: "S", md: "M", xl: "XL" } as const;
    expect(resolveBreakpointValue(map, "sm")).toBe("S");
    expect(resolveBreakpointValue(map, "md")).toBe("M");
    expect(resolveBreakpointValue(map, "lg")).toBe("M"); // lg 정의 없음 → md
    expect(resolveBreakpointValue(map, "xl")).toBe("XL");
    expect(resolveBreakpointValue({}, "lg")).toBeUndefined();
  });

  test("createNetworkWatcher는 online/offline 전환을 잡는다", () => {
    const w = createNetworkWatcher();
    const fn = vi.fn();
    w.subscribe(fn);
    window.dispatchEvent(new Event("offline"));
    expect(w.get().online).toBe(false);
    expect(typeof w.get().since).toBe("number");
    window.dispatchEvent(new Event("online"));
    expect(w.get().online).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
    w.destroy();
    window.dispatchEvent(new Event("offline"));
    expect(fn).toHaveBeenCalledTimes(2); // 해제 후 무반응
  });

  test("Observer 부재 환경에서 no-op Behavior로 떨어진다 (호출부 분기 불필요)", () => {
    const el = document.createElement("div");
    const hasRO = typeof ResizeObserver !== "undefined";
    const hasIO = typeof IntersectionObserver !== "undefined";
    const size = createSizeObserver(el, () => {});
    const view = createInViewObserver(el, () => {});
    expect(() => {
      size.destroy();
      size.destroy();
      view.destroy();
    }).not.toThrow();
    // 환경에 따라 실제 관찰 여부만 달라지고 계약(destroy 멱등)은 같다
    expect(typeof hasRO).toBe("boolean");
    expect(typeof hasIO).toBe("boolean");
  });
});

describe("timing", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  test("debounce: 마지막 호출만 실행 + cancel", () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d("a");
    d("b");
    d("c");
    vi.advanceTimersByTime(99);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledExactlyOnceWith("c");

    d("d");
    d.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  test("throttle: 선행 즉시 실행 + 남은 간격 뒤 후행 1회", () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t("a");
    expect(fn).toHaveBeenCalledExactlyOnceWith("a"); // 선행
    t("b");
    t("c");
    expect(fn).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("c"); // 마지막 인자로 후행
  });

  test("createInterval / createTimeout: stop·restart·destroy 멱등", () => {
    const tick = vi.fn();
    const iv = createInterval(tick, 50);
    vi.advanceTimersByTime(160);
    expect(tick).toHaveBeenCalledTimes(3);
    iv.stop();
    vi.advanceTimersByTime(200);
    expect(tick).toHaveBeenCalledTimes(3);
    iv.restart();
    vi.advanceTimersByTime(50);
    expect(tick).toHaveBeenCalledTimes(4);
    iv.destroy();
    iv.destroy();

    const once = vi.fn();
    const to = createTimeout(once, 100);
    vi.advanceTimersByTime(99);
    to.restart(); // 리셋되어 처음부터
    vi.advanceTimersByTime(99);
    expect(once).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(once).toHaveBeenCalledOnce();
  });

  test("createIdleWatcher: 무활동이면 idle, 활동하면 해제", () => {
    const w = createIdleWatcher({ timeout: 1000 });
    const fn = vi.fn();
    w.subscribe(fn);
    expect(w.get()).toBe(false);

    vi.advanceTimersByTime(1000);
    expect(w.get()).toBe(true);
    expect(fn).toHaveBeenCalledWith(true);

    document.dispatchEvent(new Event("keydown"));
    expect(w.get()).toBe(false);
    vi.advanceTimersByTime(1000);
    expect(w.get()).toBe(true);

    w.destroy();
    document.dispatchEvent(new Event("keydown"));
    expect(w.get()).toBe(true); // 해제 후 무반응
  });
});

describe("timing (rAF)", () => {
  test("createRafLoop: start/stop, 중복 start 무해", async () => {
    const cb = vi.fn();
    const loop = createRafLoop(cb);
    loop.start();
    loop.start();
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const count = cb.mock.calls.length;
    expect(count).toBeGreaterThan(0);
    loop.stop();
    await new Promise<void>((r) => requestAnimationFrame(() => r()));
    expect(cb.mock.calls.length).toBeLessThanOrEqual(count + 1);
    loop.destroy();
  });

  test("createCountUp: 시작값을 즉시 쓰고 끝값으로 수렴", async () => {
    const el = document.createElement("span");
    const c = createCountUp(el, { start: 0, end: 10, duration: 10 });
    expect(el.textContent).toBe("0");
    await new Promise<void>((r) => setTimeout(r, 60));
    expect(el.textContent).toBe("10");
    c.destroy();
  });
});

describe("input", () => {
  test("on(): 해제 함수를 돌려준다", () => {
    const fn = vi.fn();
    const off = on(window, "resize", fn);
    window.dispatchEvent(new Event("resize"));
    expect(fn).toHaveBeenCalledOnce();
    off();
    window.dispatchEvent(new Event("resize"));
    expect(fn).toHaveBeenCalledOnce();
  });

  test("createClickOutside: 안쪽은 무시, 바깥은 통지", () => {
    document.body.innerHTML = `<div id="box"><button id="in">안</button></div><button id="out">밖</button>`;
    const box = document.querySelector("#box")!;
    const fn = vi.fn();
    const b = createClickOutside(box, fn);

    document.querySelector("#in")!.dispatchEvent(new Event("mousedown", { bubbles: true }));
    expect(fn).not.toHaveBeenCalled();
    document.querySelector("#out")!.dispatchEvent(new Event("mousedown", { bubbles: true }));
    expect(fn).toHaveBeenCalledOnce();

    b.destroy();
    document.querySelector("#out")!.dispatchEvent(new Event("mousedown", { bubbles: true }));
    expect(fn).toHaveBeenCalledOnce();
  });

  test("normalizeChord: 별칭·정렬 정규화", () => {
    expect(normalizeChord("Cmd+K")).toBe("k+meta");
    expect(normalizeChord("shift+ctrl+a")).toBe("a+ctrl+shift");
    expect(normalizeChord("Esc")).toBe("escape");
    expect(normalizeChord("option+x")).toBe("alt+x");
  });

  test("createHotkeys: 조합 일치 시 실행 + preventDefault, 입력 요소에서는 무시", () => {
    const fn = vi.fn();
    const b = createHotkeys({ "ctrl+k": fn });
    const press = (target: EventTarget) => {
      const e = new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true, cancelable: true });
      target.dispatchEvent(e);
      return e;
    };
    const e1 = press(document);
    expect(fn).toHaveBeenCalledOnce();
    expect(e1.defaultPrevented).toBe(true);

    document.body.innerHTML = `<input id="i">`;
    press(document.querySelector("#i")!);
    expect(fn).toHaveBeenCalledOnce(); // 입력 요소 안에서는 발동하지 않는다

    b.update({ "ctrl+j": fn });
    press(document);
    expect(fn).toHaveBeenCalledOnce(); // 맵이 교체됨
    b.destroy();
  });

  test("createHotkeys: key가 문자열이 아니어도 터지지 않는다 (IME·미디어 키)", () => {
    const fn = vi.fn();
    const b = createHotkeys({ a: fn });
    const e = new KeyboardEvent("keydown", { bubbles: true });
    Object.defineProperty(e, "key", { value: undefined });
    expect(() => document.dispatchEvent(e)).not.toThrow();
    expect(fn).not.toHaveBeenCalled();
    b.destroy();
  });

  test("createKeyHandler: 요소 스코프", () => {
    document.body.innerHTML = `<div id="box" tabindex="0"></div>`;
    const box = document.querySelector("#box")!;
    const fn = vi.fn();
    const b = createKeyHandler(box, { escape: fn });
    box.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(fn).toHaveBeenCalledOnce();
    b.destroy();
  });

  test("createLongPress: 임계 전 해제는 취소, 넘기면 실행", () => {
    vi.useFakeTimers();
    document.body.innerHTML = `<button id="b">길게</button>`;
    const el = document.querySelector("#b")!;
    const onLong = vi.fn();
    const onCancel = vi.fn();
    const b = createLongPress(el, onLong, { threshold: 500, onCancel });

    el.dispatchEvent(new Event("pointerdown"));
    vi.advanceTimersByTime(300);
    el.dispatchEvent(new Event("pointerup"));
    expect(onLong).not.toHaveBeenCalled();
    expect(onCancel).toHaveBeenCalledOnce();

    el.dispatchEvent(new Event("pointerdown"));
    vi.advanceTimersByTime(500);
    expect(onLong).toHaveBeenCalledOnce();
    b.destroy();
    vi.useRealTimers();
  });

  test("createHoverWatcher: enter/leave", () => {
    document.body.innerHTML = `<div id="h"></div>`;
    const el = document.querySelector("#h")!;
    const fn = vi.fn();
    const b = createHoverWatcher(el, fn);
    el.dispatchEvent(new Event("mouseenter"));
    el.dispatchEvent(new Event("mouseleave"));
    expect(fn.mock.calls).toEqual([[true], [false]]);
    b.destroy();
  });
});

describe("storage", () => {
  test("createStoredValue: 저장·복원·구독·remove", () => {
    localStorage.clear();
    const s = createStoredValue<number>("count", 0);
    expect(s.get()).toBe(0);
    const fn = vi.fn();
    s.subscribe(fn);
    s.set(5);
    expect(s.get()).toBe(5);
    expect(fn).toHaveBeenCalledWith(5);
    expect(JSON.parse(localStorage.getItem("count")!)).toBe(5);

    const again = createStoredValue<number>("count", 0);
    expect(again.get()).toBe(5); // 저장소에서 복원
    again.destroy();

    s.remove();
    expect(s.get()).toBe(0);
    expect(localStorage.getItem("count")).toBeNull();
    s.destroy();
  });

  test("손상된 JSON은 초기값으로 흡수한다", () => {
    localStorage.setItem("broken", "{not json");
    const s = createStoredValue("broken", "fallback");
    expect(s.get()).toBe("fallback");
    s.destroy();
  });

  test("session 저장소 변형", () => {
    sessionStorage.clear();
    const s = createStoredValue("k", "v", { storage: "session" });
    s.set("w");
    expect(JSON.parse(sessionStorage.getItem("k")!)).toBe("w");
    expect(localStorage.getItem("k")).toBeNull();
    s.destroy();
  });

  test("쿠키: set/get/remove + 이름 이스케이프", () => {
    setCookie("a.b", "hello world");
    expect(getCookie("a.b")).toBe("hello world");
    removeCookie("a.b");
    expect(getCookie("a.b")).toBeNull();
    expect(getCookie("없는쿠키")).toBeNull();
  });
});

describe("document 유틸", () => {
  test("lockScroll: 중첩 안전 — 마지막 해제에서만 복원", () => {
    document.body.style.overflow = "visible";
    const un1 = lockScroll();
    const un2 = lockScroll();
    expect(document.body.style.overflow).toBe("hidden");
    un1();
    expect(document.body.style.overflow).toBe("hidden"); // 아직 잠금 1개 남음
    un2();
    expect(document.body.style.overflow).toBe("visible");
    un2(); // 멱등 — 카운트를 더 내리지 않는다
    expect(document.body.style.overflow).toBe("visible");
  });

  test("setDocumentTitle / setFavicon은 복원 함수를 준다", () => {
    document.title = "원래";
    const restore = setDocumentTitle("새 제목");
    expect(document.title).toBe("새 제목");
    restore();
    expect(document.title).toBe("원래");

    const undo = setFavicon("/a.ico");
    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")!;
    expect(link.href).toContain("/a.ico");
    undo();
    expect(document.querySelector("link[rel~='icon']")).toBeNull(); // 우리가 만든 것은 제거
  });

  test("copyText: 성공/실패를 boolean으로 — 던지지 않는다", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
    await expect(copyText("x")).resolves.toBe(true);
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: vi.fn().mockRejectedValue(new Error("no")) } });
    await expect(copyText("x")).resolves.toBe(false);
    vi.unstubAllGlobals();
  });

  test("preloadImages: 성공·실패를 나눠 돌려준다", async () => {
    class FakeImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(v: string) {
        queueMicrotask(() => (v.includes("bad") ? this.onerror?.() : this.onload?.()));
      }
    }
    vi.stubGlobal("Image", FakeImage);
    const r = await preloadImages(["/a.png", "/bad.png", "/c.png"], 2);
    expect(r.loaded.sort()).toEqual(["/a.png", "/c.png"]);
    expect(r.failed).toEqual(["/bad.png"]);
    vi.unstubAllGlobals();
  });
});

describe("createForm", () => {
  const html = `<form id="f">
    <input name="email" value="">
    <input name="nick" value="ab">
    <button type="submit">보내기</button>
  </form>`;
  const rules = {
    email: { required: "이메일을 입력하세요", pattern: { value: /@/, message: "형식이 아닙니다" } },
    nick: { minLength: { value: 3, message: "3자 이상" } },
  };

  test("validate: 규칙 위반을 모아 aria-invalid로 표시", () => {
    document.body.innerHTML = html;
    const form = document.querySelector<HTMLFormElement>("#f")!;
    const f = createForm(form, rules);
    expect(f.validate()).toBe(false);
    expect(f.errors()).toEqual({ email: "이메일을 입력하세요", nick: "3자 이상" });
    expect(form.querySelector('[name="email"]')!.getAttribute("aria-invalid")).toBe("true");

    (form.querySelector('[name="email"]') as HTMLInputElement).value = "a@b.c";
    (form.querySelector('[name="nick"]') as HTMLInputElement).value = "junha";
    expect(f.validate()).toBe(true);
    expect(f.errors()).toEqual({});
    expect(form.querySelector('[name="email"]')!.hasAttribute("aria-invalid")).toBe(false);
    f.destroy();
  });

  test("values()는 FormData가 아니라 현재 DOM 값을 읽는다", () => {
    document.body.innerHTML = html;
    const form = document.querySelector<HTMLFormElement>("#f")!;
    const f = createForm(form, rules);
    (form.querySelector('[name="email"]') as HTMLInputElement).value = "x@y.z";
    expect(f.values()).toEqual({ email: "x@y.z", nick: "ab" });
    f.destroy();
  });

  test("제출: 유효하지 않으면 막고, 유효하면 onSubmit", () => {
    document.body.innerHTML = html;
    const form = document.querySelector<HTMLFormElement>("#f")!;
    const onSubmit = vi.fn();
    const f = createForm(form, rules, { onSubmit });

    const e1 = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(e1);
    expect(e1.defaultPrevented).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();

    (form.querySelector('[name="email"]') as HTMLInputElement).value = "a@b.c";
    (form.querySelector('[name="nick"]') as HTMLInputElement).value = "junha";
    const e2 = new Event("submit", { bubbles: true, cancelable: true });
    form.dispatchEvent(e2);
    expect(onSubmit).toHaveBeenCalledWith({ email: "a@b.c", nick: "junha" });
    f.destroy();
  });

  test("blur 검증 + reset", () => {
    document.body.innerHTML = html;
    const form = document.querySelector<HTMLFormElement>("#f")!;
    const f = createForm(form, rules);
    const email = form.querySelector<HTMLInputElement>('[name="email"]')!;
    email.dispatchEvent(new FocusEvent("blur"));
    expect(f.errors().email).toBe("이메일을 입력하세요");
    f.reset();
    expect(f.errors()).toEqual({});
    expect(email.hasAttribute("aria-invalid")).toBe(false);
    f.destroy();
  });
});

describe("data", () => {
  test("createResource: 캐시 공유 + in-flight 합류 + invalidate", async () => {
    const fetcher = vi.fn().mockResolvedValue({ n: 1 });
    const a = createResource("k1", fetcher);
    const b = createResource("k1", fetcher); // 같은 키 — 요청은 1회여야 한다
    await new Promise<void>((r) => setTimeout(r, 0));
    expect(fetcher).toHaveBeenCalledOnce();
    expect(a.read().data).toEqual({ n: 1 });
    expect(b.read().data).toEqual({ n: 1 });

    await a.invalidate();
    expect(fetcher).toHaveBeenCalledTimes(2);
    a.destroy();
    b.destroy();
  });

  test("createResource: 실패는 상태로 흡수하고 전역 rejection을 만들지 않는다", async () => {
    const r = createResource("k2", () => Promise.reject(new Error("boom")));
    await new Promise<void>((res) => setTimeout(res, 0));
    expect(r.read().error?.message).toBe("boom");
    expect(r.read().data).toBeUndefined();
    r.destroy();
  });

  test("runMutation: 성공/실패 콜백 + 던지지 않는다", async () => {
    const onSuccess = vi.fn();
    const onSettled = vi.fn();
    const ok = await runMutation(async () => 42, { onSuccess, onSettled });
    expect(ok).toEqual({ ok: true, data: 42 });
    expect(onSuccess).toHaveBeenCalledWith(42);

    const onError = vi.fn();
    const bad = await runMutation(async () => {
      throw new Error("nope");
    }, { onError, onSettled });
    expect(bad.ok).toBe(false);
    expect(onError).toHaveBeenCalledOnce();
    expect(onSettled).toHaveBeenCalledTimes(2);
  });
});
