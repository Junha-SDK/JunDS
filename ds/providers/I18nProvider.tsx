"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * Default Korean strings used in components.
 *
 * Adding a new key here is the canonical way to introduce a new
 * user-visible string in the design system. Keys are typed via
 * `typeof defaultLocale`, so `Partial<Locale>` overrides catch typos at
 * compile time.
 */
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

  // ARIA fallbacks (used when a labellable component receives no explicit label)
  ariaSlider: "슬라이더",
  ariaSwitch: "스위치",
  ariaButton: "버튼",
  ariaScrollProgress: "페이지 스크롤 진행률",
  ariaCodeEditor: "코드 편집기",
  ariaCodeEditorOf: "{language} 코드 편집기",
  ariaDateStart: "시작일",
  ariaDateEnd: "종료일",
  ariaFilePicker: "파일 선택",
  ariaNotifications: "알림",
  ariaNotificationsUnread: "알림 {count}개 안읽음",
  ariaTransferTo: "{target}(으)로 이동",

  // Photo / Carousel / Lightbox / SocialFeed (book/photo/sns 도메인)
  ariaPrevPhoto: "이전 사진",
  ariaNextPhoto: "다음 사진",
  ariaPhotoNumber: "{n}번 사진으로 이동",
  ariaPhotoView: "사진 보기",
  ariaPhotoUpload: "사진 업로드",
  ariaPhotoFilters: "사진 필터 선택",
  feedEnd: "— 끝 —",
  feedAriaLabel: "피드",
  feedItems: "게시물 목록",
  ariaToc: "목차",
  ariaTocShow: "목차 보기",
  ariaTocHide: "목차 숨기기",
  ariaBookmarkAdd: "북마크 추가",
  ariaBookmarkRemove: "북마크 해제",
  ariaLikeAdd: "좋아요",
  ariaLikeRemove: "좋아요 취소",
  ariaVerified: "인증됨",
  ariaDeleteNote: "메모 삭제",
  ariaStoryOf: "{name} 스토리",
  ariaProgressReading: "독서 진행률",
  ariaPhotoEnlarge: "{alt} 크게 보기",
};

export type Locale = typeof defaultLocale;

/**
 * English locale bundle. Mirrors every key in `defaultLocale`. Use via the
 * shorthand `<I18nProvider locale="en">` or merge selectively as a
 * `Partial<Locale>`.
 */
export const enLocale: Locale = {
  close: "Close",
  cancel: "Cancel",
  confirm: "Confirm",
  save: "Save",
  delete: "Delete",
  search: "Search...",
  loading: "Loading...",
  noResults: "No results",
  noData: "No data",
  selectPlaceholder: "Select...",
  prev: "Previous",
  next: "Next",
  dragOrClick: "Drag a file or click to upload",
  emptyTitle: "Nothing to show",
  errorTitle: "Something went wrong",
  retry: "Retry",
  required: "Required",
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
  ariaSlider: "Slider",
  ariaSwitch: "Switch",
  ariaButton: "Button",
  ariaScrollProgress: "Page reading progress",
  ariaCodeEditor: "Code editor",
  ariaCodeEditorOf: "{language} code editor",
  ariaDateStart: "Start date",
  ariaDateEnd: "End date",
  ariaFilePicker: "Choose file",
  ariaNotifications: "Notifications",
  ariaNotificationsUnread: "{count} unread notifications",
  ariaTransferTo: "Move to {target}",
  ariaPrevPhoto: "Previous photo",
  ariaNextPhoto: "Next photo",
  ariaPhotoNumber: "Go to photo {n}",
  ariaPhotoView: "View photo",
  ariaPhotoUpload: "Upload photo",
  ariaPhotoFilters: "Choose photo filter",
  feedEnd: "— end —",
  feedAriaLabel: "Feed",
  feedItems: "Posts",
  ariaToc: "Table of contents",
  ariaTocShow: "Show table of contents",
  ariaTocHide: "Hide table of contents",
  ariaBookmarkAdd: "Add bookmark",
  ariaBookmarkRemove: "Remove bookmark",
  ariaLikeAdd: "Like",
  ariaLikeRemove: "Unlike",
  ariaVerified: "Verified",
  ariaDeleteNote: "Delete note",
  ariaStoryOf: "{name}'s story",
  ariaProgressReading: "Reading progress",
  ariaPhotoEnlarge: "Enlarge {alt}",
};

/**
 * 일본어 사전. en/ko와 동일 키 구조 — 키가 빠지면 컴파일 에러.
 */
export const jaLocale: Locale = {
  close: "閉じる",
  cancel: "キャンセル",
  confirm: "確認",
  save: "保存",
  delete: "削除",
  search: "検索...",
  loading: "読み込み中...",
  noResults: "結果なし",
  noData: "データなし",
  selectPlaceholder: "選択してください",
  prev: "前へ",
  next: "次へ",
  dragOrClick: "ファイルをドラッグまたはクリック",
  emptyTitle: "表示するものがありません",
  errorTitle: "エラーが発生しました",
  retry: "再試行",
  required: "必須",
  success: "成功",
  error: "エラー",
  warning: "警告",
  info: "情報",
  ariaSlider: "スライダー",
  ariaSwitch: "スイッチ",
  ariaButton: "ボタン",
  ariaScrollProgress: "ページの読み進行率",
  ariaCodeEditor: "コードエディタ",
  ariaCodeEditorOf: "{language} コードエディタ",
  ariaDateStart: "開始日",
  ariaDateEnd: "終了日",
  ariaFilePicker: "ファイル選択",
  ariaNotifications: "通知",
  ariaNotificationsUnread: "未読の通知 {count} 件",
  ariaTransferTo: "{target} へ移動",
  ariaPrevPhoto: "前の写真",
  ariaNextPhoto: "次の写真",
  ariaPhotoNumber: "写真 {n} へ移動",
  ariaPhotoView: "写真を見る",
  ariaPhotoUpload: "写真をアップロード",
  ariaPhotoFilters: "写真フィルターを選択",
  feedEnd: "— 終わり —",
  feedAriaLabel: "フィード",
  feedItems: "投稿",
  ariaToc: "目次",
  ariaTocShow: "目次を表示",
  ariaTocHide: "目次を非表示",
  ariaBookmarkAdd: "ブックマークに追加",
  ariaBookmarkRemove: "ブックマークを解除",
  ariaLikeAdd: "いいね",
  ariaLikeRemove: "いいね取消",
  ariaVerified: "認証済み",
  ariaDeleteNote: "メモを削除",
  ariaStoryOf: "{name} のストーリー",
  ariaProgressReading: "読書の進行率",
  ariaPhotoEnlarge: "{alt} を拡大",
};

