/**
 * 전 컴포넌트 스모크 — 등록된 모든 CE가 **빈/기본 상태에서 크래시 없이** 업그레이드되고,
 * 골격을 만들고, 떼었다 붙여도 살아남는지를 한 번에 본다.
 *
 * 개별 테스트만으로는 "데이터를 주면 되지만 빈 상태에서 터지는" 부류를 놓친다 —
 * 브라우저에선 조용히 빈 요소가 된다. 그래서 모든 컴포넌트에 같은 시나리오를 돌리고,
 * 한 컴포넌트가 크래시해도 **나머지를 계속 검사**해 문제를 전량 수집한다.
 */
import { beforeAll, describe, expect, test } from "vitest";
import { ALL_COMPONENTS } from "../src/components.generated.js";
import { defineJunds } from "../src/define.js";

beforeAll(() => defineJunds());

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

/** 필수 children이 있는 것만 최소 마크업 부여 — 나머지는 빈 상태로 스트레스 */
const CHILDREN: Record<string, string> = {
  "jd-icon": '<path d="M0 0h4"></path>',
  "jd-portal": "<span>x</span>",
};

/**
 * happy-dom이 `HTMLTableSectionElement.rows`·`HTMLTableRowElement.cells` 등 테이블
 * 조작 API를 구현하지 않아 빈 상태에서 터지는 컴포넌트 — **실브라우저에선 에러 0으로
 * 렌더된다**(Chrome puppeteer로 확인). 컴포넌트 결함이 아니라 테스트 환경 갭이므로
 * happy-dom 스모크에서만 제외하고, 실제 검증은 e2e·demo가 맡는다.
 */
const HAPPY_DOM_TABLE_GAP = new Set(["jd-heatmap", "jd-diff-viewer"]);

const tags = ALL_COMPONENTS.map((C) => (C as unknown as { tag: string }).tag)
  .filter(Boolean)
  .filter((t) => !HAPPY_DOM_TABLE_GAP.has(t));

// render()는 queueMicrotask로 지연 실행돼 throw가 stress()의 try/catch 밖으로 샌다 —
// 전역 예외를 현재 검사 중인 태그에 귀속시켜 잡는다.
let asyncCrash = "";
const onErr = (e: unknown): void => {
  const msg =
    e instanceof Error
      ? e.message
      : (e as { reason?: { message?: string } })?.reason?.message ?? String(e);
  if (!asyncCrash) asyncCrash = msg;
};
process.on("uncaughtException", onErr);
process.on("unhandledRejection", onErr);

/** 한 태그를 전 시나리오로 굴린다. 던지면 사유 문자열, 통과면 null */
async function stress(tag: string): Promise<string | null> {
  asyncCrash = "";
  try {
    const el = document.createElement(tag);
    el.innerHTML = CHILDREN[tag] ?? "";
    document.body.append(el);
    await tick();
    if (asyncCrash) return `크래시: ${asyncCrash}`;
    // happy-dom은 :defined 의사클래스를 지원하지 않는다 — 인스턴스로 업그레이드를 확인
    const ctor = customElements.get(tag);
    if (!ctor || !(el instanceof ctor)) return "업그레이드 실패";
    el.setAttribute("data-smoke", "1");
    el.removeAttribute("data-smoke");
    await tick();
    const box = document.createElement("div");
    document.body.append(box);
    box.append(el); // 재부모화(조상 재구축과 동형)
    await tick();
    if (asyncCrash) return `크래시(재연결): ${asyncCrash}`;
    if (!el.isConnected) return "재연결 후 분리됨";
    el.remove();
    await tick();
    return asyncCrash ? `크래시(해제): ${asyncCrash}` : null;
  } catch (e) {
    return `크래시: ${(e as Error).message}`;
  }
}

describe("전 컴포넌트 스모크", () => {
  test("등록 태그 수 확인", () => {
    expect(tags.length).toBeGreaterThan(200);
    for (const t of tags) expect(customElements.get(t), `${t} 미등록`).toBeTruthy();
  });

  test("빈/기본 상태에서 크래시하는 컴포넌트 없음", async () => {
    document.body.innerHTML = "";
    const fails: Record<string, string> = {};
    for (const tag of tags) {
      const r = await stress(tag);
      if (r) fails[tag] = r;
      document.body.innerHTML = "";
    }
    if (Object.keys(fails).length) {
      console.error("스모크 실패:", JSON.stringify(fails, null, 1));
    }
    expect(fails).toEqual({});
  });
});
