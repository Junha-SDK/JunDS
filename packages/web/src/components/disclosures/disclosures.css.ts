/**
 * jd-disclosures CSS — v2 finance/DisclosuresClient 토큰 번역.
 * v2 값: 요약 카드 좌측 accent 3px 보더, bm-card 검색 바, 스크롤 칩(active면 accent 배경+
 * 흰 글자), 빈 상태 중앙 정렬. accent는 노드별 --accent 커스텀 프로퍼티 경유.
 * 타임라인·태그 크롬은 각각 jd-timeline/jd-tag 시트가 담당한다(합성).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-disclosures {
    display: block; font-family: var(--jd-font-sans); color: var(--jd-color-foreground);
  }
  jd-disclosures:not(:defined) { display: block; }

  /* 요약 */
  .jd-disclosures__summary {
    display: grid; grid-template-columns: 1fr 1fr; gap: var(--jd-space-3);
    margin-block-start: var(--jd-space-1);
  }
  .jd-disclosures__card {
    display: flex; align-items: center; gap: var(--jd-space-3);
    padding: var(--jd-space-3) var(--jd-space-4);
    background: var(--jd-color-card); border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border);
    border-inline-start: 3px solid var(--accent, var(--jd-color-accent));
  }
  .jd-disclosures__card-icon {
    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
    width: 36px; height: 36px; font-size: 18px; border-radius: var(--jd-radius-xl);
    background: color-mix(in srgb, var(--accent, var(--jd-color-accent)) 12%, transparent);
  }
  .jd-disclosures__card-text { min-width: 0; }
  .jd-disclosures__card-label {
    font-size: 10.5px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-disclosures__card-value {
    font-size: 18px; font-weight: var(--jd-weight-bold); font-variant-numeric: tabular-nums;
    /* 원색 그대로면 sky/warning/info가 흰 카드에서 대비 미달 → foreground 쪽으로 섞는다 */
    color: color-mix(in srgb, var(--accent, var(--jd-color-accent)) 65%, var(--jd-color-foreground));
  }
  .jd-disclosures__card-hint { font-size: 10.5px; font-weight: var(--jd-weight-bold); color: var(--jd-color-muted); }

  /* 검색 */
  .jd-disclosures__search {
    display: flex; align-items: center; gap: var(--jd-space-2);
    margin-block-start: var(--jd-space-3); padding: var(--jd-space-2);
    background: var(--jd-color-card); border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-disclosures__search-icon { font-size: 14px; }
  .jd-disclosures__search-input {
    flex: 1; min-width: 0; border: 0; background: transparent; outline: none;
    padding: var(--jd-space-1-5) 0; font: inherit; font-size: 13px; color: var(--jd-color-foreground);
  }
  .jd-disclosures__search-input::placeholder { color: var(--jd-color-muted); }
  .jd-disclosures__search-clear {
    flex-shrink: 0; border: 0; cursor: pointer; padding: 4px 10px; font-size: 11px;
    font-weight: var(--jd-weight-bold); border-radius: var(--jd-radius-full);
    background: var(--jd-color-surface); color: var(--jd-color-muted);
  }
  .jd-disclosures__search-clear[hidden] { display: none; }
  .jd-disclosures__search-clear:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }

  /* 분류 칩 */
  .jd-disclosures__chips {
    display: flex; align-items: center; gap: var(--jd-space-2);
    margin-block-start: var(--jd-space-3); overflow-x: auto;
    scrollbar-width: none; -webkit-overflow-scrolling: touch;
  }
  .jd-disclosures__chips::-webkit-scrollbar { display: none; }
  .jd-disclosures__chip {
    flex-shrink: 0; display: inline-flex; align-items: center; gap: 6px;
    padding: 6px 12px; font: inherit; font-size: 12px; font-weight: var(--jd-weight-bold);
    cursor: pointer; border-radius: var(--jd-radius-full);
    background: var(--jd-color-card);
    color: color-mix(in srgb, var(--accent, var(--jd-color-foreground)) 65%, var(--jd-color-foreground));
    border: var(--jd-border-thin) solid
      color-mix(in srgb, var(--accent, var(--jd-color-border)) 33%, transparent);
    transition: background-color var(--jd-duration-fast) var(--jd-easing-default),
                color var(--jd-duration-fast) var(--jd-easing-default);
  }
  .jd-disclosures__chip[data-active] {
    /* 원색 배경 + 흰 글자 → 배경을 foreground 쪽 80% 혼합으로 어둡혀 대비 확보 */
    background: color-mix(in srgb, var(--accent, var(--jd-color-foreground)) 80%, var(--jd-color-foreground));
    color: #fff; border-color: transparent;
  }
  .jd-disclosures__chip:focus-visible { outline: none; box-shadow: var(--jd-shadow-focus-ring); }
  .jd-disclosures__chip-count { font-variant-numeric: tabular-nums; font-size: 10.5px; opacity: .85; }

  /* 목록 */
  .jd-disclosures__list {
    display: block; margin-block-start: var(--jd-space-3); padding: var(--jd-space-4);
    background: var(--jd-color-card); border-radius: var(--jd-radius-xl);
    border: var(--jd-border-thin) solid var(--jd-color-border);
  }
  .jd-disclosures__desc { display: flex; align-items: center; flex-wrap: wrap; gap: var(--jd-space-2); margin-block-start: var(--jd-space-1); }
  .jd-disclosures__desc-meta { font-size: 11px; color: var(--jd-color-muted); }

  .jd-disclosures__empty { padding: var(--jd-space-10) 0; text-align: center; }
  .jd-disclosures__empty[hidden] { display: none; }
  .jd-disclosures__empty-icon { font-size: 28px; }
  .jd-disclosures__empty-title { margin: var(--jd-space-1-5) 0 0; font-size: 13px; font-weight: var(--jd-weight-bold); color: var(--jd-color-foreground); }
  .jd-disclosures__empty-sub { margin: 2px 0 0; font-size: 11.5px; color: var(--jd-color-muted); }

  .jd-disclosures__note {
    margin: var(--jd-space-3) 0 0; padding-inline: var(--jd-space-1);
    font-size: 11px; line-height: var(--jd-leading-relaxed); color: var(--jd-color-muted);
  }

  .jd-disclosures__sr {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0;
  }

  @media (min-width: 48rem) {
    .jd-disclosures__summary { grid-template-columns: repeat(4, 1fr); }
  }
}`;
