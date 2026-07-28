/**
 * B4 표시 프리미티브 9종 — badge/tag/avatar/spinner/kbd/key-cap/status-dot/
 * battery-indicator/severity-badge.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/badge/index.js";
import "../src/components/tag/index.js";
import "../src/components/avatar/index.js";
import "../src/components/spinner/index.js";
import "../src/components/kbd/index.js";
import "../src/components/key-cap/index.js";
import "../src/components/status-dot/index.js";
import "../src/components/battery-indicator/index.js";
import "../src/components/severity-badge/index.js";
import { JdBadge } from "../src/components/badge/element.js";
import { JdTag } from "../src/components/tag/element.js";
import { JdAvatar } from "../src/components/avatar/element.js";
import { JdBatteryIndicator } from "../src/components/battery-indicator/element.js";
import { JdStatusDot } from "../src/components/status-dot/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

test("B4 전 태그 정의", () => {
  for (const tag of [
    "jd-badge",
    "jd-tag",
    "jd-avatar",
    "jd-spinner",
    "jd-kbd",
    "jd-key-cap",
    "jd-status-dot",
    "jd-battery-indicator",
    "jd-severity-badge",
  ]) {
    expect(customElements.get(tag), tag).toBeDefined();
  }
});

describe("jd-badge", () => {
  test("텍스트 모드 — children 유지 + variant/dot 반영 (dot=::before, DOM 0)", async () => {
    document.body.innerHTML = `<jd-badge variant="success" dot>활성</jd-badge>`;
    await tick();
    const el = document.querySelector<JdBadge>("jd-badge")!;
    expect(el.textContent).toBe("활성");
    expect(el.childElementCount).toBe(0); // 점은 의사요소
    expect(el.variant).toBe("success");
  });

  test("count 모드 — maxCount 초과 시 N+ (v2 동형)", async () => {
    document.body.innerHTML = `<jd-badge count="150" max-count="99"></jd-badge>`;
    await tick();
    const el = document.querySelector<JdBadge>("jd-badge")!;
    expect(el.hasAttribute("data-count-mode")).toBe(true);
    expect(el.querySelector(".jd-badge__count")!.textContent).toBe("99+");
    el.count = 42;
    await tick();
    expect(el.querySelector(".jd-badge__count")!.textContent).toBe("42");
  });
});

describe("jd-tag", () => {
  test("closable → 닫기 버튼 + jd-remove 통지 (제거는 소비자 몫)", async () => {
    document.body.innerHTML = `<jd-tag color="red" closable>긴급</jd-tag>`;
    await tick();
    const el = document.querySelector<JdTag>("jd-tag")!;
    const close = el.querySelector<HTMLButtonElement>(".jd-tag__close")!;
    expect(close.getAttribute("aria-label")).toBe("삭제");
    const spy = vi.fn();
    el.addEventListener("jd-remove", spy);
    close.click();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(el.isConnected).toBe(true); // 스스로 제거하지 않음
    el.closable = false;
    await tick();
    expect(el.querySelector(".jd-tag__close")).toBeNull();
  });
});

describe("jd-avatar", () => {
  test("이름 → 이니셜 + 결정적 팔레트, src → 이미지 전환", async () => {
    document.body.innerHTML = `<jd-avatar name="김 준하"></jd-avatar>`;
    await tick();
    const el = document.querySelector<JdAvatar>("jd-avatar")!;
    const fb = el.querySelector<HTMLElement>(".jd-avatar__fallback")!;
    expect(fb.textContent).toBe("김준"); // 두 단어 → 각 첫 글자
    const palette = fb.getAttribute("data-palette");
    expect(palette).toBeTruthy();
    // 같은 이름 = 같은 팔레트 (결정적)
    document.body.innerHTML += `<jd-avatar id="b" name="김 준하"></jd-avatar>`;
    await tick();
    expect(document.querySelector("#b .jd-avatar__fallback")!.getAttribute("data-palette")).toBe(
      palette,
    );

    el.src = "/photo.jpg";
    await tick();
    expect(el.querySelector(".jd-avatar__fallback")).toBeNull();
    expect(el.querySelector<HTMLImageElement>("img.jd-avatar__img")!.alt).toBe("김 준하");
  });

  test("단일 단어 이름 → 앞 2글자, 무이름 → ?", async () => {
    document.body.innerHTML = `<jd-avatar name="junha"></jd-avatar><jd-avatar id="q"></jd-avatar>`;
    await tick();
    expect(document.querySelector(".jd-avatar__fallback")!.textContent).toBe("JU");
    expect(document.querySelector("#q .jd-avatar__fallback")!.textContent).toBe("?");
  });

  test("status 점 생성·제거", async () => {
    document.body.innerHTML = `<jd-avatar name="a" status="online"></jd-avatar>`;
    await tick();
    const el = document.querySelector<JdAvatar>("jd-avatar")!;
    expect(el.querySelector(".jd-avatar__status")).not.toBeNull();
    el.status = "";
    await tick();
    expect(el.querySelector(".jd-avatar__status")).toBeNull();
  });
});

describe("jd-spinner / jd-kbd / jd-key-cap", () => {
  test("spinner — role=status + aria-label + svg", async () => {
    document.body.innerHTML = `<jd-spinner label="불러오는 중"></jd-spinner>`;
    await tick();
    const el = document.querySelector("jd-spinner")!;
    expect(el.getAttribute("role")).toBe("status");
    expect(el.getAttribute("aria-label")).toBe("불러오는 중");
    expect(el.querySelector("svg.jd-spinner__svg")).not.toBeNull();
  });

  test("kbd — 내부 <kbd> + keys 공백 제거 결합 (v2 join 등가)", async () => {
    document.body.innerHTML = `<jd-kbd keys="⌘ K"></jd-kbd>`;
    await tick();
    const kbd = document.querySelector("jd-kbd kbd.jd-kbd")!;
    expect(kbd.textContent).toBe("⌘K");
  });

  test("kbd — keys 없으면 children 그대로", async () => {
    document.body.innerHTML = `<jd-kbd>Esc</jd-kbd>`;
    await tick();
    expect(document.querySelector("jd-kbd kbd")!.textContent).toBe("Esc");
  });

  test("key-cap — 내부 <kbd> + variant/pressed 반영", async () => {
    document.body.innerHTML = `<jd-key-cap variant="primary" pressed>↵</jd-key-cap>`;
    await tick();
    const el = document.querySelector("jd-key-cap")!;
    expect(el.querySelector("kbd.jd-key-cap")!.textContent).toBe("↵");
    expect(el.hasAttribute("pressed")).toBe(true);
  });
});

describe("jd-status-dot / jd-severity-badge / jd-battery-indicator", () => {
  test("status-dot — 라벨 생성·갱신·제거 (점은 ::before)", async () => {
    document.body.innerHTML = `<jd-status-dot status="success" label="온라인"></jd-status-dot>`;
    await tick();
    const el = document.querySelector<JdStatusDot>("jd-status-dot")!;
    expect(el.querySelector(".jd-status-dot__label")!.textContent).toBe("온라인");
    el.label = "";
    await tick();
    expect(el.querySelector(".jd-status-dot__label")).toBeNull();
  });

  test("severity-badge — severity/dot 반영 (CSS 전용 렌더)", async () => {
    document.body.innerHTML = `<jd-severity-badge severity="danger" dot>오류</jd-severity-badge>`;
    await tick();
    const el = document.querySelector("jd-severity-badge")!;
    expect(el.getAttribute("severity")).toBe("danger");
    expect(el.textContent).toBe("오류");
    expect(el.childElementCount).toBe(0);
  });

  test("battery — 채움 % 클램프 + auto-color 임계 (v2: >70 success, >30 warning)", async () => {
    document.body.innerHTML = `<jd-battery-indicator value="120" auto-color size="lg"></jd-battery-indicator>`;
    await tick();
    const el = document.querySelector<JdBatteryIndicator>("jd-battery-indicator")!;
    const fill = el.querySelector<HTMLElement>(".jd-battery__fill")!;
    expect(fill.style.width).toBe("100%");
    expect(el.getAttribute("data-fill")).toBe("success");
    expect(el.querySelector(".jd-battery__pct")!.textContent).toBe("100%");
    el.value = 50;
    await tick();
    expect(el.getAttribute("data-fill")).toBe("warning");
    el.value = 10;
    await tick();
    expect(el.getAttribute("data-fill")).toBe("danger");
    el.autoColor = false;
    el.color = "primary";
    await tick();
    expect(el.getAttribute("data-fill")).toBe("primary");
  });

  test("battery — label 프리펜드", async () => {
    document.body.innerHTML = `<jd-battery-indicator value="50" label="배터리"></jd-battery-indicator>`;
    await tick();
    const el = document.querySelector<JdBatteryIndicator>("jd-battery-indicator")!;
    expect(el.firstElementChild!.className).toBe("jd-battery__label");
    expect(el.firstElementChild!.textContent).toBe("배터리");
  });
});
