"use client";

/**
 * Modal — <jd-modal> 어댑터 (v2 ds/composites/Modal 표면 호환).
 *
 * DEC-012-4의 반전(v2 dismissible 기본 true → CE persistent 기본 false)을 어댑터에서
 * v2 의미론으로 역번역: persistent = !dismissible. 두 기본값이 서로의 부정이라
 * 기본 상태에서 어느 쪽도 attribute를 쓰지 않는다 — 반전 결정의 목적 그대로.
 *
 * 제어형 역번역(핵심): v2 Modal은 완전 제어형 — ESC/백드롭은 onClose를 "호출"만 하고
 * 닫힘은 부모가 open=false로 결정한다. CE는 자가 닫힘(open을 스스로 false로)이므로,
 * 어댑터는 요청형 jd-request-close(cancelable, §1.5)를 preventDefault()로 항상 취소하고
 * onClose만 호출한다 — CE의 취소 계약이 곧 제어형 어댑터의 구현 지점이 된다.
 * ESC는 persistent여도 동작(CE)·dismissible=false여도 동작(v2) — 의미 일치.
 *
 * v2 수명 의미론: open=false면 DOM에서 완전 제거(null) + Portal(body) + SSR은 null
 * (v2 Portal의 mounted 게이트와 동일). 따라서 Modal은 SSR 완성 골격(§11-4) 대상이
 * 아니다 — v2 호환이 우선한다. 언마운트 시 CE disconnected가 silent close로 스크롤
 * 락·트랩을 회수한다(jd-close 미발행 — 아래 onOpenChange 합성이 보완).
 *
 * onOpenChange(가산 프롭, DEC-008-(2) 검증): jd-open(실이벤트)을 layout effect에서
 * 구독해 true를, effect cleanup(닫힘=언마운트, CE silent 경로)에서 false를 합성한다.
 * 구독이 layout 시점인 이유: CE 최초 render(microtask)가 passive effect보다 앞서
 * jd-open을 놓친다 — useIsoLayoutEffect 주석 참조.
 */
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import "@junds/web/modal";
import type { JdModal } from "@junds/web/modal/element";
import "../jsx.js";
import { cx } from "../internal/cx.js";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";

const ModalIdContext = createContext<{ titleId: string; descId: string } | null>(null);

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  /** 모달의 표시 여부 — 부모 상태로 제어(v2 동일). false면 DOM에서 완전 제거 */
  open: boolean;
  /** 모달을 닫아야 할 때 호출되는 콜백 — ESC/백드롭(dismissible)/Header 닫기 버튼 */
  onClose: () => void;
  /** 콘텐츠 최대 너비 (v2 동일 5종: sm/md/lg/xl/full, 기본 md) */
  size?: ModalSize;
  /** 백드롭 클릭으로 닫기 허용 여부 — 기본 true. ESC는 항상 동작(v2 동일) */
  dismissible?: boolean;
  /** 모달 내부 콘텐츠 */
  children: ReactNode;
  /** 패널(콘텐츠 영역)에 추가할 CSS 클래스 */
  className?: string;
  /**
   * v3 가산 프롭 — 열림 상태 변화 합성 콜백 (jd-open/jd-close → 단일 콜백, DEC-008-(2)).
   * v2 표면에는 없던 프롭이라 v2 코드에 영향 없음.
   */
  onOpenChange?: (open: boolean) => void;
}

export interface ModalHeaderProps {
  /** 헤더 내용 — <h3>로 렌더되고 aria-labelledby로 연결된다(v2 동일) */
  children: ReactNode;
  /** 전달하면 우측에 닫기(×) 버튼 표시(v2 동일) */
  onClose?: () => void;
  /** 헤더 영역 추가 클래스 */
  className?: string;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

const ModalBase = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, size = "md", dismissible = true, children, className, onOpenChange }, ref) => {
    const hostRef = useRef<JdModal>(null);
    const titleId = useId();
    const descId = useId();

    // v2 Portal의 mounted 게이트 동형 — SSR은 null, 클라이언트 마운트 후 포털
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    // v2와 동일한 onClose 안정화 — 매 렌더 새 화살표여도 리스너 재구독 없음
    const onCloseRef = useRef(onClose);
    const onOpenChangeRef = useRef(onOpenChange);
    useEffect(() => {
      onCloseRef.current = onClose;
      onOpenChangeRef.current = onOpenChange;
    });

    useIsoLayoutEffect(() => {
      if (!open || !mounted) return;
      const host = hostRef.current;
      if (!host) return;
      const onRequestClose = (e: Event): void => {
        e.preventDefault(); // CE 자가 닫힘 취소 — 닫힘 결정은 부모(제어형 역번역)
        onCloseRef.current();
      };
      const onJdOpen = (): void => onOpenChangeRef.current?.(true);
      host.addEventListener("jd-request-close", onRequestClose);
      host.addEventListener("jd-open", onJdOpen);
      return () => {
        host.removeEventListener("jd-request-close", onRequestClose);
        host.removeEventListener("jd-open", onJdOpen);
        // 닫힘 = 언마운트 경로: CE disconnected는 silent close(jd-close 미발행)라 여기서 합성
        onOpenChangeRef.current?.(false);
      };
    }, [open, mounted]);

    if (!open || !mounted) return null;

    return createPortal(
      <jd-modal
        ref={hostRef}
        open={true}
        size={size !== "md" ? size : undefined}
        persistent={!dismissible ? true : undefined}
      >
        {/* 입양 골격(§3.3): CE render()가 재사용 — 백드롭 클릭·트랩·락은 CE 소유 */}
        <div className="jd-modal__backdrop" />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          className={cx("jd-modal__panel", className)}
        >
          <ModalIdContext.Provider value={{ titleId, descId }}>
            {children}
          </ModalIdContext.Provider>
        </div>
      </jd-modal>,
      document.body,
    );
  },
);

ModalBase.displayName = "Modal";

/**
 * 주의: jd-modal css는 파일럿 기준 backdrop/panel만 규정한다 — header/title/close/footer
 * 클래스는 스타일 미존재(웹 트랙 후속, DECISIONS DEC-022 판정표). 구조·a11y는 v2 동형.
 */
function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
  const ids = useContext(ModalIdContext);
  return (
    <div className={cx("jd-modal__header", className)}>
      <h3 id={ids?.titleId} className="jd-modal__title">
        {children}
      </h3>
      {onClose ? (
        <button
          type="button"
          className="jd-modal__close"
          aria-label="닫기"
          onClick={onClose}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path
              d="M4.5 4.5l9 9M13.5 4.5l-9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      ) : null}
    </div>
  );
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return <div className={cx("jd-modal__footer", className)}>{children}</div>;
}

/**
 * 모달 다이얼로그 (v2 API 호환 어댑터) — Compound: Modal.Header / Modal.Footer
 * @example
 * <Modal open={isOpen} onClose={close}>
 *   <Modal.Header onClose={close}>삭제 확인</Modal.Header>
 *   <div className="p-5">정말 삭제하시겠습니까?</div>
 *   <Modal.Footer>
 *     <Button variant="secondary" onClick={close}>취소</Button>
 *     <Button variant="danger" onClick={handleDelete}>삭제</Button>
 *   </Modal.Footer>
 * </Modal>
 */
export const Modal = Object.assign(ModalBase, {
  Header: ModalHeader,
  Footer: ModalFooter,
});