/**
 * 中国語(简体)사전.
 */
export const zhLocale: Locale = {
  close: "关闭",
  cancel: "取消",
  confirm: "确认",
  save: "保存",
  delete: "删除",
  search: "搜索...",
  loading: "加载中...",
  noResults: "无结果",
  noData: "无数据",
  selectPlaceholder: "请选择",
  prev: "上一个",
  next: "下一个",
  dragOrClick: "拖拽文件或点击上传",
  emptyTitle: "暂无内容",
  errorTitle: "发生错误",
  retry: "重试",
  required: "必填",
  success: "成功",
  error: "错误",
  warning: "警告",
  info: "提示",
  ariaSlider: "滑块",
  ariaSwitch: "开关",
  ariaButton: "按钮",
  ariaScrollProgress: "页面阅读进度",
  ariaCodeEditor: "代码编辑器",
  ariaCodeEditorOf: "{language} 代码编辑器",
  ariaDateStart: "开始日期",
  ariaDateEnd: "结束日期",
  ariaFilePicker: "选择文件",
  ariaNotifications: "通知",
  ariaNotificationsUnread: "{count} 条未读通知",
  ariaTransferTo: "移动到 {target}",
  ariaPrevPhoto: "上一张",
  ariaNextPhoto: "下一张",
  ariaPhotoNumber: "前往第 {n} 张",
  ariaPhotoView: "查看照片",
  ariaPhotoUpload: "上传照片",
  ariaPhotoFilters: "选择滤镜",
  feedEnd: "— 已到底 —",
  feedAriaLabel: "信息流",
  feedItems: "帖子",
  ariaToc: "目录",
  ariaTocShow: "显示目录",
  ariaTocHide: "隐藏目录",
  ariaBookmarkAdd: "添加书签",
  ariaBookmarkRemove: "移除书签",
  ariaLikeAdd: "赞",
  ariaLikeRemove: "取消赞",
  ariaVerified: "已认证",
  ariaDeleteNote: "删除笔记",
  ariaStoryOf: "{name} 的故事",
  ariaProgressReading: "阅读进度",
  ariaPhotoEnlarge: "放大 {alt}",
};

/** Built-in locale identifiers shipped with the library. */
export type LocaleId = "ko" | "en" | "ja" | "zh";

const builtInLocales: Record<LocaleId, Locale> = {
  ko: defaultLocale,
  en: enLocale,
  ja: jaLocale,
  zh: zhLocale,
};

/**
 * Replace `{var}` placeholders in a message with values from `params`.
 * Missing variables are left intact so the bug is visible at runtime.
 *
 * @example
 *   interpolate("Hello, {name}!", { name: "Junha" }) // "Hello, Junha!"
 *   interpolate("{n} items", { n: 3 })              // "3 items"
 */
export function interpolate(
  message: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (match, key) => {
    const value = params[key];
    return value === undefined ? match : String(value);
  });
}

const I18nContext = createContext<Locale>(defaultLocale);

export interface I18nProviderProps {
  children: ReactNode;
  /**
   * Override locale strings. Accepts:
   *  - a built-in `LocaleId` (`"ko"` | `"en"`) — replaces the entire dictionary,
   *  - a `Partial<Locale>` — shallow-merges over the default Korean dictionary,
   *  - omitted — uses `defaultLocale`.
   */
  locale?: LocaleId | Partial<Locale>;
}

/**
 * 컴포넌트 텍스트 커스터마이징 Provider.
 *
 * @example
 *   <I18nProvider locale="en">
 *     <App />
 *   </I18nProvider>
 *
 * @example
 *   <I18nProvider locale={{ close: "Close", cancel: "Cancel" }}>
 *     <App />
 *   </I18nProvider>
 */
export function I18nProvider({ children, locale }: I18nProviderProps) {
  const merged = useMemo<Locale>(() => {
    if (!locale) return defaultLocale;
    if (typeof locale === "string") return builtInLocales[locale] ?? defaultLocale;
    return { ...defaultLocale, ...locale };
  }, [locale]);

  return <I18nContext.Provider value={merged}>{children}</I18nContext.Provider>;
}

/** Read the active locale dictionary directly (Korean default). */
export function useI18n(): Locale {
  return useContext(I18nContext);
}

/**
 * Translation function with `{var}` interpolation.
 *
 * @example
 *   const t = useT();
 *   t("close")                            // "닫기"
 *   t("Hello, {name}!", { name: "Junha" })// "Hello, Junha!"
 */
export function useT() {
  const dict = useI18n();
  return (
    key: keyof Locale | (string & {}),
    params?: Record<string, string | number>,
  ): string => {
    const message =
      key in dict ? dict[key as keyof Locale] : (key as string);
    return interpolate(message, params);
  };
}
