/**
 * B6 텍스트·미디어 9종 — 시맨틱 위임(a/code/mark/img)·상태 훅·포맷 계약 고정.
 * AspectRatio는 신규 태그 없이 jd-aspect-ratio-box 별칭(R12)이라 여기 없다.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/link/index.js";
import "../src/components/image/index.js";
import "../src/components/icon/index.js";
import "../src/components/code/index.js";
import "../src/components/mark/index.js";
import "../src/components/highlight/index.js";
import "../src/components/scroll-area/index.js";
import "../src/components/number-formatter/index.js";
import "../src/components/motion/index.js";
import type { JdLink } from "../src/components/link/element.js";
import type { JdImage } from "../src/components/image/element.js";
import type { JdIcon } from "../src/components/icon/element.js";
import type { JdHighlight } from "../src/components/highlight/element.js";
import type { JdScrollArea } from "../src/components/scroll-area/element.js";
import type { JdNumberFormatter } from "../src/components/number-formatter/element.js";
import type { JdMotion } from "../src/components/motion/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-link", () => {
  test("children을 내부 <a>로 옮기고 href를 위임", async () => {
    document.body.innerHTML = `<jd-link href="/docs">문서 <b id="b">보기</b></jd-link>`;
    await tick();
    const el = document.querySelector<JdLink>("jd-link")!;
    const a = el.querySelector<HTMLAnchorElement>(":scope > a.jd-link")!;
    expect(a.getAttribute("href")).toBe("/docs");
    expect(a.querySelector("#b")).not.toBeNull();
    expect(el.isExternal).toBe(false);
    expect(a.hasAttribute("target")).toBe(false);
    expect(a.querySelector(".jd-link__external")).toBeNull();
  });

  test("http(s) href는 자동으로 외부 링크 — target/rel/아이콘", async () => {
    document.body.innerHTML = `<jd-link href="https://example.com">외부</jd-link>`;
    await tick();
    const el = document.querySelector<JdLink>("jd-link")!;
    const a = el.querySelector<HTMLAnchorElement>("a")!;
    expect(el.isExternal).toBe(true);
    expect(a.target).toBe("_blank");
    expect(a.rel).toBe("noopener noreferrer"); // 탭내빙 차단
    expect(a.querySelector(".jd-link__external")).not.toBeNull();
  });

  test("internal 플래그가 자동 판정을 이긴다 (v2 external={false} 대응)", async () => {
    document.body.innerHTML = `<jd-link href="https://example.com" internal>내부 취급</jd-link>`;
    await tick();
    const el = document.querySelector<JdLink>("jd-link")!;
    expect(el.isExternal).toBe(false);
    expect(el.querySelector("a")!.hasAttribute("target")).toBe(false);
    expect(el.querySelector(".jd-link__external")).toBeNull();
  });

  test("external 강제 시 아이콘이 붙고, 해제하면 사라진다", async () => {
    document.body.innerHTML = `<jd-link href="/a" external>강제</jd-link>`;
    await tick();
    const el = document.querySelector<JdLink>("jd-link")!;
    expect(el.querySelector(".jd-link__external")).not.toBeNull();
    el.external = false;
    await tick();
    expect(el.querySelector(".jd-link__external")).toBeNull();
    expect(el.querySelector("a")!.hasAttribute("target")).toBe(false);
  });

  test("명시 target/rel이 자동값보다 우선", async () => {
    document.body.innerHTML = `<jd-link href="https://x.com" target="_self" rel="nofollow">x</jd-link>`;
    await tick();
    const a = document.querySelector<JdLink>("jd-link")!.querySelector("a")!;
    expect(a.target).toBe("_self");
    expect(a.rel).toBe("nofollow");
  });
});

describe("jd-image", () => {
  test("src 있으면 loading 상태로 시작하고 load 이벤트에 loaded + jd-load", async () => {
    document.body.innerHTML = `<jd-image src="/a.png" alt="사진" ratio="16/9" radius="md"></jd-image>`;
    await tick();
    const el = document.querySelector<JdImage>("jd-image")!;
    const img = el.querySelector<HTMLImageElement>("img.jd-image__img")!;
    expect(el.status).toBe("loading");
    expect(el.getAttribute("status")).toBe("loading");
    expect(img.alt).toBe("사진");
    expect(el.style.aspectRatio.replace(/\s/g, "")).toBe("16/9"); // CSSOM은 "16 / 9"로 정규화

    const spy = vi.fn();
    el.addEventListener("jd-load", spy);
    img.dispatchEvent(new Event("load"));
    await tick();
    expect(el.status).toBe("loaded");
    expect(spy).toHaveBeenCalledOnce();
  });

  test("error는 jd-error + fallback 슬롯이 alt를 이름으로 갖는다", async () => {
    document.body.innerHTML = `<jd-image src="/x.png" alt="깨진 이미지"><span slot="fallback">?</span></jd-image>`;
    await tick();
    const el = document.querySelector<JdImage>("jd-image")!;
    const spy = vi.fn();
    el.addEventListener("jd-error", spy);
    el.querySelector("img")!.dispatchEvent(new Event("error"));
    await tick();
    expect(el.status).toBe("error");
    expect(spy).toHaveBeenCalledOnce();
    const fb = el.querySelector<HTMLElement>('[slot="fallback"]')!;
    expect(fb.getAttribute("role")).toBe("img");
    expect(fb.getAttribute("aria-label")).toBe("깨진 이미지");
  });

  test("src 없이 시작하면 즉시 error (v2 동형)", async () => {
    document.body.innerHTML = `<jd-image alt=""></jd-image>`;
    await tick();
    expect(document.querySelector<JdImage>("jd-image")!.status).toBe("error");
  });

  test("src 교체는 로딩을 재시작", async () => {
    document.body.innerHTML = `<jd-image src="/a.png"></jd-image>`;
    await tick();
    const el = document.querySelector<JdImage>("jd-image")!;
    el.querySelector("img")!.dispatchEvent(new Event("load"));
    await tick();
    expect(el.status).toBe("loaded");
    el.src = "/b.png";
    await tick();
    expect(el.status).toBe("loading");
    expect(el.querySelector("img")!.getAttribute("src")).toBe("/b.png");
  });
});

describe("jd-icon", () => {
  test("children을 내부 svg로 옮기고 size 토큰을 px로 — 라벨 없으면 장식", async () => {
    document.body.innerHTML = `<jd-icon size="lg"><path id="p" d="M0 0h4"></path></jd-icon>`;
    await tick();
    const el = document.querySelector<JdIcon>("jd-icon")!;
    const svg = el.querySelector("svg.jd-icon")!;
    expect(svg.getAttribute("width")).toBe("20");
    expect(svg.getAttribute("height")).toBe("20");
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    expect(svg.getAttribute("stroke")).toBe("currentColor");
    expect(svg.getAttribute("aria-hidden")).toBe("true");
    expect(svg.getAttribute("role")).toBe("presentation");
    // HTML로 쓴 <path>는 HTML 네임스페이스다 — SVG로 다시 만들지 않으면 그려지지 않는다
    const path = svg.querySelector("#p")!;
    expect(path).not.toBeNull();
    expect(path.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(path.getAttribute("d")).toBe("M0 0h4");
    expect(el.children).toHaveLength(1); // 원본 children은 남지 않는다
  });

  test("label이 있으면 role=img + aria-label, 수치 size는 px로 해석", async () => {
    document.body.innerHTML = `<jd-icon size="32" label="검색" color="red"><path d=""></path></jd-icon>`;
    await tick();
    const svg = document.querySelector<JdIcon>("jd-icon")!.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("32");
    expect(svg.getAttribute("role")).toBe("img");
    expect(svg.getAttribute("aria-label")).toBe("검색");
    expect(svg.hasAttribute("aria-hidden")).toBe(false);
    expect(svg.getAttribute("stroke")).toBe("red");
  });
});

describe("jd-code / jd-mark", () => {
  test("jd-code는 내부 <code>로 시맨틱 위임", async () => {
    document.body.innerHTML = `<jd-code variant="danger" size="sm">npm i</jd-code>`;
    await tick();
    const el = document.querySelector("jd-code")!;
    const code = el.querySelector(":scope > code.jd-code")!;
    expect(code.tagName).toBe("CODE");
    expect(code.textContent).toBe("npm i");
    expect(el.getAttribute("variant")).toBe("danger");
  });

  test("jd-mark는 내부 <mark> — AT가 강조로 읽는다", async () => {
    document.body.innerHTML = `<jd-mark color="blue">중요</jd-mark>`;
    await tick();
    const mark = document.querySelector("jd-mark")!.querySelector(":scope > mark.jd-mark")!;
    expect(mark.tagName).toBe("MARK");
    expect(mark.textContent).toBe("중요");
  });

  test("골격은 멱등 — 재연결해도 중첩되지 않는다", async () => {
    document.body.innerHTML = `<jd-code>x</jd-code>`;
    await tick();
    const el = document.querySelector("jd-code")!;
    el.remove();
    document.body.append(el);
    await tick();
    expect(el.querySelectorAll("code")).toHaveLength(1);
  });
});

describe("jd-highlight", () => {
  test("검색어 조각만 <mark>으로 감싼다 (대소문자 무시)", async () => {
    document.body.innerHTML = `<jd-highlight text="JunDS 디자인 시스템 디자인" query="디자인"></jd-highlight>`;
    await tick();
    const el = document.querySelector<JdHighlight>("jd-highlight")!;
    const marks = el.querySelectorAll("mark");
    expect(marks).toHaveLength(2);
    expect(marks[0]!.textContent).toBe("디자인");
    expect(el.textContent).toBe("JunDS 디자인 시스템 디자인"); // 본문 보존
  });

  test("query 없으면 본문 그대로 · query 변경은 재구축", async () => {
    document.body.innerHTML = `<jd-highlight text="abc ABC"></jd-highlight>`;
    await tick();
    const el = document.querySelector<JdHighlight>("jd-highlight")!;
    expect(el.querySelectorAll("mark")).toHaveLength(0);
    el.query = "abc";
    await tick();
    expect(el.querySelectorAll("mark")).toHaveLength(2); // 대소문자 무시
    expect(el.querySelectorAll("mark")[1]!.textContent).toBe("ABC"); // 원문 표기 유지
  });

  test("정규식 메타문자가 든 검색어도 리터럴로 처리", async () => {
    document.body.innerHTML = `<jd-highlight text="a+b 그리고 axb" query="a+b"></jd-highlight>`;
    await tick();
    const el = document.querySelector<JdHighlight>("jd-highlight")!;
    expect(el.querySelectorAll("mark")).toHaveLength(1);
    expect(el.querySelector("mark")!.textContent).toBe("a+b");
  });

  test("text 미지정이면 children 텍스트를 본문으로 흡수", async () => {
    document.body.innerHTML = `<jd-highlight query="시스템">디자인 시스템</jd-highlight>`;
    await tick();
    const el = document.querySelector<JdHighlight>("jd-highlight")!;
    expect(el.querySelector("mark")!.textContent).toBe("시스템");
    expect(el.textContent).toBe("디자인 시스템");
  });
});

describe("jd-scroll-area", () => {
  test("호스트 자체가 스크롤 컨테이너 — 골격 0, region + 탭 가능", async () => {
    document.body.innerHTML = `<jd-scroll-area max-height="300"><p id="c">긴 내용</p></jd-scroll-area>`;
    await tick();
    const el = document.querySelector<JdScrollArea>("jd-scroll-area")!;
    expect(el.getAttribute("role")).toBe("region");
    expect(el.tabIndex).toBe(0);
    expect(el.getAttribute("aria-label")).toBe("스크롤 영역");
    expect(el.style.maxHeight).toBe("300px"); // 수치는 px로 해석
    expect(el.children).toHaveLength(1); // children 그대로 — 래퍼 추가 없음
    expect(el.querySelector("#c")).not.toBeNull();
  });

  test("CSS 길이는 그대로 · label 재정의", async () => {
    document.body.innerHTML = `<jd-scroll-area max-height="50vh" label="로그" orientation="horizontal"></jd-scroll-area>`;
    await tick();
    const el = document.querySelector<JdScrollArea>("jd-scroll-area")!;
    expect(el.style.maxHeight).toBe("50vh");
    expect(el.getAttribute("aria-label")).toBe("로그");
  });
});

describe("jd-number-formatter", () => {
  test("format별 표기 — decimal/percent/compact/currency", async () => {
    document.body.innerHTML = `
      <jd-number-formatter id="d" value="1234567"></jd-number-formatter>
      <jd-number-formatter id="p" value="0.256" format="percent" decimals="1"></jd-number-formatter>
      <jd-number-formatter id="c" value="1234567" format="compact" locale="en-US"></jd-number-formatter>
      <jd-number-formatter id="w" value="1500" format="currency"></jd-number-formatter>`;
    await tick();
    expect(document.querySelector("#d")!.textContent).toBe("1,234,567");
    expect(document.querySelector("#p")!.textContent).toBe("25.6%");
    expect(document.querySelector("#c")!.textContent).toBe("1.2M");
    expect(document.querySelector("#w")!.textContent).toBe("₩1,500");
  });

  test("currency 자릿수는 Intl 통화 기본값 — JPY 0자리 (v2는 2자리 강제)", async () => {
    document.body.innerHTML = `<jd-number-formatter value="800" format="currency" currency="JPY" locale="en-US"></jd-number-formatter>`;
    await tick();
    expect(document.querySelector("jd-number-formatter")!.textContent).toBe("¥800");
  });

  test("prefix/suffix + 값 변경 반영", async () => {
    document.body.innerHTML = `<jd-number-formatter value="12" prefix="약 " suffix="개"></jd-number-formatter>`;
    await tick();
    const el = document.querySelector<JdNumberFormatter>("jd-number-formatter")!;
    expect(el.textContent).toBe("약 12개");
    expect(el.formatted).toBe("12");
    el.value = 3400;
    await tick();
    expect(el.textContent).toBe("약 3,400개");
  });
});

describe("jd-motion", () => {
  test("preset 반영 + delay는 인라인 animation-delay", async () => {
    document.body.innerHTML = `<jd-motion preset="fade-up" delay="120"><p>내용</p></jd-motion>`;
    await tick();
    const el = document.querySelector<JdMotion>("jd-motion")!;
    expect(el.getAttribute("preset")).toBe("fade-up");
    expect(el.style.animationDelay).toBe("120ms");
    expect(el.children).toHaveLength(1); // 래퍼 추가 없음
  });

  test("delay 0이면 인라인 스타일을 남기지 않는다", async () => {
    document.body.innerHTML = `<jd-motion></jd-motion>`;
    await tick();
    const el = document.querySelector<JdMotion>("jd-motion")!;
    expect(el.style.animationDelay).toBe("");
    expect(el.hasAttribute("force-motion")).toBe(false);
  });
});
