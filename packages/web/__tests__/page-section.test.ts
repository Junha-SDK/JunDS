/**
 * <jd-page>/<jd-page-header>/<jd-page-body> + <jd-section> — 페이지 셸 컴파운드.
 * light DOM 슬롯 분류(slot=breadcrumb)·본문 입양·gap 리다이렉트(v2 동형).
 */
import { beforeEach, describe, expect, test } from "vitest";
import "../src/components/page/index.js";
import "../src/components/section/index.js";
import { JdPage, JdPageHeader } from "../src/components/page/element.js";
import { JdSection } from "../src/components/section/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-page", () => {
  test("max-width 프리셋 반영 (기본 xl은 미반영 — base CSS 담당)", async () => {
    document.body.innerHTML = `<jd-page></jd-page>`;
    await tick();
    const el = document.querySelector<JdPage>("jd-page")!;
    expect(el.hasAttribute("max-width")).toBe(false);
    el.maxWidth = "sm";
    await tick();
    expect(el.getAttribute("max-width")).toBe("sm");
  });

  test("p 스타일 프롭이 인라인으로 기본 패딩을 덮는다", async () => {
    document.body.innerHTML = `<jd-page p="0"></jd-page>`;
    await tick();
    expect(document.querySelector<HTMLElement>("jd-page")!.style.getPropertyValue("padding")).toBe("0px");
  });
});

describe("jd-page-header", () => {
  test("title/description attribute → h1/p 렌더", async () => {
    document.body.innerHTML = `<jd-page-header title="대시보드" description="오늘의 요약"></jd-page-header>`;
    await tick();
    const el = document.querySelector<JdPageHeader>("jd-page-header")!;
    const h1 = el.querySelector(".jd-page-header__title")!;
    expect(h1.tagName).toBe("H1");
    expect(h1.textContent).toBe("대시보드");
    expect(el.querySelector(".jd-page-header__desc")!.textContent).toBe("오늘의 요약");
  });

  test("description 없으면 숨김", async () => {
    document.body.innerHTML = `<jd-page-header title="x"></jd-page-header>`;
    await tick();
    const desc = document.querySelector<HTMLElement>(".jd-page-header__desc")!;
    expect(desc.hidden).toBe(true);
  });

  test("children → actions, slot=breadcrumb → 브레드크럼 행 (light DOM 슬롯)", async () => {
    document.body.innerHTML =
      `<jd-page-header title="x"><nav slot="breadcrumb" id="bc">a / b</nav>` +
      `<button id="act">새로 만들기</button></jd-page-header>`;
    await tick();
    const el = document.querySelector<JdPageHeader>("jd-page-header")!;
    expect(el.querySelector(":scope > .jd-page-header__breadcrumb #bc")).not.toBeNull();
    expect(el.querySelector(".jd-page-header__actions #act")).not.toBeNull();
    expect(el.querySelector<HTMLElement>(".jd-page-header__actions")!.hidden).toBe(false);
  });

  test("actions 비면 숨김", async () => {
    document.body.innerHTML = `<jd-page-header title="x"></jd-page-header>`;
    await tick();
    expect(document.querySelector<HTMLElement>(".jd-page-header__actions")!.hidden).toBe(true);
  });

  test("title 프로퍼티 갱신", async () => {
    document.body.innerHTML = `<jd-page-header title="a"></jd-page-header>`;
    await tick();
    const el = document.querySelector<JdPageHeader>("jd-page-header")!;
    el.title = "b";
    await tick();
    expect(el.querySelector(".jd-page-header__title")!.textContent).toBe("b");
  });
});

describe("jd-section", () => {
  test("children → __body 이동, title/desc 헤더 렌더", async () => {
    document.body.innerHTML =
      `<jd-section title="설정" description="계정 옵션"><p id="c">내용</p></jd-section>`;
    await tick();
    const el = document.querySelector<JdSection>("jd-section")!;
    expect(el.querySelector(":scope > .jd-section__body #c")).not.toBeNull();
    const title = el.querySelector(".jd-section__title")!;
    expect(title.tagName).toBe("H2");
    expect(title.textContent).toBe("설정");
    expect(el.querySelector(".jd-section__desc")!.textContent).toBe("계정 옵션");
  });

  test("heading-level로 문서 구조에 맞는 제목 레벨을 선택", async () => {
    document.body.innerHTML = `<jd-section title="상세 설정" heading-level="3"></jd-section>`;
    await tick();
    const el = document.querySelector<JdSection>("jd-section")!;
    expect(el.querySelector(".jd-section__title")!.tagName).toBe("H3");

    el.headingLevel = 4;
    await tick();
    expect(el.querySelector(".jd-section__title")!.tagName).toBe("H4");
    expect(el.querySelector(".jd-section__title")!.textContent).toBe("상세 설정");
  });

  test("title/desc 없으면 헤더 숨김", async () => {
    document.body.innerHTML = `<jd-section><p>x</p></jd-section>`;
    await tick();
    expect(document.querySelector<HTMLElement>(".jd-section__header")!.hidden).toBe(true);
  });

  test("gap은 호스트가 아니라 본문 flex에 (v2 동형)", async () => {
    document.body.innerHTML = `<jd-section gap="lg"><p>x</p></jd-section>`;
    await tick();
    const el = document.querySelector<JdSection>("jd-section")!;
    expect(el.style.getPropertyValue("gap")).toBe("");
    expect(el.querySelector<HTMLElement>(".jd-section__body")!.style.getPropertyValue("gap"))
      .toBe("var(--jd-space-6)");
  });

  test("p는 호스트 패딩, border는 Boolean 반영 (스타일 프롭 border와 분리)", async () => {
    document.body.innerHTML = `<jd-section border p="6"><p>x</p></jd-section>`;
    await tick();
    const el = document.querySelector<JdSection>("jd-section")!;
    expect(el.border).toBe(true);
    expect(el.style.getPropertyValue("padding")).toBe("var(--jd-space-6)");
    expect(el.style.getPropertyValue("border")).toBe(""); // 스타일 프롭 경로는 skip
  });

  test("본문 골격 입양 — 프리렌더 마크업 재사용 (§3.3)", async () => {
    document.body.innerHTML =
      `<jd-section title="t"><div class="jd-section__header">` +
      `<h2 class="jd-section__title">t</h2><p class="jd-section__desc" hidden></p></div>` +
      `<div class="jd-section__body"><p id="c">유지</p></div></jd-section>`;
    await tick();
    const el = document.querySelector<JdSection>("jd-section")!;
    expect(el.querySelectorAll(".jd-section__body").length).toBe(1);
    expect(el.querySelector(".jd-section__body #c")).not.toBeNull();
  });
});
