/**
 * jd-mark CSS — v2 primitives/Mark(6색 × 배경형/밑줄형 + 다크 반전)의 토큰 번역.
 *
 * 형광펜 6색은 의미축(primary/success/…)이 아니라 **계열색**이라 `--jd-color-hue-*`에서
 * 고른다(§8). v2 Tailwind 리터럴 승계본은 색당 3변수(bg/fg/line) × 라이트·다크 2벌 =
 * 30개 리터럴이었고, 그 30개는 팔레트 밖 형광색이라 브랜드 전환·다크 보정이 이 컴포넌트만
 * 비껴갔다.
 *
 * 이제 색당 앵커 하나(--_jd-mark-hue)만 두고 면·글자·밑줄은 톤 레시피(DEC-044)가
 * 파생한다 — 모드가 갖는 것은 색이 아니라 혼합비라 다크 셀렉터 6벌이 통째로 사라진다.
 * `--jd-tone`을 호스트가 아니라 `<mark>`에 싣는 것은 jd-highlight 선례 — 마크 안에 든
 * 톤 컴포넌트가 형광펜 색을 물려받지 않게 하는 경계다.
 */
import { css } from "../../core/styles.js";

export default css`
  @layer junds.components {
    jd-mark {
      display: inline;
      --_jd-mark-hue: var(--jd-color-hue-amber); /* yellow 기본 */
    }
    jd-mark[color="blue"] {
      --_jd-mark-hue: var(--jd-color-hue-blue);
    }
    jd-mark[color="green"] {
      --_jd-mark-hue: var(--jd-color-hue-green);
    }
    jd-mark[color="pink"] {
      --_jd-mark-hue: var(--jd-color-hue-pink);
    }
    jd-mark[color="purple"] {
      --_jd-mark-hue: var(--jd-color-hue-purple);
    }
    jd-mark[color="orange"] {
      --_jd-mark-hue: var(--jd-color-hue-orange);
    }

    .jd-mark {
      --jd-tone: var(--_jd-mark-hue);
      --jd-tone-face: color-mix(in srgb, var(--jd-tone) var(--jd-tone-lift), #ffffff);
      padding-inline: var(--jd-space-0-5);
      border-radius: var(--jd-radius-sm);
      /* 형광펜은 옅게 칠한 면 — bg-strong-mix가 v2 200/70·500/30 두 값을 한 공식으로 덮는다 */
      background: color-mix(in srgb, var(--jd-tone-face) var(--jd-tone-bg-strong-mix), transparent);
      color: color-mix(in srgb, var(--jd-tone) var(--jd-tone-ink-mix), var(--jd-tone-ink-toward));
    }
    /* 밑줄형은 글자색을 물려받으므로 선 자체가 색을 말한다 — 면(face)에서 뽑아
     라이트에서는 짙게, 다크에서는 들어 올려진 값으로 자동 대응한다. */
    jd-mark[underline] .jd-mark {
      padding-inline: 0;
      background: transparent;
      color: inherit;
      text-decoration: underline;
      text-decoration-thickness: var(--jd-border-medium);
      text-underline-offset: 2px;
      text-decoration-color: color-mix(in srgb, var(--jd-tone-face) 76%, transparent);
    }
  }
`;
