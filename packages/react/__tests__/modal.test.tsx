/**
 * Modal 어댑터 — v2 제어형 역번역(jd-request-close preventDefault → onClose),
 * dismissible↔persistent 반전(DEC-012-4), 포털·트랩·스크롤 락 수명,
 * onOpenChange 합성(DEC-008-(2)) + layout 구독 타이밍 실측.
 */
import { beforeEach, describe, expect, test, vi } from "vitest";
import { createRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Button, Modal } from "../src/index.js";
import { flushCE } from "./test-utils.js";

beforeEach(() => {
  document.body.style.overflow = "";
});

const esc = () => fireEvent.keyDown(document, { key: "Escape", bubbles: true });

function Harness(props: {
  onClose?: () => void;
  onOpenChange?: (o: boolean) => void;
  dismissible?: boolean;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(props.initialOpen ?? true);
  const close = () => {
    props.onClose?.();
    setOpen(false);
  };
  return (
    <Modal
      open={open}
      onClose={close}
      dismissible={props.dismissible}
      onOpenChange={props.onOpenChange}
    >
      <Modal.Header onClose={close}>삭제 확인</Modal.Header>
      <Modal.Body>정말 삭제하시겠습니까?</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={close}>
          취소
        </Button>
        <Button variant="danger">삭제</Button>
      </Modal.Footer>
    </Modal>
  );
}

describe("골격·포털·ARIA", () => {
  test("body 포털 + 입양 골격 + Header/Body ARIA 자동 연결", async () => {
    const { baseElement, container } = render(<Harness />);
    await flushCE();
    expect(container.querySelector("jd-modal")).toBeNull(); // RTL 컨테이너 밖(포털)
    const host = baseElement.querySelector("jd-modal")!;
    expect(host.parentElement).toBe(document.body);
    expect(host.hasAttribute("open")).toBe(true);
    const panel = host.querySelector<HTMLElement>(":scope > .jd-modal__panel")!;
    expect(host.querySelector(":scope > .jd-modal__backdrop")).not.toBeNull();
    expect(panel.getAttribute("role")).toBe("dialog");
    expect(panel.getAttribute("aria-modal")).toBe("true");
    const h3 = panel.querySelector("h3")!;
    expect(h3.textContent).toBe("삭제 확인");
    expect(panel.getAttribute("aria-labelledby")).toBe(h3.id);
    const body = panel.querySelector(".jd-modal__body")!;
    expect(body.textContent).toBe("정말 삭제하시겠습니까?");
    expect(panel.getAttribute("aria-describedby")).toBe(body.id);
    // 이중 구축 없음(입양)
    expect(host.querySelectorAll(".jd-modal__panel").length).toBe(1);
    expect(host.querySelectorAll(".jd-modal__backdrop").length).toBe(1);
  });

  test("Body가 없으면 존재하지 않는 aria-describedby를 만들지 않는다", async () => {
    const { baseElement } = render(
      <Modal open onClose={() => {}} aria-label="알림">
        <p>간단한 내용</p>
      </Modal>,
    );
    await flushCE();
    const panel = baseElement.querySelector(".jd-modal__panel")!;
    expect(panel.getAttribute("aria-label")).toBe("알림");
    expect(panel.hasAttribute("aria-labelledby")).toBe(false);
    expect(panel.hasAttribute("aria-describedby")).toBe(false);
  });

  test("open=false면 DOM에서 완전 제거 (v2 수명 의미론)", async () => {
    const { baseElement } = render(<Harness initialOpen={false} />);
    await flushCE();
    expect(baseElement.querySelector("jd-modal")).toBeNull();
  });

  test("size 비기본값만 호스트 반영, className은 패널에", async () => {
    const { baseElement } = render(
      <Modal open onClose={() => {}} size="lg" className="custom-panel">
        <p>내용</p>
      </Modal>,
    );
    await flushCE();
    const host = baseElement.querySelector("jd-modal")!;
    expect(host.getAttribute("size")).toBe("lg");
    expect(host.querySelector(".jd-modal__panel")!.classList.contains("custom-panel")).toBe(true);
  });

  test("ref는 v2처럼 패널(콘텐츠 영역) div", async () => {
    const ref = createRef<HTMLDivElement>();
    const { baseElement } = render(
      <Modal open onClose={() => {}} ref={ref}>
        <p>내용</p>
      </Modal>,
    );
    await flushCE();
    expect(ref.current).toBe(baseElement.querySelector(".jd-modal__panel"));
  });
});

describe("제어형 역번역 — 닫힘 결정은 부모", () => {
  test("ESC → onClose 1회 호출, CE 자가 닫힘은 취소되어 부모 상태 반영 전까지 열려 있다", async () => {
    const onClose = vi.fn();
    const { baseElement } = render(
      <Modal open onClose={onClose}>
        <p>내용</p>
      </Modal>,
    );
    await flushCE();
    esc();
    await flushCE();
    expect(onClose).toHaveBeenCalledTimes(1);
    // 부모가 open을 안 바꿨으므로 여전히 열려 있어야 한다(v2 제어형)
    const host = baseElement.querySelector("jd-modal")!;
    expect(host.hasAttribute("open")).toBe(true);
    expect(baseElement.querySelector(".jd-modal__panel")).not.toBeNull();
  });

  test("백드롭 클릭 → onClose (dismissible 기본 true)", async () => {
    const onClose = vi.fn();
    const { baseElement } = render(<Harness onClose={onClose} />);
    await flushCE();
    fireEvent.click(baseElement.querySelector(".jd-modal__backdrop")!);
    await flushCE();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("dismissible=false → persistent 반전: 백드롭 무시, ESC는 항상 동작 (v2 동일)", async () => {
    const onClose = vi.fn();
    const { baseElement } = render(<Harness dismissible={false} onClose={onClose} />);
    await flushCE();
    const host = baseElement.querySelector("jd-modal")!;
    expect(host.hasAttribute("persistent")).toBe(true);
    fireEvent.click(baseElement.querySelector(".jd-modal__backdrop")!);
    await flushCE();
    expect(onClose).not.toHaveBeenCalled();
    esc();
    await flushCE();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("Header 닫기 버튼 → onClose → 언마운트 → 스크롤 락 복원", async () => {
    const { baseElement } = render(<Harness />);
    await flushCE();
    expect(document.body.style.overflow).toBe("hidden"); // CE 스크롤 락
    fireEvent.click(screen.getByLabelText("닫기"));
    await flushCE();
    expect(baseElement.querySelector("jd-modal")).toBeNull();
    expect(document.body.style.overflow).toBe(""); // silent close가 회수
  });
});

describe("포커스 트랩 (CE 소유 Behavior)", () => {
  test("열림 시 첫 focusable로 초점 이동 — 패널 내부", async () => {
    const { baseElement } = render(<Harness />);
    await flushCE();
    const panel = baseElement.querySelector(".jd-modal__panel")!;
    expect(panel.contains(document.activeElement)).toBe(true);
  });
});

describe("onOpenChange 합성 (DEC-008-(2)) — layout 구독 타이밍 실측", () => {
  test("마운트 열림의 jd-open(최초 CE render 중 발행)을 놓치지 않고 true로 합성한다", async () => {
    const spy = vi.fn();
    render(<Harness onOpenChange={spy} />);
    await flushCE();
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith(true);
  });

  test("닫힘(언마운트, CE silent 경로)은 cleanup 합성으로 false", async () => {
    const spy = vi.fn();
    render(<Harness onOpenChange={spy} />);
    await flushCE();
    esc(); // Harness가 open=false로 전환
    await flushCE();
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith(false);
  });
});
