import { beforeEach, describe, expect, test } from "vitest";
import { syncAriaIdRefs, syncOwnedAttribute } from "../src/core/aria.js";
import "../src/components/feature-grid/index.js";
import "../src/components/form-field/index.js";
import "../src/components/popover/index.js";
import "../src/components/tooltip/index.js";
import type { JdFeatureGrid } from "../src/components/feature-grid/element.js";
import type { JdFormField } from "../src/components/form-field/element.js";
import type { JdPopover } from "../src/components/popover/element.js";
import type { JdTooltip } from "../src/components/tooltip/element.js";

const tick = () => new Promise<void>((resolve) => queueMicrotask(() => queueMicrotask(resolve)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("ARIA 소유권 유틸리티", () => {
  test("소비자 IDREF와 JunDS IDREF를 병합하고 JunDS 값만 회수한다", () => {
    const input = document.createElement("input");
    input.setAttribute("aria-describedby", "consumer-help");

    syncAriaIdRefs(input, "aria-describedby", "junds-error");
    expect(input.getAttribute("aria-describedby")).toBe("consumer-help junds-error");

    input.setAttribute("aria-describedby", `${input.getAttribute("aria-describedby")} live-help`);
    syncAriaIdRefs(input, "aria-describedby", null);
    expect(input.getAttribute("aria-describedby")).toBe("consumer-help live-help");
  });

  test("상태가 끝나면 기존 속성을 복원하고 사용자 변경은 덮지 않는다", () => {
    const input = document.createElement("input");
    input.setAttribute("aria-invalid", "grammar");

    syncOwnedAttribute(input, "aria-invalid", "true");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    syncOwnedAttribute(input, "aria-invalid", null);
    expect(input.getAttribute("aria-invalid")).toBe("grammar");

    const region = document.createElement("section");
    region.setAttribute("role", "article");
    syncOwnedAttribute(region, "role", "region", {
      preserveExisting: true,
    });
    expect(region.getAttribute("role")).toBe("article");
  });
});

describe("소비자 DOM과 자동 ARIA 조합", () => {
  test("FormField는 기존 설명·상태를 보존하며 오류와 힌트를 전환한다", async () => {
    document.body.innerHTML =
      `<p id="consumer-help">직접 지정한 설명</p>` +
      `<jd-form-field error="필수입니다" required>` +
      `<input aria-describedby="consumer-help" aria-invalid="grammar" aria-required="false">` +
      `</jd-form-field>`;
    await tick();

    const field = document.querySelector<JdFormField>("jd-form-field")!;
    const input = field.querySelector("input")!;
    const errorId = field.querySelector(".jd-form-field__error")!.id;
    expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual(["consumer-help", errorId]);
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-required")).toBe("true");

    field.error = "";
    field.hint = "도움말";
    field.required = false;
    await field.updateComplete;
    const hintId = field.querySelector(".jd-form-field__hint")!.id;
    expect(input.getAttribute("aria-describedby")?.split(" ")).toEqual(["consumer-help", hintId]);
    expect(input.getAttribute("aria-invalid")).toBe("grammar");
    expect(input.getAttribute("aria-required")).toBe("false");
  });

  test("Tooltip은 기존 설명을 유지하고 열려 있는 동안만 자기 설명을 더한다", async () => {
    document.body.innerHTML =
      `<span id="consumer-tip">단축키 안내</span>` +
      `<jd-tooltip content="자세한 설명" open>` +
      `<button slot="trigger" aria-describedby="consumer-tip">도움말</button>` +
      `</jd-tooltip>`;
    await tick();

    const tooltip = document.querySelector<JdTooltip>("jd-tooltip")!;
    const button = tooltip.querySelector("button")!;
    const panelId = tooltip.querySelector(".jd-popover__panel")!.id;
    expect(button.getAttribute("aria-describedby")?.split(" ")).toEqual(["consumer-tip", panelId]);

    tooltip.open = false;
    await tooltip.updateComplete;
    expect(button.getAttribute("aria-describedby")).toBe("consumer-tip");
  });

  test("Popover가 분리되면 트리거의 원래 popup 속성을 복원한다", async () => {
    document.body.innerHTML =
      `<jd-popover open>` +
      `<button slot="trigger" aria-controls="consumer-menu" aria-expanded="mixed">열기</button>` +
      `<div slot="content">내용</div>` +
      `</jd-popover>`;
    await tick();

    const popover = document.querySelector<JdPopover>("jd-popover")!;
    const button = popover.querySelector("button")!;
    const panelId = popover.querySelector(".jd-popover__panel")!.id;
    expect(button.getAttribute("aria-controls")?.split(" ")).toEqual(["consumer-menu", panelId]);
    expect(button.getAttribute("aria-expanded")).toBe("true");

    popover.remove();
    expect(button.getAttribute("aria-controls")).toBe("consumer-menu");
    expect(button.getAttribute("aria-expanded")).toBe("mixed");
    expect(button.hasAttribute("aria-haspopup")).toBe(false);
  });

  test("자동 제목 관계를 해제해도 호스트의 사용자 role·label 관계를 보존한다", async () => {
    document.body.innerHTML =
      `<h2 id="consumer-title">사용자 이름</h2>` +
      `<jd-feature-grid title="기능" role="application" aria-labelledby="consumer-title"></jd-feature-grid>`;
    await tick();

    const grid = document.querySelector<JdFeatureGrid>("jd-feature-grid")!;
    const generatedId = grid.querySelector(".jd-feature-grid__title")!.id;
    expect(grid.getAttribute("aria-labelledby")?.split(" ")).toEqual([
      "consumer-title",
      generatedId,
    ]);
    expect(grid.getAttribute("role")).toBe("application");

    grid.title = "";
    await grid.updateComplete;
    expect(grid.getAttribute("aria-labelledby")).toBe("consumer-title");
    expect(grid.getAttribute("role")).toBe("application");
  });
});
