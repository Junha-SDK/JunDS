import { css } from "../../core/styles.js";

/**
 * v2 값: brand font-extrabold tracking-tight(-0.02em), 색 --bm-text, 점 브랜드색(#f5b800)
 * 지름 max(4, round(fs*0.22)), 부제 11px bold tracking-wider --bm-muted. 크기 3종
 * (sm fs18/gap6, md fs20/gap8, lg fs24/gap10). 점은 세 크기 계산이 sm/md 4·lg 5로 굳는다.
 * 브랜드색은 --bm-brand → 폴백 #f5b800(finance 전용 토큰이라 --jd-fin-* 계열 밖).
 */
export default css`
@layer junds.components {
  jd-logo {
    display: inline-flex; align-items: center;
    --jd-logo-text: var(--bm-text, var(--jd-color-foreground));
    --jd-logo-muted: var(--bm-muted, var(--jd-color-muted));
    --jd-logo-brand: var(--bm-brand, #f5b800);
    font-family: var(--jd-font-sans);
  }

  .jd-logo__link {
    display: inline-flex; align-items: center;
    color: inherit; text-decoration: none;
  }

  .jd-logo__brand {
    display: inline-flex; align-items: baseline;
    font-weight: 800; letter-spacing: -0.02em;
    color: var(--jd-logo-text);
  }
  .jd-logo__dot {
    display: inline-block; flex-shrink: 0;
    margin-inline-start: 2px;
    border-radius: var(--jd-radius-full);
    background: var(--jd-logo-brand);
  }
  .jd-logo__subtitle {
    margin-inline-start: var(--jd-space-2);
    font-size: 11px; font-weight: var(--jd-weight-bold);
    letter-spacing: 0.05em; color: var(--jd-logo-muted);
  }
  .jd-logo__subtitle[hidden] { display: none; }

  /* 크기 3종 — v2 SIZE 맵의 상수 이식 */
  jd-logo[size="sm"] .jd-logo__brand { font-size: 18px; }
  jd-logo[size="sm"] .jd-logo__link { gap: 6px; }
  jd-logo[size="sm"] .jd-logo__dot { width: 4px; height: 4px; }

  jd-logo[size="md"] .jd-logo__brand,
  jd-logo:not([size]) .jd-logo__brand { font-size: 20px; }
  jd-logo[size="md"] .jd-logo__link,
  jd-logo:not([size]) .jd-logo__link { gap: 8px; }
  jd-logo[size="md"] .jd-logo__dot,
  jd-logo:not([size]) .jd-logo__dot { width: 4px; height: 4px; }

  jd-logo[size="lg"] .jd-logo__brand { font-size: 24px; }
  jd-logo[size="lg"] .jd-logo__link { gap: 10px; }
  jd-logo[size="lg"] .jd-logo__dot { width: 5px; height: 5px; }
}`;
