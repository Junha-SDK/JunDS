/**
 * jd-mark CSS — v2 primitives/Mark(6색 × 배경형/밑줄형 + 다크 반전)의 토큰 번역.
 * 형광펜 색은 의미축(primary/success/…)이 없어 v2 Tailwind 팔레트 리터럴 승계
 * (DEC-025-1). 색당 3변수(--_jd-mark-bg/fg/line)로 압축해 규칙 수를 6분의 1로 줄였다.
 * 다크 셀렉터는 B4 BatteryIndicator와 동일 규약([data-jd-theme] + 전환기 [data-theme]).
 */
import { css } from "../../core/styles.js";

export default css`
@layer junds.components {
  jd-mark {
    display: inline;
    /* yellow 기본 — 200/70 · 900 · 400 */
    --_jd-mark-bg: rgb(254 240 138 / 0.7);
    --_jd-mark-fg: #713f12;
    --_jd-mark-line: #facc15;
  }
  jd-mark[color="blue"] { --_jd-mark-bg: rgb(191 219 254 / 0.7); --_jd-mark-fg: #1e3a8a; --_jd-mark-line: #60a5fa; }
  jd-mark[color="green"] { --_jd-mark-bg: rgb(187 247 208 / 0.7); --_jd-mark-fg: #14532d; --_jd-mark-line: #4ade80; }
  jd-mark[color="pink"] { --_jd-mark-bg: rgb(251 207 232 / 0.7); --_jd-mark-fg: #831843; --_jd-mark-line: #f472b6; }
  jd-mark[color="purple"] { --_jd-mark-bg: rgb(233 213 255 / 0.7); --_jd-mark-fg: #581c87; --_jd-mark-line: #c084fc; }
  jd-mark[color="orange"] { --_jd-mark-bg: rgb(254 215 170 / 0.7); --_jd-mark-fg: #7c2d12; --_jd-mark-line: #fb923c; }

  /* 다크: v2 dark:bg-*-500/30 + dark:text-*-100 */
  [data-jd-theme="dark"] jd-mark,
  [data-theme="dark"] jd-mark { --_jd-mark-bg: rgb(234 179 8 / 0.3); --_jd-mark-fg: #fef9c3; }
  [data-jd-theme="dark"] jd-mark[color="blue"],
  [data-theme="dark"] jd-mark[color="blue"] { --_jd-mark-bg: rgb(59 130 246 / 0.3); --_jd-mark-fg: #dbeafe; }
  [data-jd-theme="dark"] jd-mark[color="green"],
  [data-theme="dark"] jd-mark[color="green"] { --_jd-mark-bg: rgb(34 197 94 / 0.3); --_jd-mark-fg: #dcfce7; }
  [data-jd-theme="dark"] jd-mark[color="pink"],
  [data-theme="dark"] jd-mark[color="pink"] { --_jd-mark-bg: rgb(236 72 153 / 0.3); --_jd-mark-fg: #fce7f3; }
  [data-jd-theme="dark"] jd-mark[color="purple"],
  [data-theme="dark"] jd-mark[color="purple"] { --_jd-mark-bg: rgb(168 85 247 / 0.3); --_jd-mark-fg: #f3e8ff; }
  [data-jd-theme="dark"] jd-mark[color="orange"],
  [data-theme="dark"] jd-mark[color="orange"] { --_jd-mark-bg: rgb(249 115 22 / 0.3); --_jd-mark-fg: #ffedd5; }

  .jd-mark {
    padding-inline: var(--jd-space-0-5);
    border-radius: var(--jd-radius-sm);
    background: var(--_jd-mark-bg); color: var(--_jd-mark-fg);
  }
  jd-mark[underline] .jd-mark {
    padding-inline: 0; background: transparent; color: inherit;
    text-decoration: underline; text-decoration-thickness: 2px;
    text-underline-offset: 2px; text-decoration-color: var(--_jd-mark-line);
  }
}`;
