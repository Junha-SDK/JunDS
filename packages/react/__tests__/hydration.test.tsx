/**
 * DEC-008-(1) 실측 — SSR 마크업 위에서 "CE 업그레이드 → React hydration" 순서로
 * 골격 입양이 일어날 때의 마찰(hydration 경고·DOM 재구축·ref·상호작용)을 측정한다.
 *
 * 번들 순서상 어댑터는 @junds/web을 먼저 평가(정의)하므로, 실서비스에서 가능한
 * 순서는 "업그레이드 선행 → hydrate 후행"뿐이다(정의 지연 시나리오는 어댑터 경로에서
 * 발생 불가 — DECISIONS DEC-014 보고 참조).
 */
import { afterEach, describe, expect, test, vi } from "vitest";
import { act } from "react";
import { renderToString } from "react-dom/server";
import { hydrateRoot, type Root } from "react-dom/client";
import { Button, FormField, Input, TextField } from "../src/index.js";
import { rawTick } from "./test-utils.js";

let root: Root | null = null;
let container: HTMLDivElement | null = null;

afterEach(async () => {
  if (root) await act(async () => root!.unmount());
  root = null;
  container?.remove();
  container = null;
});

async function ssrThenUpgrade(ui: React.ReactElement): Promise<HTMLDivElement> {
  const html = renderToString(ui);
  container = document.createElement("div");
  document.body.append(container);
  container.innerHTML = html; // 파서 삽입 → CE 업그레이드 예약
  await rawTick(); // hydrate 전에 CE 최초 render(입양)가 끝난 상태를 만든다
  return container;
}

describe("Button — SSR → 업그레이드 → hydrate", () => {
  test("입양 골격이 hydration을 관통해 동일 노드로 유지되고, 콘솔 경고/에러 0", async () => {
    const ui = (
      <Button variant="danger" loading>
        삭제 중...
      </Button>
    );
    const c = await ssrThenUpgrade(ui);
    const before = c.querySelector("button.jd-button");
    expect(before).not.toBeNull();
    expect(c.querySelectorAll(".jd-button__spinner").length).toBe(1); // CE가 SSR 스피너 재사용

    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await act(async () => {
      root = hydrateRoot(c, ui);
    });
    await act(rawTick);

    expect(c.querySelector("button.jd-button")).toBe(before); // 재구축 없음
    expect(c.querySelectorAll("button").length).toBe(1);
    expect(c.querySelectorAll(".jd-button__spinner").length).toBe(1);
    expect(error).not.toHaveBeenCalled(); // hydration mismatch 없음
    expect(warn).not.toHaveBeenCalled();
    error.mockRestore();
    warn.mockRestore();
  });

  test("hydrate 후 상호작용·ref가 살아 있다", async () => {
    const onClick = vi.fn();
    const ref = { current: null as HTMLButtonElement | null };
    const ui = (
      <Button ref={(n) => void (ref.current = n)} onClick={onClick}>
        저장
      </Button>
    );
    const c = await ssrThenUpgrade(ui);
    await act(async () => {
      root = hydrateRoot(c, ui);
    });
    await act(rawTick);
    const btn = c.querySelector<HTMLButtonElement>("button.jd-button")!;
    expect(ref.current).toBe(btn);
    btn.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("TextField — dSIH 골격의 hydration 정합", () => {
  test("라벨·에러(dSIH)·aria가 경고 없이 hydrate되고 입양 노드가 유지된다", async () => {
    const ui = (
      <FormField label="이름" required error="이름을 입력해주세요">
        <Input id="name" error />
      </FormField>
    );
    const c = await ssrThenUpgrade(ui);
    const input = c.querySelector("input");
    expect(input).not.toBeNull();

    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      root = hydrateRoot(c, ui);
    });
    await act(rawTick);

    expect(c.querySelector("input")).toBe(input);
    expect(c.querySelector("label")!.textContent).toBe("이름");
    expect(c.querySelector("p.jd-text-field__error")!.textContent).toContain("이름을 입력해주세요");
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  test("controlled value — 서버 직렬화 값이 hydrate·CE update를 관통해 유지된다", async () => {
    const ui = <TextField value="서버값" onChange={() => {}} />;
    const c = await ssrThenUpgrade(ui);
    // 회귀: 호스트 value attribute가 없으면 CE 최초 update()가 hydration 전에
    // 서버 값을 ""로 지우는 플래시가 생긴다 — 업그레이드 직후에도 값이 살아 있어야 한다
    expect(c.querySelector("input")!.value).toBe("서버값");
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      root = hydrateRoot(c, ui);
    });
    await act(rawTick);
    expect(c.querySelector("input")!.value).toBe("서버값");
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });
});
