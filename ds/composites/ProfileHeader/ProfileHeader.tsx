"use client";
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface ProfileHeaderProps {
  /** 프로필 이미지 URL */
  avatar?: string;
  /** 배너(커버) 이미지 URL */
  banner?: string;
  /** 표시 이름 */
  name: string;
  /** @핸들 */
  handle?: string;
  /** 자기소개 */
  bio?: ReactNode;
  /** 위치 */
  location?: string;
  /** 가입일 또는 시작 시각 */
  joinedAt?: string;
  /** 통계 항목 */
  stats?: { label: string; value: string | number; href?: string }[];
  /** 우측 액션 (FollowButton 등) */
  actions?: ReactNode;
  /** 인증 배지 표시 */
  verified?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * SNS 프로필 헤더 — 배너 + 아바타 + 통계 + 액션.
 * @example
 * <ProfileHeader name="준하" handle="junha" banner="/banner.jpg" avatar="/me.jpg" verified
 *   stats={[{label:"팔로워",value:"3.2k"},{label:"팔로잉",value:148},{label:"게시물",value:512}]}
 *   actions={<FollowButton following={f} onChange={setF} />} />
 * @status stable
 * @since 2.4.0
 * @tags sns, layout
 */
export const ProfileHeader = forwardRef<HTMLElement, ProfileHeaderProps>(
  (
    { avatar, banner, name, handle, bio, location, joinedAt, stats, actions, verified, className },
    ref,
  ) => (
    <header
      ref={ref}
      className={cn("rounded-xl overflow-hidden border border-border bg-surface", className)}
    >
      <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/40 relative">
        {banner && <img src={banner} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="relative px-5 pb-5">
        <div className="flex items-end justify-between -mt-10">
          <div className="w-20 h-20 rounded-full ring-4 ring-surface bg-surface-soft overflow-hidden">
            {avatar ? (
              <img src={avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary/20 text-primary-ink flex items-center justify-center text-xl font-bold">
                {name.slice(0, 1)}
              </div>
            )}
          </div>
          <div className="mb-1">{actions}</div>
        </div>

        <div className="mt-3">
          <div className="flex items-center gap-1.5">
            <h2 className="text-lg font-bold text-foreground truncate">{name}</h2>
            {verified && (
              <span aria-label="인증됨" className="text-primary-ink">
                ✓
              </span>
            )}
          </div>
          {handle && <p className="text-sm text-muted">@{handle}</p>}
        </div>

        {bio && <p className="mt-2 text-sm text-foreground leading-relaxed">{bio}</p>}

        {(location || joinedAt) && (
          <p className="mt-2 text-xs text-muted flex flex-wrap items-center gap-x-3 gap-y-1">
            {location && <span>📍 {location}</span>}
            {joinedAt && <span>📅 {joinedAt} 가입</span>}
          </p>
        )}

        {stats && stats.length > 0 && (
          <ul className="mt-3 flex items-center gap-4 text-sm">
            {stats.map((s) => {
              const inner = (
                <>
                  <span className="font-semibold text-foreground tabular-nums">{s.value}</span>
                  <span className="ml-1 text-muted">{s.label}</span>
                </>
              );
              return (
                <li key={s.label}>
                  {s.href ? (
                    <a href={s.href} className="hover:underline">
                      {inner}
                    </a>
                  ) : (
                    <span>{inner}</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </header>
  ),
);
ProfileHeader.displayName = "ProfileHeader";
