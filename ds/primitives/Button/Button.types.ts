import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "link";
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 스타일 변형 */
  variant?: ButtonVariant;
  /** 크기 */
  size?: ButtonSize;
  /** 로딩 상태 */
  loading?: boolean;
  /** 아이콘 (왼쪽) */
  leftIcon?: ReactNode;
  /** 아이콘 (오른쪽) */
  rightIcon?: ReactNode;
  /** 전체 너비 */
  fullWidth?: boolean;
}
