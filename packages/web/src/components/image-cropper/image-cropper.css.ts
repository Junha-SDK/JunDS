import { css } from "../../core/styles.js";

/**
 * jd-image-cropper CSS — v2 composites/ImageCropper의 토큰 번역.
 * v2 값: 프레임 `relative overflow-hidden rounded-xl select-none`, 딤 `bg-black/40`,
 * 크롭 상자 `border-2 border-white cursor-move`, 손잡이 `w-3 h-3 bg-white
 * border border-gray-400 rounded-sm` (모서리 기준 -50% 이동),
 * 버튼 `mt-2 px-4 py-2 text-sm bg-primary text-white rounded-lg`.
 *
 * 기하는 변수 4개로만 흐른다(--_jd-crop-x / -y / -size / -ratio, 전부 단위 없는 수).
 * 상자 높이는 **CSS aspect-ratio**가 정한다 — v2처럼 `size / aspectRatio`를 세로 %로
 * 주면 %의 기준축이 달라 요청한 비율이 나오지 않는다(정사각형 이미지에서만 우연히 맞았다).
 * 미리보기는 상자 안에서 자기 크기 기준 `translate(-x%, -y%)`로 밀린다 —
 * 미리보기 폭이 정확히 프레임 폭이므로(100/size 배) 정렬이 정의상 어긋나지 않는다.
 */
export default css`
  @layer junds.components {
    jd-image-cropper {
      display: inline-block;
      box-sizing: border-box;
      font-family: var(--jd-font-sans);
    }

    .jd-image-cropper__frame {
      position: relative;
      overflow: hidden;
      border-radius: var(--jd-radius-xl);
      user-select: none;
      -webkit-user-select: none;
    }

    .jd-image-cropper__image {
      display: block;
      width: 100%;
      height: auto;
      -webkit-user-drag: none;
    }

    .jd-image-cropper__dim {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.4);
    }

    .jd-image-cropper__area {
      position: absolute;
      overflow: hidden;
      inset-inline-start: calc(var(--_jd-crop-x, 25) * 1%);
      inset-block-start: calc(var(--_jd-crop-y, 25) * 1%);
      width: calc(var(--_jd-crop-size, 50) * 1%);
      aspect-ratio: var(--_jd-crop-ratio, 1);
      border: var(--jd-border-medium) solid #fff;
      box-sizing: border-box;
      cursor: move;
      /* 상자·손잡이 위에서 시작한 터치만 드래그로 삼킨다 — 사진의 나머지 부분에서는
       페이지가 정상 스크롤된다(touch-action은 터치가 시작된 요소의 것이 적용된다) */
      touch-action: none;
    }
    .jd-image-cropper__area:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    .jd-image-cropper__preview {
      position: absolute;
      inset-block-start: 0;
      inset-inline-start: 0;
      width: calc(100% * 100 / var(--_jd-crop-size, 50));
      height: auto;
      max-width: none;
      transform: translate(calc(var(--_jd-crop-x, 25) * -1%), calc(var(--_jd-crop-y, 25) * -1%));
      -webkit-user-drag: none;
      pointer-events: none; /* 상자 자체가 드래그 대상이다 */
    }

    .jd-image-cropper__handle {
      position: absolute;
      touch-action: none;
      width: 0.75rem;
      height: 0.75rem;
      background: #fff;
      border: var(--jd-border-thin) solid var(--jd-color-neutral-400);
      border-radius: var(--jd-radius-sm);
    }
    .jd-image-cropper__handle[data-corner="nw"] {
      inset-block-start: 0;
      inset-inline-start: 0;
      transform: translate(-50%, -50%);
      cursor: nwse-resize;
    }
    .jd-image-cropper__handle[data-corner="ne"] {
      inset-block-start: 0;
      inset-inline-end: 0;
      transform: translate(50%, -50%);
      cursor: nesw-resize;
    }
    .jd-image-cropper__handle[data-corner="sw"] {
      inset-block-end: 0;
      inset-inline-start: 0;
      transform: translate(-50%, 50%);
      cursor: nesw-resize;
    }
    .jd-image-cropper__handle[data-corner="se"] {
      inset-block-end: 0;
      inset-inline-end: 0;
      transform: translate(50%, 50%);
      cursor: nwse-resize;
    }

    /* 상태 문구는 화면에는 두되 조용하게 — v2에는 없던 층이다 */
    .jd-image-cropper__status {
      margin: var(--jd-space-2) 0 0;
      font-size: var(--jd-text-xs);
      color: var(--jd-color-muted);
      font-variant-numeric: tabular-nums;
    }

    .jd-image-cropper__crop {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-block-start: var(--jd-space-2);
      padding: var(--jd-space-2) var(--jd-space-4);
      border: 0;
      border-radius: var(--jd-radius-lg);
      background: var(--jd-color-primary);
      color: #fff;
      font-family: inherit;
      font-size: var(--jd-text-sm);
      cursor: pointer;
      transition: background-color var(--jd-duration-fast) var(--jd-easing-ease-out);
    }
    .jd-image-cropper__crop:hover {
      background: var(--jd-color-primary-hover);
    }
    .jd-image-cropper__crop:focus-visible {
      outline: none;
      box-shadow: var(--jd-shadow-focus-ring);
    }

    @media (prefers-reduced-motion: reduce) {
      .jd-image-cropper__crop {
        transition: none;
      }
    }
  }
`;
