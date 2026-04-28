"use client";
import { useRef, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
}

export function VideoPlayer({ src, poster, autoPlay, muted: initMuted, loop, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(autoPlay ?? false);
  const [progress, setProgress] = useState(0);
  const [muted, setMuted] = useState(initMuted ?? false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  }, []);

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (!v) return;
    setCurrentTime(v.currentTime);
    setProgress((v.currentTime / v.duration) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const rect = e.currentTarget.getBoundingClientRect();
    v.currentTime = ((e.clientX - rect.left) / rect.width) * v.duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("relative rounded-xl overflow-hidden bg-black group", className)}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
        onClick={togglePlay}
        className="w-full block cursor-pointer"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="h-1 bg-white/30 rounded-full cursor-pointer mb-2" onClick={handleSeek}>
          <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-3">
          <button type="button" onClick={togglePlay} className="text-white cursor-pointer" aria-label={playing ? "일시정지" : "재생"}>
            {playing ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="4" height="12" rx="1" /><rect x="9" y="2" width="4" height="12" rx="1" /></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2l10 6-10 6z" /></svg>
            )}
          </button>
          <span className="text-xs text-white/80 tabular-nums">{fmt(currentTime)} / {fmt(duration)}</span>
          <button type="button" onClick={() => setMuted(!muted)} className="ml-auto text-white cursor-pointer" aria-label={muted ? "음소거 해제" : "음소거"}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 6h3l4-3v10l-4-3H2V6z" stroke="currentColor" strokeWidth="1.5" />
              {muted ? (
                <path d="M12 5l-4 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M12 5.5c1 1 1 4 0 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
