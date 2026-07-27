import { css } from "../../core/styles.js";

/**
 * v2 값: 카드 rounded-xl·테두리·surface, 배너 128px(primary 20→40% 그라디언트),
 * 아바타 80px·카드색 4px 링·배너 위로 -40px, 이름 text-lg/bold, 핸들 muted, 소개
 * text-sm/relaxed, 위치 text-xs muted·gap, 통계 text-sm(값 semibold tabular-nums).
 */
export default css`
@layer junds.components {
  jd-profile-header { display: block; font-family: var(--jd-font-sans); }

  .jd-profile-header {
    border-radius: var(--jd-radius-xl); overflow: hidden;
    border: var(--jd-border-thin) solid var(--jd-color-border);
    background: var(--jd-color-card);
    color: var(--jd-color-foreground);
  }

  .jd-profile-header__banner {
    position: relative; height: 8rem;
    background: linear-gradient(
      to right,
      color-mix(in srgb, var(--jd-color-primary) 20%, transparent),
      color-mix(in srgb, var(--jd-color-primary) 40%, transparent)
    );
  }
  .jd-profile-header__banner-img {
    width: 100%; height: 100%; object-fit: cover; display: block;
  }
  .jd-profile-header__banner-img[hidden] { display: none; }

  .jd-profile-header__body { position: relative; padding: 0 var(--jd-space-5) var(--jd-space-5); }

  .jd-profile-header__top {
    display: flex; align-items: flex-end; justify-content: space-between;
    margin-top: -2.5rem;
  }
  .jd-profile-header__avatar {
    width: 5rem; height: 5rem; border-radius: var(--jd-radius-full);
    box-shadow: 0 0 0 4px var(--jd-color-card);
    background: var(--jd-color-card-hover); overflow: hidden; flex-shrink: 0;
  }
  .jd-profile-header__avatar-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .jd-profile-header__avatar-img[hidden] { display: none; }
  .jd-profile-header__avatar-fallback {
    width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--jd-color-primary) 20%, transparent);
    /* 틴트 위 이니셜: 원색 대신 foreground 혼합으로 대비 확보(emoji-picker 선례·§4). */
    color: color-mix(in srgb, var(--jd-color-primary) 65%, var(--jd-color-foreground));
    font-size: var(--jd-text-2xl); font-weight: var(--jd-weight-bold); user-select: none;
  }
  .jd-profile-header__avatar-fallback[hidden] { display: none; }
  .jd-profile-header__actions { margin-bottom: var(--jd-space-1); }

  .jd-profile-header__identity { margin-top: var(--jd-space-3); }
  .jd-profile-header__name-row { display: flex; align-items: center; gap: var(--jd-space-1-5); }
  .jd-profile-header__name {
    margin: 0; font-size: var(--jd-text-xl); font-weight: var(--jd-weight-bold);
    color: var(--jd-color-foreground);
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .jd-profile-header__verified { color: var(--jd-color-primary-ink); }
  .jd-profile-header__verified[hidden] { display: none; }
  .jd-profile-header__handle {
    margin: 0; font-size: var(--jd-text-md); color: var(--jd-color-muted);
  }
  .jd-profile-header__handle[hidden] { display: none; }

  .jd-profile-header__bio {
    margin-top: var(--jd-space-2);
    font-size: var(--jd-text-md); line-height: var(--jd-leading-relaxed);
    color: var(--jd-color-foreground);
  }
  .jd-profile-header__bio[hidden] { display: none; }

  .jd-profile-header__location {
    margin: var(--jd-space-2) 0 0;
    font-size: var(--jd-text-xs); color: var(--jd-color-muted);
    display: flex; flex-wrap: wrap; align-items: center;
    gap: var(--jd-space-1) var(--jd-space-3);
  }
  .jd-profile-header__location[hidden] { display: none; }
  .jd-profile-header__loc[hidden],
  .jd-profile-header__joined[hidden] { display: none; }

  .jd-profile-header__stats {
    list-style: none; margin: var(--jd-space-3) 0 0; padding: 0;
    display: flex; align-items: center; gap: var(--jd-space-4);
    font-size: var(--jd-text-md);
  }
  .jd-profile-header__stats[hidden] { display: none; }
  .jd-profile-header__stat-link {
    color: inherit; text-decoration: none;
    border-radius: var(--jd-radius-sm);
  }
  a.jd-profile-header__stat-link:hover { text-decoration: underline; }
  a.jd-profile-header__stat-link:focus-visible {
    outline: 2px solid var(--jd-color-primary); outline-offset: 2px;
  }
  .jd-profile-header__stat-value {
    font-weight: var(--jd-weight-semibold); color: var(--jd-color-foreground);
    font-variant-numeric: tabular-nums;
  }
  .jd-profile-header__stat-label { margin-inline-start: var(--jd-space-1); color: var(--jd-color-muted); }
}`;
