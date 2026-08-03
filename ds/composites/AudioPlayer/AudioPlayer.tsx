"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface AudioPlayerProps {
  /** 오디오 URL */
  src: string;
  /** 트랙 제목 */
  title?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 오디오 플레이백 컨트롤(재생/정지/시킹)이 포함된 플레이어.
 * @example
 * <AudioPlayer src="/audio/song.mp3" title="My Song" />
 * @status stable
 * @since 2.2.0
 * @tags media
 */
export function AudioPlayer({ src, title, className }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play();
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  }, []);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card",
        // 면이 있는 카드 — 얕은 그림자 + 상단 인셋 하이라이트로 표면을 세운다
        "shadow-[0_1px_2px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.12)]",
        className,
      )}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a) {
            setCurrentTime(a.currentTime);
            // 메타데이터 전이면 duration 이 NaN/0 이다. scaleX(NaN) 은 transform 선언
            // 자체를 무효화해 막대가 가득 찬 것처럼 보이므로 0 으로 눌러 둔다
            setProgress(a.duration > 0 ? (a.currentTime / a.duration) * 100 : 0);
          }
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          "shrink-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer",
          // 누름 반응이 transform 이라 전이 대상에 명시한다. 감속 요청은 색이 아니라
          // 움직임만 끈다 — scale 만 100 으로 고정하고 색 전이는 남긴다
          "transition-[background-color,transform] duration-150 hover:bg-primary-hover",
          "active:scale-[0.94] motion-reduce:active:scale-100",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
        aria-label={playing ? "일시정지" : "재생"}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="3" y="2" width="3" height="10" rx="1" />
            <rect x="8" y="2" width="3" height="10" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M4 2l8 5-8 5z" />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-medium text-foreground truncate">{title}</p>}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted tabular-nums shrink-0">{fmt(currentTime)}</span>
          <div
            className="flex-1 h-1.5 bg-border rounded-full cursor-pointer overflow-hidden"
            onClick={handleSeek}
          >
            {/* width 전이는 매 timeupdate 마다 리플로우를 낸다 — 합성만으로 끝나는 scaleX 로 채운다 */}
            <div
              className="h-full w-full bg-primary rounded-full origin-left transition-transform duration-150 ease-linear motion-reduce:transition-none"
              style={{ transform: `scaleX(${progress / 100})` }}
            />
          </div>
          <span className="text-[10px] text-muted tabular-nums shrink-0">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}
