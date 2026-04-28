import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * `primary` — 강조 액션. 한 화면에 하나만 사용 (저장, 제출, 확인)
 * `secondary` — 보조 액션 (취소, 뒤로가기)
 * `danger` — 파괴적 액션 (삭제, 제거). 빨간색 강조
 * `ghost` — 최소 강조. 투명 배경, 호버 시만 배경 표시
 * `outline` — 테두리만. secondary와 비슷하지만 더 가벼움
 * `link` — 텍스트 링크처럼 동작. 패딩/높이 없음
 */
export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "outline" | "link";

/**
 * `xs` — 28px. 테이블 내 인라인 액션, 칩 삭제 등
 * `sm` — 32px. 밀도 높은 UI, 카드 내 액션
 * `md` — 36px. 기본값. 대부분의 폼/페이지에 적합
 * `lg` — 44px. 히어로 CTA, 랜딩 페이지 등 강조 필요 시
 */
export type ButtonSize = "xs" | "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * 버튼 스타일 변형.
   *
   * - `primary` — 강조 액션 (저장, 제출). 한 화면에 하나만 권장
   * - `secondary` — 보조 액션 (취소, 뒤로가기)
   * - `danger` — 파괴적 액션 (삭제, 제거)
   * - `ghost` — 최소 강조. 툴바, 메뉴 아이템
   * - `outline` — 테두리만. 부드러운 보조 액션
   * - `link` — 인라인 텍스트 링크 스타일
   *
   * @default "primary"
   */
  variant?: ButtonVariant;

  /**
   * 버튼 크기. 높이, 패딩, 폰트 크기, 아이콘 크기를 결정합니다.
   *
   * - `xs` — 28px. 테이블, 칩, 인라인
   * - `sm` — 32px. 카드, 밀도 높은 UI
   * - `md` — 36px. 기본값. 폼, 모달
   * - `lg` — 44px. 히어로, 랜딩 CTA
   *
   * @default "md"
   */
  size?: ButtonSize;

  /**
   * 로딩 상태를 표시합니다.
   *
   * `true`이면 스피너가 표시되고, 버튼이 비활성화되며,
   * `aria-busy="true"`가 설정됩니다.
   *
   * @example
   * <Button loading>저장 중...</Button>
   *
   * @default false
   */
  loading?: boolean;

  /**
   * 버튼 텍스트 왼쪽에 표시할 아이콘입니다.
   * loading 상태에서는 스피너로 대체됩니다.
   *
   * @example
   * <Button leftIcon={<PlusIcon />}>추가</Button>
   */
  leftIcon?: ReactNode;

  /**
   * 버튼 텍스트 오른쪽에 표시할 아이콘입니다.
   * loading 상태에서는 숨겨집니다.
   *
   * @example
   * <Button rightIcon={<ChevronIcon />}>다음</Button>
   */
  rightIcon?: ReactNode;

  /**
   * 부모 너비를 100% 채웁니다.
   * 모바일 레이아웃이나 모달 하단 액션에 적합합니다.
   *
   * @example
   * <Button fullWidth>전체 너비 버튼</Button>
   *
   * @default false
   */
  fullWidth?: boolean;
}
