"use client";
import {
  useEffect,
  useCallback,
  useRef,
  useId,
  createContext,
  useContext,
  forwardRef,
} from "react";
import { cn } from "../../utils/cn";
import { Slot } from "../../utils/Slot";
import { createCompound } from "../../utils/createCompound";
import { Portal } from "../../primitives/Portal";
import type { ReactNode } from "react";

const ModalIdContext = createContext<{ titleId: string; descId: string } | null>(null);

export type ModalSize = "sm" | "md" | "lg" | "xl" | "full";

export interface ModalProps {
  /**
   * 모달의 표시 여부를 제어합니다.
   *
   * `true`이면 백드롭과 함께 모달이 화면에 나타나고,
   * `false`이면 DOM에서 완전히 제거됩니다.
   * 부모 컴포넌트의 상태(`useState`)로 관리하세요.
   *
   * @example
   * const [isOpen, setIsOpen] = useState(false);
   * <Modal open={isOpen} onClose={() => setIsOpen(false)}>...</Modal>
   */
  open: boolean;

  /**
   * 모달을 닫아야 할 때 호출되는 콜백.
   *
   * ESC 키를 누르거나, `dismissible`이 `true`일 때 백드롭을 클릭하면
   * 자동으로 호출됩니다. 이 콜백에서 `open` 상태를 `false`로 설정하세요.
   *
   * @example
   * <Modal open={isOpen} onClose={() => setIsOpen(false)}>...</Modal>
   */
  onClose: () => void;

  /**
   * 모달 콘텐츠 영역의 최대 너비.
   *
   * - `sm` — 최대 `28rem` (448px). 확인/경고 다이얼로그
   * - `md` — 최대 `32rem` (512px). 기본값. 폼, 상세 정보
   * - `lg` — 최대 `42rem` (672px). 복잡한 폼, 미리보기
   * - `xl` — 최대 `56rem` (896px). 테이블, 대시보드
   * - `full` — 뷰포트 전체(양쪽 1rem 여백). 전체 화면 편집기
   *
   * 모든 사이즈는 모바일에서 `calc(100vw - 2rem)`로 반응형 처리됩니다.
   *
   * @default "md"
   */
  size?: ModalSize;

  /**
   * 백드롭(오버레이) 클릭으로 모달을 닫을 수 있는지 여부.
   *
   * `true`(기본값)이면 백드롭 클릭 시 `onClose`가 호출됩니다.
   * 중요한 작업(결제, 삭제 확인 등) 중 실수로 닫히는 것을 방지하려면
   * `false`로 설정하세요. ESC 키는 항상 동작합니다.
   *
   * @default true
   *
   * @example
   * // 결제 진행 중 — 백드롭 클릭으로 닫히지 않음
   * <Modal open={isOpen} onClose={close} dismissible={false}>
   *   <div className="p-5">결제를 처리 중입니다...</div>
   * </Modal>
   */
  dismissible?: boolean;

  /** 모달 내부에 렌더링할 콘텐츠. */
  children: ReactNode;

  /**
   * 모달 콘텐츠 영역에 추가할 CSS 클래스.
   *
   * 백드롭이 아닌 내부 패널에 적용됩니다.
   * 디자인 시스템이 제공하지 않는 커스텀 스타일이 필요할 때 사용합니다.
   *
   * @example
   * <Modal className="bg-card-hover" open={isOpen} onClose={close}>...</Modal>
   */
  className?: string;

  /**
   * 콘텐츠 패널을 자식 엘리먼트로 렌더 위임합니다 (Radix-style asChild).
   *
   * `true`이면 Modal은 내부 콘텐츠 `<div>`를 렌더하지 않고, 단일 React child에
   * 패널의 className/ref를 병합해 cloneElement합니다. portal 래퍼와 백드롭은
   * 항상 Modal이 소유합니다 — 위임되는 것은 콘텐츠 패널 엘리먼트뿐이므로
   * z-index/focus trap 가정은 깨지지 않습니다.
   *
   * @default false
   *
   * @example
   * <Modal asChild open={isOpen} onClose={close}>
   *   <form onSubmit={handleSubmit}>
   *     <Modal.Header onClose={close}>프로필 수정</Modal.Header>
   *     <Modal.Body>...</Modal.Body>
   *   </form>
   * </Modal>
   */
  asChild?: boolean;
}

export interface ModalHeaderProps {
  /**
   * 헤더에 표시할 내용. 일반적으로 모달 제목 텍스트를 전달합니다.
   *
   * 내부적으로 `<h3>`로 렌더링되며 `aria-labelledby`로 연결되어
   * 스크린 리더가 모달의 목적을 인식할 수 있습니다.
   *
   * @example
   * <Modal.Header onClose={close}>삭제 확인</Modal.Header>
   */
  children: ReactNode;

  /**
   * 전달하면 헤더 우측에 닫기(×) 버튼이 표시됩니다.
   *
   * 보통 모달의 `onClose`와 동일한 함수를 전달합니다.
   * 생략하면 닫기 버튼이 렌더링되지 않습니다.
   *
   * @example
   * <Modal.Header onClose={() => setIsOpen(false)}>제목</Modal.Header>
   */
  onClose?: () => void;

  /** 헤더 영역에 추가할 CSS 클래스. */
  className?: string;
}

export interface ModalTitleProps {
  /**
   * 모달 제목 텍스트. `aria-labelledby`가 가리키는 `<h3>`로 렌더링됩니다.
   *
   * `Modal.Header`가 내부적으로 사용합니다 — Header의 기본 레이아웃(구분선,
   * 닫기 버튼) 없이 커스텀 헤더를 직접 조립할 때만 단독으로 사용하세요.
   * 같은 모달 안에서 `Modal.Header`와 동시에 쓰면 제목 id가 중복됩니다.
   */
  children: ReactNode;

