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
    if (a.paused) { a.play(); setPlaying(true); }
    else { a.pause(); setPlaying(false); }
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
    <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-white", className)}>
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          const a = audioRef.current;
          if (a) { setCurrentTime(a.currentTime); setProgress((a.currentTime / a.duration) * 100); }
        }}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />
      <button
        type="button"
        onClick={togglePlay}
        className="shrink-0 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary-hover transition-colors"
        aria-label={playing ? "일시정지" : "재생"}
      >
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="3" y="2" width="3" height="10" rx="1" /><rect x="8" y="2" width="3" height="10" rx="1" /></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><path d="M4 2l8 5-8 5z" /></svg>
        )}
      </button>
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-medium text-foreground truncate">{title}</p>}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted tabular-nums shrink-0">{fmt(currentTime)}</span>
          <div className="flex-1 h-1.5 bg-gray-200 rounded-full cursor-pointer" onClick={handleSeek}>
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] text-muted tabular-nums shrink-0">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}
