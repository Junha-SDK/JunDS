/**
 * jd-photo-uploader CSS — v2 composites/PhotoUploader 토큰 번역.
 *
 * v2 값: 루트 `space-y-2`, 드롭존 `block w-full border-2 border-dashed rounded-xl p-6
 * text-center` (드래그 중 `border-primary bg-primary-light/30`, 평시 `border-border
 * hover:border-primary/40 hover:bg-primary-light/10`), 설명 `text-sm`,
 * 개수 `text-[11px] text-muted mt-1`, 오류 `text-xs text-danger`,
 * 그리드 `grid grid-cols-3 sm:grid-cols-5 gap-2`,
 * 항목 `relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800`,
 * 제거 `absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80`.
 * (알파 배경은 color-mix · bg-gray-100/dark:bg-gray-800은 테마를 타는 표면이라
 *  --jd-color-card-hover 한 토큰으로 접힌다 — jd-card 다크 교정과 같은 이유)
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.base {
    jd-photo-uploader:not(:defined) {
      display: block;
    }
  }
  @layer junds.components {
    jd-photo-uploader {
      display: flex;
      flex-direction: column;
      gap: var(--jd-space-2); /* v2 space-y-2 */
      font-family: var(--jd-font-sans);
    }

    /* 네이티브 피커는 시각적으로만 숨긴다 (jd-file-upload 관용구) */
    .jd-photo-uploader__input {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .jd-photo-uploader__zone {
      display: block;
      box-sizing: border-box;
      width: 100%;
      padding: var(--jd-space-6);
      text-align: center;
      color: var(--jd-color-foreground);
      background: transparent;
      border: var(--jd-border-medium) dashed var(--jd-color-border);
      border-radius: var(--jd-radius-xl);
      cursor: pointer;
      transition: border-color var(--jd-duration-normal) var(--jd-easing-ease-out),
        background var(--jd-duration-normal) var(--jd-easing-ease-out);
    }
    .jd-photo-uploader__zone:hover {
      border-color: color-mix(in srgb, var(--jd-color-primary) 40%, transparent);
      background: color-mix(in srgb, var(--jd-color-primary-light) 10%, transparent);
    }
    .jd-photo-uploader__zone[data-drag] {
      border-color: var(--jd-color-primary);
      background: color-mix(in srgb, var(--jd-color-primary-light) 30%, transparent);
    }
    .jd-photo-uploader__zone:focus-visible {
      outline: none;
      border-color: var(--jd-color-primary);
      box-shadow: var(--jd-shadow-focus-ring);
    }
    .jd-photo-uploader__zone:disabled {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }
    jd-photo-uploader[error]:not([error=""]) .jd-photo-uploader__zone {
      border-color: color-mix(in srgb, var(--jd-color-danger) 40%, transparent);
    }

    .jd-photo-uploader__desc {
      display: block;
      font-size: var(--jd-text-md); /* v2 text-sm */
    }
    .jd-photo-uploader__count {
      display: block;
      margin-block-start: var(--jd-space-1);
      font-size: 11px; /* v2 text-[11px] */
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }

    .jd-photo-uploader__error {
      margin: 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-danger);
    }
    .jd-photo-uploader__error[hidden] {
      display: none;
    }

    /* ── 미리보기 ───────────────────────────────────────────── */
    .jd-photo-uploader__grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--jd-space-2);
    }
    .jd-photo-uploader__grid[hidden] {
      display: none;
    }
    @media (min-width: 640px) {
      .jd-photo-uploader__grid {
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }
    }

    .jd-photo-uploader__item {
      position: relative;
      aspect-ratio: 1;
      overflow: hidden;
      background: var(--jd-color-card-hover);
      border-radius: var(--jd-radius-lg);
    }
    .jd-photo-uploader__thumb {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .jd-photo-uploader__remove {
      position: absolute;
      inset-block-start: var(--jd-space-1);
      inset-inline-end: var(--jd-space-1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.5rem;
      height: 1.5rem;
      padding: 0;
      color: #fff;
      background: rgba(0, 0, 0, 0.6);
      border: 0;
      border-radius: var(--jd-radius-full);
      cursor: pointer;
      transition: background var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-photo-uploader__remove:hover {
      background: rgba(0, 0, 0, 0.8);
    }
    .jd-photo-uploader__remove:focus-visible {
      outline: var(--jd-border-medium) solid #fff;
      outline-offset: 1px;
    }
    .jd-photo-uploader__remove:disabled {
      opacity: var(--jd-opacity-50);
      cursor: not-allowed;
    }
    .jd-photo-uploader__remove > svg {
      width: 0.75rem;
      height: 0.75rem;
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-photo-uploader__zone,
      .jd-photo-uploader__remove {
        transition: none;
      }
    }
  }
`;
