/**
 * <jd-divider> — 구분선 단일 정본 (R12 선점). role/aria·라벨 골격·색/여백 반영.
 */
import { beforeEach, describe, expect, test } from "vitest";
import "../src/components/divider/index.js";
import { JdDivider } from "../src/components/divider/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

async function mount(html: string): Promise<JdDivider> {
  document.body.innerHTML = html;
  await tick();
  return document.querySelector<JdDivider>("jd-divider")!;
}

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-divider", () => {
  test("role=separator, 가로 기본(orientation 디폴트 미반영)", async () => {
    const el = await mount(`<jd-divider></jd-divider>`);
    expect(el.getAttribute("role")).toBe("separator");
    expect(el.hasAttribute("aria-orientation")).toBe(false);
    expect(el.childElementCount).toBe(0); // 무라벨 = 골격 없음
  });

  test("세로 → aria-orientation=vertical, 복귀 시 제거", async () => {
    const el = await mount(`<jd-divider orientation="vertical"></jd-divider>`);
    expect(el.getAttribute("aria-orientation")).toBe("vertical");
    el.orientation = "horizontal";
    await tick();
    expect(el.hasAttribute("aria-orientation")).toBe(false);
  });

  test("label → 라인·라벨·라인 3분할 골격 구축", async () => {
    const el = await mount(`<jd-divider label="또는"></jd-divider>`);
    expect(el.querySelectorAll(":scope > .jd-divider__line").length).toBe(2);
    expect(el.querySelector(":scope > .jd-divider__label")!.textContent).toBe("또는");
  });

  test("label 갱신·해제 — 텍스트 갱신 후 골격 해체", async () => {
    const el = await mount(`<jd-divider label="또는"></jd-divider>`);
    el.label = "OR";
    await tick();
    expect(el.querySelector(".jd-divider__label")!.textContent).toBe("OR");
    el.label = "";
    await tick();
    expect(el.childElementCount).toBe(0);
  });

  test("color — 무라벨은 호스트 배경, 라벨 모드는 라인 배경 (v2 동형)", async () => {
    const el = await mount(`<jd-divider color="danger"></jd-divider>`);
    expect(el.style.getPropertyValue("background-color")).toBe("var(--jd-color-danger)");
    el.label = "구간";
    await tick();
    expect(el.style.getPropertyValue("background-color")).toBe("");
    for (const line of el.querySelectorAll<HTMLElement>(".jd-divider__line")) {
      expect(line.style.getPropertyValue("background-color")).toBe("var(--jd-color-danger)");
    }
  });

  test("my/mx — margin-block/inline 인라인 반영 (기본 여백은 base CSS)", async () => {
    const el = await mount(`<jd-divider my="8" mx="2"></jd-divider>`);
    expect(el.style.getPropertyValue("margin-block")).toBe("var(--jd-space-8)");
    expect(el.style.getPropertyValue("margin-inline")).toBe("var(--jd-space-2)");
    el.my = "";
    await tick();
    expect(el.style.getPropertyValue("margin-block")).toBe("");
  });

  test("라벨 골격 입양 — 프리렌더 마크업 재사용 (§3.3)", async () => {
    document.body.innerHTML =
      `<jd-divider label="또는"><div class="jd-divider__line"></div>` +
      `<span class="jd-divider__label">또는</span><div class="jd-divider__line"></div></jd-divider>`;
    await tick();
    const el = document.querySelector<JdDivider>("jd-divider")!;
    expect(el.querySelectorAll(".jd-divider__line").length).toBe(2);
    expect(el.querySelectorAll(".jd-divider__label").length).toBe(1);
  });
});
