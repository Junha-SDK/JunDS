"use client";

import { cn } from "../../utils/cn";
import { Modal } from "../Modal";
import { AlbumArt } from "../AlbumArt";
import { Waveform } from "../Waveform";
import { Lyrics } from "../Lyrics";
import { useDominantColor } from "../../hooks/useDominantColor";
import { formatAudioTime, type AudioPlayerState } from "../../hooks/useAudioPlayer";

export interface NowPlayingFullProps {
  /** 열림 여부 */
  open: boolean;
  /** 닫기 요청 (Escape·백드롭·닫기 버튼) */
  onClose: () => void;
  /** `useAudioPlayer()` 가 돌려준 상태 */
  player: AudioPlayerState;
  /**
   * 현재 트랙의 가사. 빈 줄로 연을 나눈 원문.
   * 없으면 가사 칼럼 없이 플레이어만 가운데 놓인다.
   */
  lyrics?: string;
  /** 배경에 크게 흐려 깔 이미지 (기본: 현재 트랙의 커버) */
  backdropImage?: string;
  /** 파형 막대 개수 (기본 72) */
  bars?: number;
  /** 추가 클래스 */
  className?: string;
}

const ctrlBtn =
  "grid place-items-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2";

/**
 * 전체 화면 Now Playing — 커버색으로 물든 배경 · 큰 커버 · 파형 · 가사.
 *
 * `NowPlayingBar` 와 **같은 `useAudioPlayer` 상태를 공유한다.** 오디오를 따로 갖지
 * 않고 같은 재생의 다른 화면일 뿐이라, 바에서 열어도 재생이 끊기지 않는다.
 *
 * 배경은 커버에서 뽑은 색으로 물들인다 — 앨범마다 화면 전체의 인상이 달라져서,
 * 지금 무엇을 듣고 있는지가 제목을 읽지 않아도 전해진다.
 *
 * @example
 * ```tsx
 * const player = useAudioPlayer(tracks);
 * <NowPlayingBar player={player} onExpand={() => setOpen(true)} />
 * <NowPlayingFull open={open} onClose={() => setOpen(false)} player={player} lyrics={song?.lyrics} />
 * ```
 * @status stable
 * @since 2.3.0
 * @tags media, audio, overlay
 */
export function NowPlayingFull({
  open,
  onClose,
  player,
  lyrics,
  backdropImage,
  bars = 72,
  className,
}: NowPlayingFullProps) {
  const { current, isPlaying, currentTime, duration } = player;
  const seed = current ? `${current.title}-${current.artist}` : undefined;
  const colors = useDominantColor(current?.cover, seed);
  const progress = duration > 0 ? currentTime / duration : 0;
  const backdrop = backdropImage ?? current?.cover;

  return (
    <Modal
      open={open && Boolean(current)}
      onClose={onClose}
      size="full"
      className={cn(
        "!bg-transparent !rounded-none !shadow-none !max-h-none h-[calc(100vh-2rem)]",
        className,
      )}
    >
      {current && (
        <div
          className="relative flex h-full w-full overflow-hidden rounded-2xl"
          style={{ background: `linear-gradient(160deg, ${colors.tint}, ${colors.deep})` }}
        >
          {/* 커버를 크게 흐려 깐 배경. 커버가 없으면 위의 그라디언트만 남는다 */}
          {backdrop && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 scale-125 bg-cover bg-center opacity-35 blur-3xl"
              style={{ backgroundImage: `url("${backdrop}")` }}
            />
          )}

          {/* ── 플레이어 ── */}
          <div
            className={cn(
              "relative z-10 flex flex-col items-center justify-center gap-5 p-8",
              lyrics ? "w-full max-w-md shrink-0" : "mx-auto w-full max-w-md",
            )}
          >
            <AlbumArt
              src={current.cover}
              seed={seed ?? current.slug}
              size="min(60vw, 300px)"
              radius="lg"
              className="shadow-2xl"
            />

            <div className="text-center">
              <p className="text-xl font-semibold text-white">{current.title}</p>
              <p className="text-sm text-white/70">{current.artist}</p>
            </div>

            <div className="flex w-full items-center gap-3">
              <span className="w-10 shrink-0 text-right text-2xs tabular-nums text-white/60">
                {formatAudioTime(currentTime)}
              </span>
              <Waveform
                className="flex-1 [&>span]:!bg-white/25 [&>span.bg-primary]:!bg-white"
                height={36}
                seed={current.slug || (seed ?? current.title)}
                progress={progress}
                playing={isPlaying}
                bars={bars}
                onSeek={(f) => player.seek(f * duration)}
                aria-label={`${current.title} 재생 위치`}
              />
              <span className="w-10 shrink-0 text-2xs tabular-nums text-white/60">
                {formatAudioTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={player.prev} aria-label="이전 곡" className={cn(ctrlBtn, "h-11 w-11")}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                  <path d="M7 6h2v12H7zM20 6v12l-9-6z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={player.toggle}
                aria-label={isPlaying ? "일시정지" : "재생"}
                className={cn(ctrlBtn, "h-14 w-14 bg-white/15")}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
                    <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <button type="button" onClick={player.next} aria-label="다음 곡" className={cn(ctrlBtn, "h-11 w-11")}>
                <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                  <path d="M15 6h2v12h-2zM4 6l9 6-9 6z" />
                </svg>
              </button>
            </div>
          </div>

          {/* ── 가사 (있을 때만, 독립 스크롤) ── */}
          {lyrics && (
            <Lyrics
              text={lyrics}
              progress={progress}
              aria-label={`${current.title} 가사`}
              className="relative z-10 hidden flex-1 px-10 py-16 text-white md:block"
            />
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className={cn(ctrlBtn, "absolute right-4 top-4 z-20 h-10 w-10")}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      )}
    </Modal>
  );
}
