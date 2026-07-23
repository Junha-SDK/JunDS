/**
 * <jd-app-shell> — 슬롯 분류·Ctrl+B·모바일 드로어·스크롤 락·폭 CSS 변수.
 * 모바일 판정(matchMedia)은 happy-dom에서 신뢰할 수 없어 [data-mobile]을 직접
 * 조작해 상태 전환 경로를 검증한다(실브라우저 확인은 데모 puppeteer 몫).
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/app-shell/index.js";
import { JdAppShell } from "../src/components/app-shell/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

const FULL = `
<jd-app-shell>
  <nav slot="sidebar" id="sb">사이드바</nav>
  <div slot="header" id="hd">헤더</div>
  <div slot="footer" id="ft">푸터</div>
  <p id="body-content">본문</p>
</jd-app-shell>`;

async function mount(html = FULL): Promise<JdAppShell> {
  document.body.innerHTML = html;
  await tick();
  return document.querySelector<JdAppShell>("jd-app-shell")!;
}

beforeEach(() => {
  document.body.innerHTML = "";
  document.body.style.overflow = "";
});

describe("골격·슬롯 분류", () => {
  test("sidebar/header/footer 슬롯 + 나머지 → 본문", async () => {
    const el = await mount();
    expect(el.querySelector(":scope > .jd-app-shell__sidebar #sb")).not.toBeNull();
    expect(el.querySelector(".jd-app-shell__header #hd")).not.toBeNull();
    expect(el.querySelector(".jd-app-shell__footer #ft")).not.toBeNull();
    expect(el.querySelector(".jd-app-shell__content #body-content")).not.toBeNull();
    expect(el.querySelector(".jd-app-shell__content")!.tagName).toBe("MAIN");
    expect(el.querySelector(":scope > .jd-app-shell__backdrop")).not.toBeNull();
    expect(el.querySelector(".jd-app-shell__menu")).not.toBeNull(); // 사이드바+헤더 → 메뉴 버튼
  });

  test("sidebar 슬롯 없으면 aside/backdrop/menu 미생성 (v2 조건부 동형)", async () => {
    const el = await mount(`<jd-app-shell><div slot="header">h</div><p>b</p></jd-app-shell>`);
    expect(el.querySelector(".jd-app-shell__sidebar")).toBeNull();
    expect(el.querySelector(".jd-app-shell__backdrop")).toBeNull();
    expect(el.querySelector(".jd-app-shell__menu")).toBeNull();
  });

  test("골격 입양 — 재렌더 시 재구축 없음 (§3.3)", async () => {
    const el = await mount();
    const main = el.querySelector(".jd-app-shell__main")!;
    el.remove();
    document.body.append(el);
    await tick();
    expect(el.querySelector(".jd-app-shell__main")).toBe(main);
    expect(el.querySelectorAll(".jd-app-shell__main").length).toBe(1);
  });
});

describe("폭 CSS 변수·본문 패딩", () => {
  test("기본 260px 레일, sidebar-collapsed → collapsed-width", async () => {
    const el = await mount();
    expect(el.style.getPropertyValue("--_jd-shell-rail")).toBe("260px");
    el.sidebarCollapsed = true;
    await tick();
    expect(el.style.getPropertyValue("--_jd-shell-rail")).toBe("64px");
    expect(el.hasAttribute("sidebar-collapsed")).toBe(true);
  });

  test("sidebar-width/collapsed-width attribute 반영", async () => {
    const el = await mount(
      `<jd-app-shell sidebar-width="300" collapsed-width="80" sidebar-collapsed>` +
      `<nav slot="sidebar">s</nav><p>b</p></jd-app-shell>`,
    );
    expect(el.style.getPropertyValue("--_jd-shell-rail")).toBe("80px");
    expect(el.style.getPropertyValue("--_jd-shell-drawer")).toBe("300px");
  });

  test("content-padding → 본문 인라인", async () => {
    const el = await mount(`<jd-app-shell content-padding="6"><p>b</p></jd-app-shell>`);
    expect(el.querySelector<HTMLElement>(".jd-app-shell__content")!.style.getPropertyValue("padding"))
      .toBe("var(--jd-space-6)");
  });
});

describe("Ctrl/Cmd+B 토글", () => {
  test("데스크톱: sidebar-collapsed 토글 + jd-sidebar-toggle 사후 통지", async () => {
    const el = await mount();
    const spy = vi.fn();
    el.addEventListener("jd-sidebar-toggle", spy);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true, cancelable: true }));
    await tick();
    expect(el.sidebarCollapsed).toBe(true);
    expect(spy).toHaveBeenCalledTimes(1);
    expect((spy.mock.calls[0]![0] as CustomEvent).detail).toEqual({ collapsed: true });
  });

  test("defaultPrevented 단축키는 존중 (⌘K 이중 토글 선례)", async () => {
    const el = await mount();
    const ev = new KeyboardEvent("keydown", { key: "b", metaKey: true, cancelable: true });
    ev.preventDefault();
    document.dispatchEvent(ev);
    await tick();
    expect(el.sidebarCollapsed).toBe(false);
  });

  test("모바일([data-mobile]): 드로어 토글, 이벤트 없음", async () => {
    const el = await mount();
    el.setAttribute("data-mobile", "");
    const spy = vi.fn();
    el.addEventListener("jd-sidebar-toggle", spy);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "b", ctrlKey: true, cancelable: true }));
    await tick();
    expect(el.mobileOpen).toBe(true);
    expect(spy).not.toHaveBeenCalled();
  });
});

describe("모바일 드로어·스크롤 락", () => {
  test("메뉴 클릭 → 열림, 백드롭 클릭 → 닫힘", async () => {
    const el = await mount();
    el.setAttribute("data-mobile", "");
    el.querySelector<HTMLButtonElement>(".jd-app-shell__menu")!.click();
    await tick();
    expect(el.mobileOpen).toBe(true);
    el.querySelector<HTMLElement>(".jd-app-shell__backdrop")!.click();
    await tick();
    expect(el.mobileOpen).toBe(false);
  });

  test("드로어 열림 동안 body 스크롤 락 + 해제 복원 (v2 동형)", async () => {
    const el = await mount();
    el.setAttribute("data-mobile", "");
    el.mobileOpen = true;
    await tick();
    expect(document.body.style.overflow).toBe("hidden");
    el.mobileOpen = false;
    await tick();
    expect(document.body.style.overflow).toBe("");
  });

  test("disconnect 시 스크롤 락 회수", async () => {
    const el = await mount();
    el.setAttribute("data-mobile", "");
    el.mobileOpen = true;
    await tick();
    expect(document.body.style.overflow).toBe("hidden");
    el.remove();
    expect(document.body.style.overflow).toBe("");
  });

  test("메뉴 버튼 a11y 이름", async () => {
    const el = await mount();
    expect(el.querySelector(".jd-app-shell__menu")!.getAttribute("aria-label")).toBe("사이드바 열기");
  });
});
