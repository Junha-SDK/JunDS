/**
 * @junds/web/behaviors 배럴 — 부작용 0 (03-web-arch §6.2).
 *
 * v2 훅 55종의 바닐라 대응(00-inventory §4 매핑표). 파일은 훅 단위가 아니라
 * **계열 단위**다 — 관찰자 계열은 subscribe 골격을 공유하고 유틸은 한 줄짜리가 많아
 * 46개로 쪼개면 배럴만 커진다. 중복 훅 4쌍은 단일 구현 + 별칭(§6 R12).
 */
export type { Behavior, BehaviorFactory } from "./types.js";
export type { Watcher } from "./subscribe.js";
export { createWatcher } from "./subscribe.js";

/* 포커스 — G1에서 선행 구현 */
export { createFocusTrap } from "./focus-trap.js";
export type { FocusTrap, FocusTrapOptions } from "./focus-trap.js";

/* 미디어 질의 */
export {
  createMediaQueryWatcher,
  createBreakpointObserver,
  createBreakpointValueWatcher,
  resolveBreakpointValue,
  createColorSchemeWatcher,
  createReducedMotionWatcher,
} from "./media.js";
export type { JdBreakpoint, JdColorScheme } from "./media.js";

/* 뷰포트·관찰자 */
export {
  createWindowSizeWatcher,
  createScrollWatcher,
  createNetworkWatcher,
  createSizeObserver,
  createInViewObserver,
} from "./viewport.js";
export type { JdSize, JdScrollPosition, JdNetworkStatus, InViewOptions } from "./viewport.js";

/* 타이밍 */
export {
  debounce,
  throttle,
  createInterval,
  createTimeout,
  createRafLoop,
  createIdleWatcher,
  createCountUp,
} from "./timing.js";
export type { Cancellable, Timer, RafLoop, IdleOptions, CountUpOptions } from "./timing.js";

/* 입력·포인터 */
export {
  on,
  createClickOutside,
  createHotkeys,
  createKeyHandler,
  normalizeChord,
  createLongPress,
  createHoverWatcher,
  createFocusVisible,
} from "./input.js";
export type { HotkeyMap, HotkeyOptions, LongPressOptions } from "./input.js";

/* 저장소 */
export { createStoredValue, getCookie, setCookie, removeCookie } from "./storage.js";
export type { StoredValue, StoredValueOptions, CookieOptions } from "./storage.js";

/* 문서 전역 */
export {
  lockScroll,
  setDocumentTitle,
  setFavicon,
  createFullscreen,
  copyText,
  readText,
  preloadImages,
} from "./document.js";
export type { Fullscreen, PreloadResult } from "./document.js";

/* 스크롤 파생 */
export { createScrollSpy, createReadingProgress, createInfiniteFeed } from "./scroll.js";
export type {
  ScrollSpyOptions,
  ReadingProgress,
  ReadingProgressOptions,
  InfiniteFeedOptions,
} from "./scroll.js";

/* 상호작용·환경 */
export { createPanelResize, createFocusMode, createGeolocationWatcher } from "./interaction.js";
export type {
  PanelResizeOptions,
  FocusMode,
  FocusModeOptions,
  GeoPosition,
  GeolocationState,
  GeolocationOptions,
} from "./interaction.js";

/* 폼 */
export { createForm } from "./form.js";
export type { Form, FormOptions, FormRules, FieldRule } from "./form.js";

/* 데이터 */
export { createResource, clearResourceCache, runMutation } from "./data.js";
export type { Resource, ResourceOptions, ResourceState, MutationCallbacks } from "./data.js";
