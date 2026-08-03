/**
 * TextField/Input/FormField 어댑터 — 슬롯 포함 골격 입양, controlled/uncontrolled 방어,
 * FormField 폴드(라벨·에러·aria 자동 연결), CE의 children 재구축과의 공존(dSIH).
 */
import { describe, expect, test, vi } from "vitest";
import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { FormField, Input, TextField } from "../src/index.js";
import { flushCE } from "./test-utils.js";

describe("골격·입양", () => {
  test("label/control(start/input/end)/error 골격을 항상 렌더해 CE가 그대로 입양한다", async () => {
    const { container } = render(<TextField placeholder="이름 입력" />);
    await flushCE();
    const host = container.querySelector("jd-text-field")!;
    const input = host.querySelector<HTMLInputElement>(
      ":scope > .jd-text-field__control > input.jd-text-field__input",
    )!;
    expect(host.querySelector(":scope > label.jd-text-field__label")).not.toBeNull();
    expect(host.querySelector(":scope > p.jd-text-field__error")).not.toBeNull();
    expect(
      host.querySelector(":scope > .jd-text-field__control > .jd-text-field__slot--start"),
    ).not.toBeNull();
    expect(
      host.querySelector(":scope > .jd-text-field__control > .jd-text-field__slot--end"),
    ).not.toBeNull();
    expect(input.placeholder).toBe("이름 입력");
    // 라벨·에러 없음 → 접힘
    expect(host.querySelector("label")!.hasAttribute("hidden")).toBe(true);
    expect(host.querySelector("p")!.hasAttribute("hidden")).toBe(true);
    expect(host.querySelectorAll("input").length).toBe(1); // 이중 구축 없음
  });

  test("input 노드 identity가 CE 입양·리렌더를 관통해 유지된다", async () => {
    const { container, rerender } = render(<TextField label="이름" />);
    const before = container.querySelector("input");
    await flushCE();
    expect(container.querySelector("input")).toBe(before);
    rerender(<TextField label="성함" error="필수입니다" />);
    await flushCE();
    expect(container.querySelector("input")).toBe(before);
  });

  test("label — dSIH 렌더와 CE textContent 재구축이 수렴하고, 변경 리렌더에도 충돌 없다", async () => {
    const { container, rerender } = render(<TextField label="이름" />);
    await flushCE(); // CE update()가 label.textContent를 재구축한 뒤
    const label = container.querySelector("label")!;
    expect(label.textContent).toBe("이름");
    expect(label.hasAttribute("hidden")).toBe(false);
    rerender(<TextField label="성함" />);
    await flushCE();
    expect(label.textContent).toBe("성함");
  });

  test("error — 메시지 행(아이콘+텍스트)·aria-invalid·aria-describedby·호스트 css 훅", async () => {
    const { container } = render(<TextField label="이름" error="이름을 입력해주세요" />);
    await flushCE();
    const host = container.querySelector("jd-text-field")!;
    const input = container.querySelector("input")!;
    const error = container.querySelector("p.jd-text-field__error")!;
    expect(error.hasAttribute("hidden")).toBe(false);
    expect(error.textContent).toContain("이름을 입력해주세요");
    expect(error.querySelector("svg")).not.toBeNull();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(error.id);
    expect(input.getAttribute("aria-errormessage")).toBe(error.id);
    // css 훅: [error]:not([error=""]) — 비어있지 않은 반영값
    expect(host.getAttribute("error")).toBe("이름을 입력해주세요");
    expect(host.hasAttribute("invalid")).toBe(true);
  });

  test("소비자의 aria-describedby를 error id와 중복 없이 병합한다", async () => {
    const { container, rerender } = render(
      <>
        <TextField id="email" aria-describedby="email-hint" error="확인해주세요" />
        <p id="email-hint">회사 이메일을 입력하세요</p>
      </>,
    );
    await flushCE();
    const input = container.querySelector("input")!;
    expect(input.getAttribute("aria-describedby")).toBe("email-hint email-error");
    rerender(
      <>
        <TextField id="email" aria-describedby="email-hint" />
        <p id="email-hint">회사 이메일을 입력하세요</p>
      </>,
    );
    await flushCE();
    expect(input.getAttribute("aria-describedby")).toBe("email-hint");
  });

  test("error 메시지 변경·해제 리렌더 — CE innerHTML 재구축과 충돌 없이 갱신 (회귀)", async () => {
    const { container, rerender } = render(<TextField error="첫 에러" />);
    await flushCE();
    rerender(<TextField error="둘째 에러" />);
    await flushCE();
    const error = container.querySelector("p.jd-text-field__error")!;
    expect(error.textContent).toContain("둘째 에러");
    rerender(<TextField />);
    await flushCE();
    expect(error.hasAttribute("hidden")).toBe(true);
    expect(container.querySelector("input")!.hasAttribute("aria-invalid")).toBe(false);
  });
});

