/**
 * B3 — jd-slider(네이티브 range 위임) + jd-range-slider(듀얼 썸·키보드).
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import "../src/components/slider/index.js";
import "../src/components/range-slider/index.js";
import { JdSlider } from "../src/components/slider/element.js";
import { JdRangeSlider } from "../src/components/range-slider/element.js";

const tick = () => new Promise<void>((r) => queueMicrotask(() => queueMicrotask(r)));

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("jd-slider", () => {
  test("네이티브 range 위임 — min/max/step/value + 채움 % 변수", async () => {
    document.body.innerHTML = `<jd-slider value="30" min="0" max="100" step="5"></jd-slider>`;
    await tick();
    const el = document.querySelector<JdSlider>("jd-slider")!;
    const input = el.querySelector<HTMLInputElement>("input.jd-slider__input")!;
    expect(input.type).toBe("range");
    expect(input.min).toBe("0");
    expect(input.max).toBe("100");
    expect(input.step).toBe("5");
    expect(input.value).toBe("30");
    expect(el.style.getPropertyValue("--_jd-slider-pct")).toBe("30%");
  });

  test("input 이벤트 → jd-input + value 동기화 + % 갱신", async () => {
    document.body.innerHTML = `<jd-slider value="10"></jd-slider>`;
    await tick();
    const el = document.querySelector<JdSlider>("jd-slider")!;
    const input = el.querySelector<HTMLInputElement>("input")!;
    const spy = vi.fn();
    el.addEventListener("jd-input", spy);
    input.value = "60";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await tick();
    expect(el.value).toBe(60);
    expect(el.style.getPropertyValue("--_jd-slider-pct")).toBe("60%");
    expect((spy.mock.calls[0]![0] as CustomEvent).detail).toEqual({ value: 60 });
  });

  test("show-value → min/현재값/max 헤더 + formatValue 프로퍼티", async () => {
    document.body.innerHTML = `<jd-slider show-value value="50" max="200"></jd-slider>`;
    await tick();
    const el = document.querySelector<JdSlider>("jd-slider")!;
    const header = el.querySelector<HTMLElement>(".jd-slider__header")!;
    expect(header.hidden).toBe(false);
    expect(header.querySelector(".jd-slider__display")!.textContent).toBe("50");
    expect(header.querySelector(".jd-slider__max")!.textContent).toBe("200");
    el.formatValue = (v) => `${v}%`;
    el.value = 75;
    await tick();
    expect(header.querySelector(".jd-slider__display")!.textContent).toBe("75%");
  });

  test("marks JSON 슬롯 → 틱·라벨 + % 위치", async () => {
    document.body.innerHTML =
      `<jd-slider value="0"><script type="application/json">` +
      `[{"value":0,"label":"0%"},{"value":50,"label":"50%"},{"value":100}]</script></jd-slider>`;
    await tick();
    const el = document.querySelector<JdSlider>("jd-slider")!;
    const marks = el.querySelectorAll<HTMLElement>(".jd-slider__mark");
    expect(marks.length).toBe(3);
    expect(marks[1]!.style.getPropertyValue("left")).toBe("50%");
    expect(marks[1]!.querySelector(".jd-slider__mark-label")!.textContent).toBe("50%");
    expect(marks[2]!.querySelector(".jd-slider__mark-label")).toBeNull();
  });

  test("aria-label 폴백 + disabled 위임", async () => {
    document.body.innerHTML = `<jd-slider disabled></jd-slider>`;
    await tick();
    const input = document.querySelector<HTMLInputElement>("jd-slider input")!;
    expect(input.getAttribute("aria-label")).toBe("슬라이더");
    expect(input.disabled).toBe(true);
  });
});

describe("jd-range-slider", () => {
  test("듀얼 role=slider 썸 + aria 값 + 채움 위치", async () => {
    document.body.innerHTML = `<jd-range-slider min-value="20" max-value="80"></jd-range-slider>`;
    await tick();
    const el = document.querySelector<JdRangeSlider>("jd-range-slider")!;
    const thumbs = el.querySelectorAll<HTMLElement>(".jd-range-slider__thumb");
    expect(thumbs.length).toBe(2);
    expect(thumbs[0]!.getAttribute("role")).toBe("slider");
    expect(thumbs[0]!.getAttribute("aria-valuenow")).toBe("20");
    expect(thumbs[1]!.getAttribute("aria-valuenow")).toBe("80");
    expect(thumbs[0]!.style.left).toBe("20%");
    const fill = el.querySelector<HTMLElement>(".jd-range-slider__fill")!;
    expect(fill.style.left).toBe("20%");
    expect(fill.style.right).toBe("20%"); // 100-80
  });

  test("키보드 화살표 — step 증감 + 반대편 간격 클램프 + jd-change", async () => {
    document.body.innerHTML = `<jd-range-slider min-value="40" max-value="45" step="5"></jd-range-slider>`;
    await tick();
    const el = document.querySelector<JdRangeSlider>("jd-range-slider")!;
    const [minThumb] = el.querySelectorAll<HTMLElement>(".jd-range-slider__thumb");
    const spy = vi.fn();
    el.addEventListener("jd-change", spy);
    minThumb!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await tick();
    // 40+5=45지만 max(45)-step(5)=40으로 클램프 (v2 동형)
    expect(el.minValue).toBe(40);
    minThumb!.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    await tick();
    expect(el.minValue).toBe(35);
    expect(spy).toHaveBeenCalled();
  });

  test("show-values → 양끝 값 라벨", async () => {
    document.body.innerHTML = `<jd-range-slider show-values min-value="10" max-value="90"></jd-range-slider>`;
    await tick();
    const values = document.querySelector<HTMLElement>(".jd-range-slider__values")!;
    expect(values.hidden).toBe(false);
    expect(values.textContent).toBe("1090");
  });

  test("disabled — 썸 tabindex -1 + aria-disabled", async () => {
    document.body.innerHTML = `<jd-range-slider disabled></jd-range-slider>`;
    await tick();
    const thumb = document.querySelector<HTMLElement>(".jd-range-slider__thumb")!;
    expect(thumb.tabIndex).toBe(-1);
    expect(thumb.getAttribute("aria-disabled")).toBe("true");
  });
});