  /** 제목 엘리먼트에 추가할 CSS 클래스. */
  className?: string;
}

export interface ModalBodyProps {
  /** 본문 콘텐츠. `aria-describedby`가 가리키는 영역으로 렌더링됩니다. */
  children: ReactNode;

  /** 본문 영역에 추가할 CSS 클래스. */
  className?: string;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

/** Modal size constraints — responsive-safe with 1rem margin on each side */
const sizeStyles: Record<ModalSize, string> = {
  sm: "max-w-[calc(100vw-2rem)] sm:max-w-md",
  md: "max-w-[calc(100vw-2rem)] sm:max-w-lg",
  lg: "max-w-[calc(100vw-2rem)] sm:max-w-2xl",
  xl: "max-w-[calc(100vw-2rem)] sm:max-w-4xl",
  full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
};

/**
 * 모달 다이얼로그.
 *
 * 포커스 트랩, ESC 닫기, 백드롭 클릭 닫기를 내장합니다.
 * Compound Component: `Modal.Header`, `Modal.Title`, `Modal.Body`, `Modal.Footer`
 *
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
const ModalBase = forwardRef<HTMLDivElement, ModalProps>(
  ({ open, onClose, size = "md", dismissible = true, asChild, children, className }, ref) => {
    const dialogRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const descId = useId();

    // 최신 onClose 를 ref 로 안정화 — 부모가 매 렌더마다 새 onClose 화살표를 넘기더라도
    // ESC 리스너/effect 가 재실행되지 않게(중요: 그 effect 가 focus 도 훔쳤음).
    const onCloseRef = useRef(onClose);
    useEffect(() => {
      onCloseRef.current = onClose;
    }, [onClose]);

    // ESC + 스크롤 락 — 열림 트랜지션에만 한 번 setup, dep 은 [open] 만.
    useEffect(() => {
      if (!open) return;
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCloseRef.current();
      };
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "";
      };
    }, [open]);

    // 첫 focusable 로 포커스 이동 — 열림 트랜지션에만 1회. 사용자가 input 에 타이핑 중일 때
    // 부모 리렌더로 effect 가 다시 돌지 않도록 dep 은 [open] 만.
    useEffect(() => {
      if (!open) return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length > 0) focusable[0].focus();
    }, [open]);

    // Focus trap
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const dialog = dialogRef.current;
      if (!dialog) return;
      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }, []);

    if (!open) return null;

    // asChild는 콘텐츠 패널만 위임한다 — portal 래퍼/백드롭은 항상 Modal 소유.
    const ContentComp = asChild ? Slot : "div";

    return (
      <Portal>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          aria-modal="true"
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={descId}
          onKeyDown={handleKeyDown}
          ref={dialogRef}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-fade-in motion-reduce:animate-none"
            onClick={dismissible ? onClose : undefined}
          />
          {/* Content */}
          <ModalIdContext.Provider value={{ titleId, descId }}>
            <ContentComp
              ref={ref as never}
              className={cn(
                // bg-white 는 라이트 전용이라 다크에서 흰 판이 된다 — 모드를 따라가는 card 로.
                // 떠 있는 패널이므로 다층 그림자에 얇은 링을 더해 가장자리를 세운다.
                "relative w-full bg-card rounded-2xl ring-1 ring-border/60",
                "shadow-[0_25px_60px_rgba(0,0,0,0.15),0_10px_20px_rgba(0,0,0,0.06)]",
                "animate-fade-in-scale motion-reduce:animate-none",
                "overflow-hidden flex flex-col max-h-[90vh]",
                sizeStyles[size],
                className,
              )}
            >
              {children}
            </ContentComp>
          </ModalIdContext.Provider>
        </div>
      </Portal>
    );
  },
);
ModalBase.displayName = "Modal";

/**
 * 모달 제목 `<h3>`. `aria-labelledby`와 연결됩니다.
 *
 * `Modal.Header`가 내부에서 사용하므로 보통 직접 쓸 일이 없습니다.
 * Header의 기본 크롬(구분선·닫기 버튼) 없이 커스텀 헤더를 조립할 때 사용하세요.
 */
function ModalTitle({ children, className }: ModalTitleProps) {
  const ids = useContext(ModalIdContext);
  return (
    <h3 id={ids?.titleId} className={cn("text-base font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

/**
 * 모달 본문 영역. 기본 패딩과 세로 스크롤이 적용되며 `aria-describedby`와
 * 연결됩니다. 부재해도 모달 렌더링은 깨지지 않습니다.
 */
function ModalBody({ children, className }: ModalBodyProps) {
  const ids = useContext(ModalIdContext);
  return (
    <div id={ids?.descId} className={cn("px-6 py-4 overflow-y-auto", className)}>
      {children}
    </div>
  );
}

function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0",
        className,
      )}
    >
      <ModalTitle>{children}</ModalTitle>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className={cn(
            "text-muted hover:text-foreground hover:bg-muted/10 active:bg-muted/20",
            "transition-colors p-1.5 rounded-xl cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-card",
          )}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M4.5 4.5l9 9M13.5 4.5l-9 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        // gray-50 은 라이트 전용 — 다크에서도 한 단계 뜬 면으로 남는 card-hover 로 옮긴다.
        "flex items-center justify-end gap-2 px-6 py-3.5 border-t border-border/40 bg-card-hover/60 shrink-0",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Modal 컴포넌트
 * @status stable
 * @since 2.2.0
 * @tags overlay
 */
export const Modal = createCompound(ModalBase, {
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
  Footer: ModalFooter,
});
