"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Slot } from "../../utils/Slot";
import { createCompound } from "../../utils/createCompound";
import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * 호버 시 카드에 시각적 피드백을 부여합니다.
   *
   * `true`로 설정하면 마우스를 올렸을 때 그림자가 깊어지고
   * 카드가 살짝(0.5px) 위로 떠오르는 효과가 적용됩니다.
   * 클릭 가능한 카드(링크, 선택)에 사용하세요.
   *
   * @default false
   *
   * @example
   * <Card hoverable onClick={handleClick}>
   *   <Card.Body>클릭 가능한 카드</Card.Body>
   * </Card>
   */
  hoverable?: boolean;

  /**
   * 카드 내부 패딩을 제거합니다.
   *
   * 이미지, 지도, 차트 등 콘텐츠가 카드 경계까지 가득 차야 할 때 사용합니다.
   * 서브 컴포넌트(`Card.Header`, `Card.Body`, `Card.Footer`)는 자체 패딩을
   * 가지므로, 이 옵션은 카드 루트의 패딩만 제어합니다.
   *
   * @default false
   *
   * @example
   * <Card noPadding>
   *   <img src="/hero.jpg" className="w-full rounded-t-2xl" />
   *   <Card.Body>캡션</Card.Body>
   * </Card>
   */
  noPadding?: boolean;

  /**
   * 카드 루트 요소에 추가할 CSS 클래스.
   *
   * 디자인 시스템이 제공하지 않는 커스텀 스타일이 필요할 때
   * 탈출구(escape hatch)로 사용합니다.
   *
   * @example
   * <Card className="max-w-sm mx-auto">...</Card>
   */
  className?: string;

  /**
   * 자식 엘리먼트로 렌더 위임 (Radix-style asChild).
   *
   * `true`이면 Card는 자체 `<div>`를 렌더하지 않고, 단일 React child의 root에
   * className/style/이벤트를 합쳐 cloneElement합니다. `<Link>`, `<button>`,
   * 외부 컨테이너 등으로 자유롭게 위임할 때 사용하세요.
   *
   * @default false
   *
   * @example
   * <Card asChild hoverable>
   *   <Link href="/profile">프로필로 이동</Link>
   * </Card>
   */
  asChild?: boolean;
}

/**
 * 콘텐츠를 시각적으로 그룹화하는 카드 컨테이너.
 *
 * Compound Component 패턴: `Card.Header`, `Card.Body`, `Card.Footer`로 구성합니다.
 *
 * @example
 * // 기본 카드
 * <Card>
 *   <Card.Header>제목</Card.Header>
 *   <Card.Body>본문 내용</Card.Body>
 *   <Card.Footer>
 *     <Button>확인</Button>
 *   </Card.Footer>
 * </Card>
 *
 * @example
 * // 호버 효과 카드
 * <Card hoverable>
 *   <Card.Body>마우스를 올려보세요</Card.Body>
 * </Card>
 */
const CardBase = forwardRef<HTMLDivElement, CardProps>(
  ({ hoverable, noPadding, asChild, className, children, ...props }, ref) => {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref as never}
      className={cn(
        "bg-white/95 backdrop-blur-sm border border-border/60 rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 ease-out",
        !noPadding && "p-0",
        hoverable && "card-hover cursor-pointer hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 hover:border-border",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
},
);
CardBase.displayName = "Card";

/**
 * 카드 상단 영역. 하단에 구분선(`border-bottom`)이 자동 적용됩니다.
 *
 * 문자열을 직접 전달하면 `<h3>` 제목으로 자동 래핑됩니다.
 * 커스텀 레이아웃이 필요하면 JSX를 자식으로 전달하세요.
 *
 * @example
 * <Card.Header>프로필 정보</Card.Header>
 *
 * @example
 * // 커스텀 헤더
 * <Card.Header>
 *   <div className="flex items-center gap-2">
 *     <Avatar />
 *     <span>사용자 이름</span>
 *   </div>
 * </Card.Header>
 */
function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-4 border-b border-border/40", className)} {...props}>
      {typeof children === "string" ? (
        <h3 className="text-base font-semibold text-foreground">{children}</h3>
      ) : children}
    </div>
  );
}

/**
 * 카드의 주요 콘텐츠 영역.
 *
 * 기본 패딩(`px-5 py-4`)이 적용되며, 텍스트·폼·리스트 등
 * 카드의 핵심 내용을 배치합니다.
 *
 * @example
 * <Card.Body>
 *   <p>여기에 본문 내용을 작성합니다.</p>
 * </Card.Body>
 */
function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * 카드 하단 액션 영역. 상단 구분선과 미묘한 배경색(`bg-gray-50/30`)이 적용됩니다.
 *
 * 버튼, 링크 등 사용자 액션을 배치하는 데 사용합니다.
 * 하단 모서리가 카드의 `border-radius`에 맞게 둥글게 처리됩니다.
 *
 * @example
 * <Card.Footer>
 *   <Button variant="secondary">취소</Button>
 *   <Button>저장</Button>
 * </Card.Footer>
 */
function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 py-3.5 border-t border-border/40 bg-gray-50/30 rounded-b-2xl", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card 컴포넌트
 * @status stable
 * @since 2.2.0
 * @tags layout
 */
export const Card = createCompound(CardBase, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});
