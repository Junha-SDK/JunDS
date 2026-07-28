"use client";

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { AlbumArt } from "../AlbumArt";
import { Waveform } from "../Waveform";
import { formatAudioTime, type AudioPlayerState } from "../../hooks/useAudioPlayer";

export interface NowPlayingBarProps extends HTMLAttributes<HTMLDivElement> {
  /** `useAudioPlayer()` 가 돌려준 상태 */
  player: AudioPlayerState;
  /** 커버를 눌렀을 때 (전체 화면 플레이어 열기 등). 없으면 커버는 버튼이 아니다 */
  onExpand?: () => void;
  /** 트랙 로드 실패 시 아티스트 자리에 보여줄 문구 */
  errorMessage?: string;
  /** 파형 막대 개수 (기본 72) */
  bars?: number;
  /** 바 오른쪽 끝에 덧붙일 내용 (볼륨 슬라이더·반복 버튼 등) */
  actions?: ReactNode;
  /** 화면 하단에 고정할지 (기본 true) */
  fixed?: boolean;
}

const iconBtn =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full text-foreground/80 cursor-pointer transition-colors hover:bg-card-hover hover:text-foreground active:bg-muted/15 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2";

/**
 * 하단 고정 재생 바 — 커버·곡 정보·파형 스크러버·이전/재생/다음.
 *
 * `useAudioPlayer` 의 상태를 그대로 받아 그린다. `<audio>` 엘리먼트를 이 컴포넌트가
 * 렌더하되 트랙이 없을 때도 마운트를 유지한다 — 언마운트되면 훅이 잡고 있는 ref 가
 * 끊겨 다음 재생에서 이벤트가 하나도 오지 않기 때문이다. 바 자체는 트랙이
 * 선택됐을 때만 나타난다.
 *
 * @example
 * ```tsx
 * const player = useAudioPlayer(tracks);
 * <NowPlayingBar player={player} onExpand={() => setFullscreen(true)} />
 * ```
 * @status stable
 * @since 2.3.0
 * @tags media, audio
 */
export const NowPlayingBar = forwardRef<HTMLDivElement, NowPlayingBarProps>(function NowPlayingBar(
  {
    player,
    onExpand,
    errorMessage = "트랙을 재생할 수 없습니다",
    bars = 72,
    actions,
    fixed = true,
    className,
    ...props
  },
  ref,
) {
  const { current, isPlaying, currentTime, duration, error } = player;
  const progress = duration > 0 ? currentTime / duration : 0;

  const art = (
    <AlbumArt
      src={current?.cover}
      seed={current ? `${current.title}-${current.artist}` : "empty"}
      size={44}
    />
  );

  return (
    <>
      {/* 트랙 유무와 무관하게 항상 마운트 — ref 안정성 */}
      <audio ref={player.audioRef as React.RefObject<HTMLAudioElement>} preload="metadata" />

      {current && (
        <div
          ref={ref}
          role="region"
          aria-label="재생 중"
          className={cn(
            "z-40 border-t border-border bg-card/95 backdrop-blur",
            // 본문 위에 얹히는 면이다 — 테두리 한 줄로는 떠 보이지 않아 위쪽으로 그림자를 편다.
            fixed &&
              "fixed inset-x-0 bottom-0 shadow-[0_-10px_28px_-14px_rgba(0,0,0,0.32),0_-3px_8px_-5px_rgba(0,0,0,0.16)]",
            className,
          )}
          {...props}
        >
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-2.5">
            {/* 곡 정보 */}
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:max-w-xs">
              {onExpand ? (
                <button
                  type="button"
                  onClick={onExpand}
                  aria-label="전체 화면으로 보기"
                  className="group relative shrink-0 cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                >
                  {art}
                  <span
                    // 키보드로 왔을 때도 확대 아이콘이 보여야 한다 — hover 만으로는 안 뜬다.
                    className="absolute inset-0 grid place-items-center rounded-lg bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    aria-hidden="true"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="15"
                      height="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 14l6-6 6 6" />
                    </svg>
                  </span>
                </button>
              ) : (
                art
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{current.title}</p>
                <p className={cn("truncate text-xs", error ? "text-danger" : "text-muted")}>
                  {error ? errorMessage : current.artist}
                </p>
              </div>
            </div>

            {/* 컨트롤 + 스크러버 */}
            <div className="flex flex-[2] flex-col items-center gap-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={player.prev}
                  aria-label="이전 곡"
                  className={iconBtn}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M7 6h2v12H7zM20 6v12l-9-6z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={player.toggle}
                  aria-label={isPlaying ? "일시정지" : "재생"}
                  className={cn(
                    iconBtn,
                    "h-10 w-10 bg-primary text-white hover:bg-primary-hover hover:text-white",
                  )}
                >
                  {isPlaying ? (
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      width="22"
                      height="22"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={player.next}
                  aria-label="다음 곡"
                  className={iconBtn}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M15 6h2v12h-2zM4 6l9 6-9 6z" />
                  </svg>
                </button>
              </div>

              <div className="hidden w-full items-center gap-2 sm:flex">
                <span className="w-9 shrink-0 text-right text-2xs tabular-nums text-muted">
                  {formatAudioTime(currentTime)}
                </span>
                <Waveform
                  className="flex-1"
                  height={28}
                  seed={current.slug || `${current.title}-${current.artist}`}
                  progress={progress}
                  playing={isPlaying}
                  bars={bars}
                  onSeek={(frac) => player.seek(frac * (duration || 0))}
                />
                <span className="w-9 shrink-0 text-2xs tabular-nums text-muted">
                  {formatAudioTime(duration)}
                </span>
              </div>
            </div>

            {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
          </div>
        </div>
      )}
    </>
  );
});