describe("controlled/uncontrolled — CE 자가 상태와의 방어 계약", () => {
  function Controlled({ onChange }: { onChange?: (v: string) => void }) {
    const [v, setV] = useState("");
    return (
      <TextField
        label="이름"
        value={v}
        onChange={(e) => {
          setV(e.target.value);
          onChange?.(e.target.value);
        }}
      />
    );
  }

  test("controlled 수용: 입력 → onChange → 상태 반영 → host.value 정렬", async () => {
    const spy = vi.fn();
    const { container } = render(<Controlled onChange={spy} />);
    await flushCE();
    const input = container.querySelector("input")!;
    fireEvent.input(input, { target: { value: "준하" } });
    await flushCE();
    expect(spy).toHaveBeenCalledWith("준하");
    expect(input.value).toBe("준하");
    const host = container.querySelector("jd-text-field") as HTMLElement & {
      value: string;
    };
    expect(host.value).toBe("준하");
  });

  test("controlled 거부: 부모가 상태를 안 바꾸면 CE가 되덮지 못하고 prop 값이 유지된다 (회귀)", async () => {
    const { container } = render(<TextField value="고정" onChange={() => {}} />);
    await flushCE();
    const input = container.querySelector("input")!;
    fireEvent.input(input, { target: { value: "고정타이핑" } });
    await flushCE(); // CE update() microtask까지 흘려보낸 뒤
    expect(input.value).toBe("고정");
  });

  test("uncontrolled: defaultValue를 CE 최초 update()가 지우지 않는다 (회귀)", async () => {
    const { container } = render(<TextField defaultValue="초기값" />);
    await flushCE();
    expect(container.querySelector("input")!.value).toBe("초기값");
  });

  test("CE 이벤트 계약 유지: jd-input/jd-change가 정규화 detail로 발행된다", async () => {
    const { container } = render(<TextField />);
    await flushCE();
    const host = container.querySelector("jd-text-field")!;
    const input = container.querySelector("input")!;
    const inputSpy = vi.fn();
    const changeSpy = vi.fn();
    host.addEventListener("jd-input", ((e: CustomEvent) => inputSpy(e.detail)) as EventListener);
    host.addEventListener("jd-change", ((e: CustomEvent) => changeSpy(e.detail)) as EventListener);
    fireEvent.input(input, { target: { value: "실시간" } });
    fireEvent.change(input, { target: { value: "확정" } });
    await flushCE();
    expect(inputSpy).toHaveBeenCalledWith({ value: "실시간" });
    expect(changeSpy).toHaveBeenCalledWith({ value: "확정" });
  });

  test("ref는 v2처럼 내부 input, focus 위임도 동작", async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(<TextField ref={ref} />);
    await flushCE();
    const input = container.querySelector("input")!;
    expect(ref.current).toBe(input);
    ref.current!.focus();
    expect(document.activeElement).toBe(input);
  });
});

