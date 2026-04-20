"use client";
import { createContext, useContext, type ReactNode } from "react";

// Default Korean strings used in components
export const defaultLocale = {
  // Common
  close: "닫기",
  cancel: "취소",
  confirm: "확인",
  save: "저장",
  delete: "삭제",
  search: "검색...",
  loading: "로딩 중...",
  noResults: "결과 없음",
  noData: "데이터 없음",

  // Select
  selectPlaceholder: "선택하세요",

  // Pagination
  prev: "이전",
  next: "다음",

  // FileUpload
  dragOrClick: "파일을 드래그하거나 클릭하세요",

  // EmptyState
  emptyTitle: "데이터가 없습니다",

  // ErrorBoundary
  errorTitle: "오류가 발생했습니다",
  retry: "다시 시도",

  // FormField
  required: "필수",

  // Toast
  success: "성공",
  error: "오류",
  warning: "주의",
  info: "안내",
};

export type Locale = typeof defaultLocale;

const I18nContext = createContext<Locale>(defaultLocale);

export interface I18nProviderProps {
  children: ReactNode;
  locale?: Partial<Locale>;
}

/**
 * 컴포넌트 텍스트 커스터마이징 Provider
 * @example
 * <I18nProvider locale={{ close: "Close", cancel: "Cancel" }}>
 *   <App />
 * </I18nProvider>
 */
export function I18nProvider({ children, locale }: I18nProviderProps) {
  const merged = locale ? { ...defaultLocale, ...locale } : defaultLocale;
  return <I18nContext.Provider value={merged}>{children}</I18nContext.Provider>;
}

export function useI18n(): Locale {
  return useContext(I18nContext);
}
