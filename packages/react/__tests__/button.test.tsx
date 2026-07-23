/**
 * Button 어댑터 — v2 표면(variant/size/loading/leftIcon/rightIcon/fullWidth/asChild) →
 * <jd-button> 골격 렌더+입양(DEC-008-(1)), 네이티브 위임(클릭·폼 제출·disabled).
 */
import { describe, expect, test, vi } from "vitest";
import { createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button } from "../src/index.js";
import { flushCE } from "./test-utils.js";

describe("골격·입양 (DEC-008-(1))", () => {
  test("어댑터 골격을 CE가 입양한다 — 내부 button 노드 identity 유지·이중 구축 없음", async () => {
    const { container, rerender } = render(<Button>저장</Button>);
    const host = container.querySelector("jd-button")!;
    const before = host.querySelector(":scope > button.jd-button");
    expect(before).not.toBeNull();
    await flushCE(); // CE 최초 render(microtask) — 입양 경로
    expect(host.querySelector(":scope > button.jd-button")).toBe(before);
    expect(host.querySelectorAll("button").length).toBe(1);
    expect(before!.textContent).toBe("저장");

    rerender(<Button>저장됨</Button>);
    await flushCE();
    expect(host.querySelector(":scope > button.jd-button")).toBe(before); // 리렌더에도 동일 노드
    expect(before!.textContent).toBe("저장됨");
  });

  test("variant/size 기본값은 호스트 attribute 미반영, 비기본값만 반영 (DEC-012-2 동형)", async () => {
    const { container, rerender } = render(<Button>저장</Button>);
    await flushCE();
    const host = container.querySelector("jd-button")!;
    expect(host.hasAttribute("variant")).toBe(false);
    expect(host.hasAttribute("size")).toBe(false);

    rerender(<Button variant="danger" size="lg">저장</Button>);
    await flushCE();
    expect(host.getAttribute("variant")).toBe("danger");
    expect(host.getAttribute("size")).toBe("lg");
  });

  test("fullWidth → 호스트 full-width attribute (css 훅)", async () => {
    const { container } = render(<Button fullWidth>저장</Button>);
    await flushCE();
    expect(container.querySelector("jd-button")!.hasAttribute("full-width")).toBe(true);
  });
});

describe("loading — 스피너 합의 규약", () => {
  test("loading이면 스피너·aria-busy·disabled, CE는 어댑터 스피너를 재사용(이중 삽입 없음)", async () => {
    const { container } = render(<Button variant="danger" loading>삭제 중...</Button>);
    await flushCE();
    const btn = container.querySelector<HTMLButtonElement>("button.jd-button")!;
    expect(btn.disabled).toBe(true);
    expect(btn.getAttribute("aria-busy")).toBe("true");
    expect(btn.querySelectorAll(".jd-button__spinner").length).toBe(1);
  });

  test("loading 해제 — React 커밋(제거)이 CE update보다 앞서 충돌 없이 스피너가 사라진다", async () => {
    const { container, rerender } = render(<Button loading>저장</Button>);
    await flushCE();
    const btn = container.querySelector<HTMLButtonElement>("button.jd-button")!;
    expect(btn.querySelector(".jd-button__spinner")).not.toBeNull();

    rerender(<Button>저장</Button>);
    await flushCE();
    expect(btn.querySelector(".jd-button__spinner")).toBeNull();
    expect(btn.disabled).toBe(false);
    expect(btn.hasAttribute("aria-busy")).toBe(false);

    // 재진입도 안전(회귀): 다시 loading
    rerender(<Button loading>저장</Button>);
    await flushCE();
    expect(btn.querySelectorAll(".jd-button__spinner").length).toBe(1);
  });

  test("loading 중 leftIcon은 스피너로 대체, rightIcon은 숨김 (v2 동일)", async () => {
    const { container, rerender } = render(
      <Button leftIcon={<i data-testid="l" />} rightIcon={<i data-testid="r" />}>다음</Button>,
    );
    await flushCE();
    expect(screen.getByTestId("l")).toBeInTheDocument();
    expect(screen.getByTestId("r")).toBeInTheDocument();

    rerender(
      <Button loading leftIcon={<i data-testid="l" />} rightIcon={<i data-testid="r" />}>다음</Button>,
    );
    await flushCE();
    expect(screen.queryByTestId("l")).toBeNull();
    expect(screen.queryByTestId("r")).toBeNull();
    expect(container.querySelector(".jd-button__spinner")).not.toBeNull();
  });
});

describe("네이티브 위임 (§1.6-1) — v2 이벤트·폼 의미론", () => {
  test("onClick은 내부 <button>의 네이티브 클릭 그대로", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>저장</Button>);
    await flushCE();
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("disabled면 클릭 미발행 (네이티브 억제 공짜)", async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>저장</Button>);
    await flushCE();
    const btn = screen.getByRole("button") as HTMLButtonElement;
    btn.click(); // 프로그램적 click도 disabled가 억제
    expect(onClick).not.toHaveBeenCalled();
  });

  test("type 기본값은 v2/네이티브와 같은 submit — CE 기본(button)이 되돌리지 않는다", async () => {
    const { container } = render(<Button>제출</Button>);
    await flushCE(); // CE update()가 host.type을 내부 button에 다시 쓴 뒤에도
    expect(container.querySelector<HTMLButtonElement>("button.jd-button")!.type).toBe("submit");
  });

  test("type='button' 명시도 유지된다", async () => {
    const { container } = render(<Button type="button">동작</Button>);
    await flushCE();
    expect(container.querySelector<HTMLButtonElement>("button.jd-button")!.type).toBe("button");
  });

  test("className·data-*·ref는 v2와 동일하게 내부 <button>에 붙는다", async () => {
    const ref = createRef<HTMLButtonElement>();
    const { container } = render(
      <Button ref={ref} className="custom" data-track="save">저장</Button>,
    );
    await flushCE();
    const btn = container.querySelector<HTMLButtonElement>("button.jd-button")!;
    expect(btn.classList.contains("custom")).toBe(true);
    expect(btn.dataset["track"]).toBe("save");
    expect(ref.current).toBe(btn);
  });
});

describe("asChild — Slot 폴백 (CE 입양 불가 경로)", () => {
  test("자식 엘리먼트로 위임: jd-button 호스트·내부 button 없이 .jd-button 클래스 병합 + 경고", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <Button asChild leftIcon={<i data-testid="plus" />}>
        <a href="/new">새로 만들기</a>
      </Button>,
    );
    await flushCE();
    expect(container.querySelector("jd-button")).toBeNull();
    expect(container.querySelector("button")).toBeNull();
    const a = container.querySelector("a")!;
    expect(a.classList.contains("jd-button")).toBe(true);
    expect(a.getAttribute("href")).toBe("/new");
    expect(a.textContent).toContain("새로 만들기");
    expect(a.querySelector("[data-testid=plus]")).not.toBeNull(); // Slottable 합성 유지
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("asChild"));
    warn.mockRestore();
  });
});
