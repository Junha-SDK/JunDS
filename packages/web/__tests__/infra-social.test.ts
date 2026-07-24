/**
 * B7 인프라·소셜 10종 — 노드 이동·live region·포커스 감금·토글 a11y 표면 고정.
 * primitives 51/51을 닫는 배치.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/portal/index.js";
import "../src/components/visually-hidden/index.js";
import "../src/components/announcer/index.js";
import "../src/components/focus-guard/index.js";
import "../src/components/error-boundary/index.js";
import "../src/components/like-button/index.js";
import "../src/components/bookmark-button/index.js";
import "../src/components/follow-button/index.js";
import "../src/components/mention-chip/index.js";
import "../src/components/hashtag/index.js";
import { announce } from "../src/components/announcer/element.js";
import type { JdPortal } from "../src/components/portal/element.js";
import type { JdAnnouncer } from "../src/components/announcer/element.js";
import type { JdFocusGuard } from "../src/components/focus-guard/element.js";
import type { JdErrorBoundary } from "../src/components/error-boundary/element.js";
import type { JdLikeButton } from "../src/components/like-button/element.js";
import type { JdBookmarkButton } from "../src/components/bookmark-button/element.js";
import type { JdFollowButton } from "../src/components/follow-button/element.js";
import type { JdHashtag } from "../src/components/hashtag/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-portal", () => {
  test("children을 document.body로 옮긴다", async () => {
    document.body.innerHTML = `<div id="host"><jd-portal><p id="c">내용</p></jd-portal></div>`;
    await tick();
    const el = document.querySelector<JdPortal>("jd-portal")!;
    const moved = document.querySelector("#c")!;
    expect(moved.parentElement).toBe(document.body);
    expect(el.children).toHaveLength(0);
  });

  test("to 셀렉터가 대상을 지정하고 jd-open을 발행", async () => {
    document.body.innerHTML = `<div id="target"></div>
      <jd-portal to="#target"><p id="c">내용</p></jd-portal>`;
    const spy = vi.fn();
    document.addEventListener("jd-open", spy);
    await tick();
    expect(document.querySelector("#c")!.parentElement!.id).toBe("target");
    expect(spy).toHaveBeenCalledOnce();
    document.removeEventListener("jd-open", spy);
  });

  test("disabled면 제자리에 남는다", async () => {
    document.body.innerHTML = `<jd-portal disabled><p id="c">내용</p></jd-portal>`;
    await tick();
    const el = document.querySelector<JdPortal>("jd-portal")!;
    expect(document.querySelector("#c")!.parentElement).toBe(el);
  });

  test("disconnect하면 옮긴 노드를 회수한다 — 고아 노드 금지", async () => {
    document.body.innerHTML = `<jd-portal><p id="c">내용</p></jd-portal>`;
    await tick();
    const el = document.querySelector<JdPortal>("jd-portal")!;
    expect(document.querySelector("#c")!.parentElement).toBe(document.body);
    el.remove();
    await tick();
    expect(el.querySelector("#c")).not.toBeNull(); // 호스트로 복귀
    expect(document.body.querySelector(":scope > #c")).toBeNull();
  });

  test("재연결(조상이 children을 옮기는 경우)에도 이동이 다시 적용된다", async () => {
    document.body.innerHTML = `<div id="target"></div><div id="a">
      <jd-portal to="#target"><p id="c">내용</p></jd-portal></div><div id="b"></div>`;
    await tick();
    expect(document.querySelector("#c")!.parentElement!.id).toBe("target");

    // 조상 CE가 골격을 만들며 자식을 옮기는 상황과 동형: disconnect → connect
    const el = document.querySelector<JdPortal>("jd-portal")!;
    document.querySelector("#b")!.append(el);
    await tick();
    expect(document.querySelector("#c")!.parentElement!.id).toBe("target"); // 다시 나갔다
  });

  test("container 프로퍼티가 셀렉터보다 우선", async () => {
    document.body.innerHTML = `<div id="a"></div><jd-portal to="#a"><p id="c">x</p></jd-portal>`;
    await tick();
    const el = document.querySelector<JdPortal>("jd-portal")!;
    const b = document.createElement("div");
    document.body.append(b);
    el.container = b;
    await tick();
    expect(document.querySelector("#c")!.parentElement).toBe(b);
  });
});

describe("jd-visually-hidden / jd-announcer", () => {
  test("jd-visually-hidden은 골격을 만들지 않는다 (CSS 전담)", async () => {
    document.body.innerHTML = `<jd-visually-hidden>정렬 기준</jd-visually-hidden>`;
    await tick();
    const el = document.querySelector("jd-visually-hidden")!;
    expect(el.children).toHaveLength(0);
    expect(el.textContent).toBe("정렬 기준"); // 접근성 트리에 남는다
  });

  test("live region 2종(polite/assertive) + announce가 문구를 채운다", async () => {
    document.body.innerHTML = `<jd-announcer></jd-announcer>`;
    await tick();
    const el = document.querySelector<JdAnnouncer>("jd-announcer")!;
    const polite = el.querySelector('[aria-live="polite"]')!;
    const assertive = el.querySelector('[aria-live="assertive"]')!;
    expect(polite.getAttribute("role")).toBe("status");
    expect(assertive.getAttribute("role")).toBe("alert");
    expect(polite.getAttribute("aria-atomic")).toBe("true");

    el.announce("저장되었습니다");
    await frame();
    expect(polite.textContent).toBe("저장되었습니다");
    expect(assertive.textContent).toBe("");

    el.announce("오류", "assertive");
    await frame();
    expect(assertive.textContent).toBe("오류");
  });

  test("모듈 announce()는 문서당 하나를 지연 생성해 재사용", async () => {
    expect(document.querySelector("jd-announcer")).toBeNull();
    announce("첫 공지");
    await tick();
    await frame();
    const els = document.querySelectorAll("jd-announcer");
    expect(els).toHaveLength(1);
    expect(els[0]!.querySelector('[aria-live="polite"]')!.textContent).toBe("첫 공지");

    announce("두 번째");
    await tick();
    await frame();
    expect(document.querySelectorAll("jd-announcer")).toHaveLength(1); // 재사용
  });
});

describe("jd-focus-guard", () => {
  const html = `<jd-focus-guard><button id="a">A</button><button id="b">B</button></jd-focus-guard>`;

  test("기본은 비활성 — 놓기만 해서는 포커스를 가두지 않는다", async () => {
    document.body.innerHTML = `<button id="out">밖</button>${html}`;
    await tick();
    const out = document.querySelector<HTMLButtonElement>("#out")!;
    out.focus();
    expect(document.activeElement).toBe(out); // 강탈 없음
  });

  test("active면 첫 focusable로 포커스를 옮기고 Tab을 순환시킨다", async () => {
    document.body.innerHTML = html;
    await tick();
    const el = document.querySelector<JdFocusGuard>("jd-focus-guard")!;
    el.active = true;
    await tick();
    expect(document.activeElement!.id).toBe("a");

    // 마지막에서 Tab → 첫 요소로 순환
    document.querySelector<HTMLButtonElement>("#b")!.focus();
    const e = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    document.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true);
    expect(document.activeElement!.id).toBe("a");
  });

  test("initial-focus 셀렉터가 최초 포커스를 지정", async () => {
    document.body.innerHTML = `<jd-focus-guard initial-focus="#b" active>
      <button id="a">A</button><button id="b">B</button></jd-focus-guard>`;
    await tick();
    expect(document.activeElement!.id).toBe("b");
  });

  test("재연결 후에도 감금이 살아 있다 (own한 트랩은 disconnect에서 파괴된다)", async () => {
    // 컨테이너 id는 트랩 안 버튼(#a/#b)과 겹치지 않게 둔다
    document.body.innerHTML = `<div id="box1">${html}</div><div id="box2"></div>`;
    await tick();
    const el = document.querySelector<JdFocusGuard>("jd-focus-guard")!;
    el.active = true;
    await tick();
    expect(document.activeElement!.id).toBe("a");

    document.querySelector("#box2")!.append(el); // 조상이 옮기는 상황
    await tick();
    document.querySelector<HTMLButtonElement>("#b")!.focus();
    const e = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    document.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(true); // 새 트랩이 여전히 가둔다
  });

  test("비활성으로 돌리면 감금이 풀린다", async () => {
    document.body.innerHTML = html;
    await tick();
    const el = document.querySelector<JdFocusGuard>("jd-focus-guard")!;
    el.active = true;
    await tick();
    el.active = false;
    await tick();
    document.querySelector<HTMLButtonElement>("#b")!.focus();
    const e = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    document.dispatchEvent(e);
    expect(e.defaultPrevented).toBe(false); // 더 이상 가로채지 않는다
  });
});

describe("jd-error-boundary", () => {
  test("기본은 정상 — fail()이 폴백 상태로, reset()이 되돌린다", async () => {
    document.body.innerHTML = `<jd-error-boundary><p id="c">본문</p></jd-error-boundary>`;
    await tick();
    const el = document.querySelector<JdErrorBoundary>("jd-error-boundary")!;
    expect(el.failed).toBe(false);
    const fallback = el.querySelector<HTMLElement>(".jd-error-boundary__fallback")!;
    expect(fallback.getAttribute("role")).toBe("alert");

    el.fail(new Error("서버 오류"));
    await tick();
    expect(el.failed).toBe(true);
    expect(el.hasAttribute("failed")).toBe(true);
    expect(el.querySelector(".jd-error-boundary__message")!.textContent).toBe("서버 오류");
    expect(el.querySelector("#c")).not.toBeNull(); // 노드는 지우지 않는다(CSS로 은닉)

    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    el.querySelector<HTMLButtonElement>(".jd-error-boundary__retry")!.click();
    await tick();
    expect(el.failed).toBe(false);
    expect(spy).toHaveBeenCalledOnce();
  });

  test("auto 없으면 자손 jd-error를 무시한다 (이미지 한 장 실패로 섹션을 지우지 않는다)", async () => {
    document.body.innerHTML = `<jd-error-boundary><span id="kid">x</span></jd-error-boundary>`;
    await tick();
    const el = document.querySelector<JdErrorBoundary>("jd-error-boundary")!;
    document.querySelector("#kid")!.dispatchEvent(
      new CustomEvent("jd-error", { bubbles: true, detail: { error: new Error("실패") } }),
    );
    await tick();
    expect(el.failed).toBe(false);
  });

  test("auto면 자손 jd-error를 포착한다", async () => {
    document.body.innerHTML = `<jd-error-boundary auto><span id="kid">x</span></jd-error-boundary>`;
    await tick();
    const el = document.querySelector<JdErrorBoundary>("jd-error-boundary")!;
    document.querySelector("#kid")!.dispatchEvent(
      new CustomEvent("jd-error", { bubbles: true, detail: { error: new Error("이미지 실패") } }),
    );
    await tick();
    expect(el.failed).toBe(true);
    expect(el.querySelector(".jd-error-boundary__message")!.textContent).toBe("이미지 실패");
  });

  test("제목·재시도 라벨을 프롭으로 바꾼다", async () => {
    document.body.innerHTML = `<jd-error-boundary heading="불러오지 못했습니다" retry-label="새로고침" failed></jd-error-boundary>`;
    await tick();
    const el = document.querySelector<JdErrorBoundary>("jd-error-boundary")!;
    expect(el.querySelector(".jd-error-boundary__heading")!.textContent).toBe("불러오지 못했습니다");
    expect(el.querySelector(".jd-error-boundary__retry")!.textContent).toBe("새로고침");
  });
});

describe("소셜 토글 3종", () => {
  test("jd-like-button: aria-pressed 토글 + count 증감 + jd-change", async () => {
    document.body.innerHTML = `<jd-like-button count="41"></jd-like-button>`;
    await tick();
    const el = document.querySelector<JdLikeButton>("jd-like-button")!;
    const btn = el.querySelector<HTMLButtonElement>("button")!;
    expect(btn.getAttribute("aria-pressed")).toBe("false");
    expect(btn.getAttribute("aria-label")).toBe("좋아요");
    expect(el.querySelector(".jd-like-button__count")!.textContent).toBe("41");

    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    btn.click();
    await tick();
    expect(el.liked).toBe(true);
    expect(el.count).toBe(42);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.getAttribute("aria-label")).toBe("좋아요 취소");
    expect(spy.mock.calls[0]![0].detail).toEqual({ liked: true, count: 42 });

    btn.click();
    await tick();
    expect(el.count).toBe(41); // 되돌림
  });

  test("jd-like-button: count 미지정이면 숫자를 표시하지 않는다", async () => {
    document.body.innerHTML = `<jd-like-button></jd-like-button>`;
    await tick();
    const el = document.querySelector<JdLikeButton>("jd-like-button")!;
    expect(el.querySelector<HTMLElement>(".jd-like-button__count")!.hidden).toBe(true);
    el.querySelector<HTMLButtonElement>("button")!.click();
    await tick();
    expect(Number.isNaN(el.count)).toBe(true); // 증감 없음
  });

  test("jd-bookmark-button: aria-pressed + size는 CSS 변수로", async () => {
    document.body.innerHTML = `<jd-bookmark-button size="24"></jd-bookmark-button>`;
    await tick();
    const el = document.querySelector<JdBookmarkButton>("jd-bookmark-button")!;
    const btn = el.querySelector<HTMLButtonElement>("button")!;
    expect(btn.getAttribute("aria-label")).toBe("북마크 추가");
    expect(el.style.getPropertyValue("--_jd-bookmark-size")).toBe("24px");
    btn.click();
    await tick();
    expect(el.bookmarked).toBe(true);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    expect(btn.getAttribute("aria-label")).toBe("북마크 해제");
  });

  test("jd-follow-button: 라벨 3종이 모두 DOM에 있고 접근 이름은 상태 기준", async () => {
    document.body.innerHTML = `<jd-follow-button></jd-follow-button>`;
    await tick();
    const el = document.querySelector<JdFollowButton>("jd-follow-button")!;
    const btn = el.querySelector<HTMLButtonElement>("button")!;
    expect(el.querySelector(".jd-follow-button__follow")!.textContent).toBe("팔로우");
    expect(el.querySelector(".jd-follow-button__following")!.textContent).toBe("팔로잉");
    expect(el.querySelector(".jd-follow-button__unfollow")!.textContent).toBe("언팔로우");
    expect(btn.getAttribute("aria-label")).toBe("팔로우");

    btn.click();
    await tick();
    expect(el.following).toBe(true);
    expect(btn.getAttribute("aria-pressed")).toBe("true");
    // 호버로 접근 이름이 흔들리지 않는다 — 상태 라벨 고정
    expect(btn.getAttribute("aria-label")).toBe("팔로잉");
  });
});

describe("jd-mention-chip / jd-hashtag", () => {
  test("멘션: @handle 기본 라벨 + 인증 마크 토글", async () => {
    document.body.innerHTML = `<jd-mention-chip handle="junha" href="/u/junha"></jd-mention-chip>`;
    await tick();
    const el = document.querySelector("jd-mention-chip")!;
    const a = el.querySelector<HTMLAnchorElement>("a")!;
    expect(a.getAttribute("href")).toBe("/u/junha");
    expect(el.querySelector(".jd-mention-chip__text")!.textContent).toBe("@junha");
    expect(el.querySelector<HTMLElement>(".jd-mention-chip__verified")!.hidden).toBe(true);

    el.setAttribute("verified", "");
    await tick();
    const mark = el.querySelector<HTMLElement>(".jd-mention-chip__verified")!;
    expect(mark.hidden).toBe(false);
    expect(mark.getAttribute("aria-label")).toBe("인증됨");
  });

  test("멘션: label이 있으면 @handle 대신 표시", async () => {
    document.body.innerHTML = `<jd-mention-chip handle="junha" label="준하"></jd-mention-chip>`;
    await tick();
    expect(document.querySelector(".jd-mention-chip__text")!.textContent).toBe("준하");
  });

  test("해시태그: #tag + count 축약(k/M) + trending", async () => {
    document.body.innerHTML = `
      <jd-hashtag tag="디자인시스템" count="3214" trending href="/t/x"></jd-hashtag>
      <jd-hashtag tag="a" count="1500000"></jd-hashtag>
      <jd-hashtag tag="b" count="999"></jd-hashtag>
      <jd-hashtag tag="c"></jd-hashtag>`;
    await tick();
    const [first, m, small, none] = Array.from(document.querySelectorAll<JdHashtag>("jd-hashtag"));
    expect(first!.querySelector(".jd-hashtag__text")!.textContent).toBe("#디자인시스템");
    expect(first!.querySelector(".jd-hashtag__count")!.textContent).toBe("(3.2k)");
    expect(first!.querySelector<HTMLElement>(".jd-hashtag__trending")!.hidden).toBe(false);
    expect(m!.querySelector(".jd-hashtag__count")!.textContent).toBe("(1.5M)");
    expect(small!.querySelector(".jd-hashtag__count")!.textContent).toBe("(999)");
    expect(none!.querySelector<HTMLElement>(".jd-hashtag__count")!.hidden).toBe(true);
    expect(none!.querySelector<HTMLElement>(".jd-hashtag__trending")!.hidden).toBe(true);
  });
});
