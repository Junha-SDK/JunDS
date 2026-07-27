/**
 * 생성 어댑터 (DEC-044) — createJdElement 의 값 전달 세 경로가 계약대로인지.
 *
 * 손저작 3종과 달리 이 층은 골격을 만들지 않는다. 그래서 검증할 것은 딱 하나다:
 * **React 가 준 값이 CE 에 옳게 도착하는가.**
 *
 * 특히 Boolean 이 조용히 반대로 뒤집힐 수 있는 자리다. React 19 는 정의된 커스텀
 * 엘리먼트에서 이름이 인스턴스에 있으면 프로퍼티로 싣고, 없으면 attribute 로 싣는다.
 * 그래서 두 경로가 동시에 옳은 값 모양이어야 한다 — 그 계약을 여기서 못 박는다.
 */
import { describe, expect, test, vi } from "vitest";
import { createRef } from "react";
import { render } from "@testing-library/react";
import {
  Alert,
  Accordion,
  AnimatedCounter,
  NumberInput,
} from "../src/index.js";
import type { JdAccordion } from "@junds/web/accordion/element";
import { flushCE } from "./test-utils.js";

describe("스칼라 프롭 — 프로퍼티/attribute 어느 경로로 가든 값이 옳다", () => {
  test("String·Number 가 CE 표면에 원래 타입으로 도착한다", async () => {
    const { container } = render(<AnimatedCounter value={42} locale="ko-KR" />);
    const host = container.querySelector("jd-animated-counter")! as HTMLElement & {
      value: number;
      locale: string;
    };
    await flushCE();
    expect(host.value).toBe(42);
    expect(host.locale).toBe("ko-KR");
  });

  test("Boolean 거짓은 아예 넘기지 않는다 — 넘기면 존재=참 규칙에 걸린다(§1.3)", async () => {
    const { container, rerender } = render(<Alert dismissible={false} />);
    const host = container.querySelector("jd-alert")! as HTMLElement & {
      dismissible: boolean;
    };
    expect(host.hasAttribute("dismissible")).toBe(false);
    await flushCE();
    expect(host.dismissible).toBe(false);

    rerender(<Alert dismissible />);
    await flushCE();
    expect(host.dismissible).toBe(true);
  });

  test("undefined 는 넘기지 않는다 — 기본값을 CE 가 소유하게 둔다", async () => {
    const { container } = render(<Alert variant={undefined} />);
    const host = container.querySelector("jd-alert")! as HTMLElement & { variant: string };
    expect(host.hasAttribute("variant")).toBe(false);
    await flushCE();
    expect(host.variant).toBe("info"); // CE 기본값
  });

  test("스칼라 프롭을 제거하면 CE 기본값으로 돌아간다", async () => {
    const { container, rerender } = render(<Alert variant="danger" dismissible />);
    const host = container.querySelector("jd-alert")! as HTMLElement & {
      variant: string;
      dismissible: boolean;
    };
    await flushCE();
    expect(host.variant).toBe("danger");
    expect(host.dismissible).toBe(true);

    rerender(<Alert />);
    await flushCE();
    expect(host.variant).toBe("info");
    expect(host.dismissible).toBe(false);
  });

  test("NaN 같은 숫자 기본값도 JSON null로 변질시키지 않고 복원한다", async () => {
    const { container, rerender } = render(<NumberInput value={7} />);
    const host = container.querySelector("jd-number-input")! as HTMLElement & {
      value: number;
    };
    await flushCE();
    expect(host.value).toBe(7);

    rerender(<NumberInput />);
    await flushCE();
    expect(Number.isNaN(host.value)).toBe(true);
  });
});

describe("복합 데이터 → 프로퍼티", () => {
  test("배열은 속성이 아니라 프로퍼티로 들어간다", async () => {
    const items = [{ key: "a", title: "가", content: "내용" }];
    const { container } = render(<Accordion items={items} />);
    const host = container.querySelector("jd-accordion")! as HTMLElement & {
      items: unknown;
    };
    expect(host.hasAttribute("items")).toBe(false);
    expect(host.items).toEqual(items);
    await flushCE();
  });

  test("프롭을 제거하면 undefined가 아니라 대입 전 CE 기본값으로 복원한다", async () => {
    const items = [{ key: "a", title: "가", content: "내용" }];
    const { container, rerender } = render(
      <Accordion items={items} openKeys={["a"]} />,
    );
    const host = container.querySelector("jd-accordion")! as JdAccordion;
    await flushCE();
    expect(host.items).toEqual(items);
    expect(host.openKeys).toEqual(["a"]);

    rerender(<Accordion />);
    await flushCE();
    expect(host.items).toEqual([]);
    expect(host.openKeys).toEqual([]);
  });

  test("데이터 프롭 집합이 달라져도 effect 의존성 배열 크기 경고가 없다", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <Accordion items={[{ key: "a", title: "가" }]} />,
    );
    rerender(<Accordion items={[]} openKeys={["a"]} />);
    rerender(<Accordion openKeys={[]} />);
    await flushCE();
    expect(
      error.mock.calls.some((args) =>
        args.some((arg) => String(arg).includes("changed size between renders")),
      ),
    ).toBe(false);
    error.mockRestore();
  });
});

describe("이벤트 → addEventListener", () => {
  test("jd-* CustomEvent 가 onJd* 핸들러로 온다", async () => {
    const onDismiss = vi.fn();
    const { container } = render(<Alert dismissible onJdDismiss={onDismiss} />);
    const host = container.querySelector("jd-alert")!;
    await flushCE();
    host.dispatchEvent(new CustomEvent("jd-dismiss", { detail: { by: "test" } }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect((onDismiss.mock.calls[0][0] as CustomEvent).detail).toEqual({ by: "test" });
  });

  test("핸들러가 매 렌더 새 함수여도 재구독하지 않는다 — 최신 것이 불린다", async () => {
    const first = vi.fn();
    const second = vi.fn();
    const { container, rerender } = render(<Alert onJdDismiss={() => first()} />);
    const host = container.querySelector("jd-alert")!;
    await flushCE();
    const spy = vi.spyOn(host, "addEventListener");
    rerender(<Alert onJdDismiss={() => second()} />);
    await flushCE();
    expect(spy).not.toHaveBeenCalled(); // 이름 집합이 그대로면 구독은 그대로
    host.dispatchEvent(new CustomEvent("jd-dismiss"));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe("나머지 프롭은 React 소유", () => {
  test("className·id·data-*·ARIA·네이티브 이벤트는 손대지 않고 넘긴다", () => {
    const onClick = vi.fn();
    const { container } = render(
      <Alert
        className="my-alert"
        id="a1"
        data-testid="t"
        aria-label="알림"
        tabIndex={0}
        onClick={onClick}
      />,
    );
    const host = container.querySelector("jd-alert")!;
    expect(host.getAttribute("class")).toBe("my-alert");
    expect(host.id).toBe("a1");
    expect(host.getAttribute("data-testid")).toBe("t");
    expect(host.getAttribute("aria-label")).toBe("알림");
    expect((host as HTMLElement).tabIndex).toBe(0);
    host.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("ref 는 구체적인 Jd* 호스트 엘리먼트를 가리킨다", () => {
    const ref = createRef<JdAccordion>();
    const { container } = render(<Accordion ref={ref} />);
    expect(ref.current).toBe(container.querySelector("jd-accordion"));
    expect(typeof ref.current?.toggle).toBe("function");
  });
});
