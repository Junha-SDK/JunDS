/**
 * v2 문서 예제 무수정 호환 증명 — COMPONENTS.md·v2 JSDoc의 Example 코드를
 * import 경로만 @junds/react로 바꿔 "그대로" 렌더한다. JSX 블록은 원문 그대로이며
 * 어댑터 표면이 v2 API와 타입·런타임 양쪽에서 호환됨을 증명한다.
 */
import { describe, expect, test, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
// v2: import { Button } from "@/ds/primitives/Button";
// v2: import { Input } from "@/ds/primitives/Input";
// v2: import { FormField } from "@/ds/composites/FormField";
// v2: import { Modal } from "@/ds/composites/Modal";
import { Button, FormField, Input, Modal } from "../src/index.js";
import { flushCE } from "./test-utils.js";

describe("COMPONENTS.md Example — 원문 무수정", () => {
  test("Button: <Button variant=primary size=md>저장</Button> / <Button variant=danger loading>", async () => {
    const { container } = render(
      <>
        <Button variant="primary" size="md">
          저장
        </Button>
        <Button variant="danger" loading>
          삭제 중...
        </Button>
      </>,
    );
    await flushCE();
    const buttons = container.querySelectorAll("button.jd-button");
    expect(buttons.length).toBe(2);
    expect(buttons[0]!.textContent).toBe("저장");
    expect(buttons[1]!.textContent).toContain("삭제 중...");
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);
    expect(buttons[1]!.querySelector(".jd-button__spinner")).not.toBeNull();
  });

  test("Input: <Input error placeholder='필수 입력' /> — 내부 네이티브 입력에 그대로 반영", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Input error placeholder="필수 입력" />);
    await flushCE();
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "필수 입력");
    warn.mockRestore();
  });

  test("FormField: label+required+error 문자열과 자식 Input 조합 원문", async () => {
    const errors: { name?: string } = { name: "이름을 입력해주세요" };
    const { container } = render(
      <FormField label="이름" required error={errors.name}>
        <Input id="name" error={!!errors.name} />
      </FormField>,
    );
    await flushCE();
    expect(container.querySelector("label")!.textContent).toBe("이름");
    expect(container.querySelector("input")!.id).toBe("name");
    expect(container.querySelector("p.jd-text-field__error")!.textContent).toContain(
      "이름을 입력해주세요",
    );
  });
});

describe("v2 JSDoc Example — Modal compound 원문", () => {
  test("Modal + Modal.Header + Modal.Footer + Button 조합이 그대로 동작한다", async () => {
    const handleDelete = vi.fn();

    function Example() {
      const [isOpen, setIsOpen] = useState(true);
      const close = () => setIsOpen(false);
      return (
        <Modal open={isOpen} onClose={close}>
          <Modal.Header onClose={close}>삭제 확인</Modal.Header>
          <div className="p-5">정말 삭제하시겠습니까?</div>
          <Modal.Footer>
            <Button variant="secondary" onClick={close}>
              취소
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              삭제
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }

    const { baseElement } = render(<Example />);
    await flushCE();
    expect(screen.getByText("삭제 확인")).toBeInTheDocument();
    expect(screen.getByText("정말 삭제하시겠습니까?")).toBeInTheDocument();

    fireEvent.click(screen.getByText("삭제"));
    expect(handleDelete).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("취소"));
    await flushCE();
    expect(baseElement.querySelector("jd-modal")).toBeNull(); // 닫힘 = 완전 제거(v2)
  });

  test("Button asChild JSDoc 원문: <Button asChild leftIcon>…<Link/>…</Button> 형태", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const Plus = () => <i data-testid="plus" />;
    // v2 예제의 <Link href>를 동형의 <a href>로 — Slot 위임 대상은 임의 엘리먼트
    render(
      <Button asChild leftIcon={<Plus />}>
        <a href="/new">새로 만들기</a>
      </Button>,
    );
    await flushCE();
    const a = screen.getByText("새로 만들기").closest("a")!;
    expect(a.getAttribute("href")).toBe("/new");
    expect(a.querySelector("[data-testid=plus]")).not.toBeNull();
    warn.mockRestore();
  });
});