describe("Input (v2 표면)", () => {
  test("size/placeholder/disabled 전파 + 호스트 size 훅", async () => {
    const { container } = render(<Input size="lg" placeholder="검색..." disabled />);
    await flushCE();
    const host = container.querySelector("jd-text-field")!;
    const input = container.querySelector("input")!;
    expect(host.getAttribute("size")).toBe("lg");
    expect(input.placeholder).toBe("검색...");
    expect(input.disabled).toBe(true);
  });

  test("error boolean 단독도 메시지 없는 invalid 시각·ARIA로 반영된다", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(<Input error placeholder="필수 입력" />);
    await flushCE();
    expect(container.querySelector("jd-text-field")!.hasAttribute("error")).toBe(false);
    expect(container.querySelector("jd-text-field")!.hasAttribute("invalid")).toBe(true);
    expect(container.querySelector("input")!.getAttribute("aria-invalid")).toBe("true");
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test("leftSlot/rightSlot을 control 골격에 렌더하고 경고하지 않는다", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <Input
        leftSlot={<span data-testid="currency">₩</span>}
        rightSlot={<button type="button">지우기</button>}
        placeholder="금액"
      />,
    );
    await flushCE();
    expect(screen.getByTestId("currency").closest(".jd-text-field__slot--start")).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "지우기" }).closest(".jd-text-field__slot--end"),
    ).not.toBeNull();
    expect(container.querySelectorAll(".jd-text-field__control").length).toBe(1);
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe("FormField (v2 표면) — jd-text-field로의 폴드", () => {
  test("COMPONENTS.md 예제 형태: 라벨·필수·에러가 자식 Input의 CE 표면으로 접힌다", async () => {
    const errors = { name: "이름을 입력해주세요" };
    const { container } = render(
      <FormField label="이름" required error={errors.name}>
        <Input id="name" error={!!errors.name} />
      </FormField>,
    );
    await flushCE();
    const host = container.querySelector("jd-text-field")!;
    const input = container.querySelector("input")!;
    const label = container.querySelector("label")!;
    // 단일 표면: FormField가 별도 라벨/에러를 렌더하지 않고 CE 한 곳에서 나온다
    expect(container.querySelectorAll("label").length).toBe(1);
    expect(container.querySelectorAll("p.jd-text-field__error").length).toBe(1);
    expect(label.textContent).toBe("이름");
    expect(label.getAttribute("for")).toBe("name");
    expect(input.id).toBe("name");
    expect(host.hasAttribute("required")).toBe(true); // 별표 css 훅
    expect(input.required).toBe(true); // v2와 다른 의미 가산(판정표 기재)
    expect(host.getAttribute("error")).toBe("이름을 입력해주세요");
    expect(input.getAttribute("aria-describedby")).toBe("name-error");
    expect(container.querySelector("p.jd-text-field__error")!.textContent).toContain(
      "이름을 입력해주세요",
    );
  });

  test("hint는 에러 없을 때만 아래에 렌더 (v2 동일)", async () => {
    const { container, rerender } = render(
      <FormField label="이메일" hint="회사 메일을 쓰세요">
        <Input />
      </FormField>,
    );
    await flushCE();
    expect(container.querySelector(".jd-form-field__hint")!.textContent).toBe("회사 메일을 쓰세요");
    const hint = container.querySelector<HTMLElement>(".jd-form-field__hint")!;
    expect(container.querySelector("input")!.getAttribute("aria-describedby")).toBe(hint.id);
    rerender(
      <FormField label="이메일" hint="회사 메일을 쓰세요" error="형식이 틀렸습니다">
        <Input />
      </FormField>,
    );
    await flushCE();
    expect(container.querySelector(".jd-form-field__hint")).toBeNull();
  });

  test("htmlFor는 자식 id 부재 시에만 주입되고, label for와 input id가 연결된다", async () => {
    const { container } = render(
      <FormField label="별명" htmlFor="nick">
        <Input />
      </FormField>,
    );
    await flushCE();
    expect(container.querySelector("input")!.id).toBe("nick");
    expect(container.querySelector("label")!.getAttribute("for")).toBe("nick");
  });

  test("Input/TextField가 아닌 자식은 폴드하지 않고 폴백 라벨을 렌더한다", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { container } = render(
      <FormField label="메모">
        <textarea data-testid="ta" />
      </FormField>,
    );
    await flushCE();
    expect(screen.getByTestId("ta")).toBeInTheDocument();
    const label = container.querySelector("label.jd-text-field__label")!;
    expect(label.textContent).toBe("메모");
    expect(container.querySelector("jd-text-field")).toBeNull();
    warn.mockRestore();
  });
});
