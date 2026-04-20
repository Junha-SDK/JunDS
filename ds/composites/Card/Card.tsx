"use client";
import { cn } from "../../utils/cn";
import type { HTMLAttributes, ReactNode } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** 호버 효과 */
  hoverable?: boolean;
  /** 패딩 없음 */
  noPadding?: boolean;
}

/**
 * 카드 컨테이너
 * @example
 * <Card hoverable>
 *   <Card.Header>제목</Card.Header>
 *   <Card.Body>내용</Card.Body>
 *   <Card.Footer>액션</Card.Footer>
 * </Card>
 */
export function Card({ hoverable, noPadding, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border border-border rounded-xl shadow-xs",
        !noPadding && "p-0",
        hoverable && "card-hover cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-4 border-b border-border-light", className)} {...props}>
      {typeof children === "string" ? (
        <h3 className="text-sm font-semibold text-foreground">{children}</h3>
      ) : children}
    </div>
  );
}

function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-4", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-5 py-3 border-t border-border-light bg-gray-50/50 rounded-b-xl", className)} {...props}>
      {children}
    </div>
  );
}

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
