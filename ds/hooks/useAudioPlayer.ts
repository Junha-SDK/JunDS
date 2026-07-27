"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

export interface PlayerTrack {
  /** 트랙 식별자 */
  slug: string;
  /** 곡 제목 */
  title: string;
  /** 아티스트명 */
  artist: string;
  /** 커버 이미지 URL (없으면 생성 커버로 대체 가능) */
  cover?: string;
  /** 오디오 파일 URL */
  src: string;
}

/** 재생 목록이 끝에 닿았을 때의 동작 */
export type RepeatMode = "off" | "one" | "all";

export interface AudioPlayerState {
  /** `<audio ref={audioRef} />` 에 연결할 ref */
  audioRef: RefObject<HTMLAudioElement | null>;
  /** 현재 트랙 인덱스 (아무것도 안 틀었으면 null) */
  index: number | null;
  /** 현재 트랙 객체 */
  current: PlayerTrack | null;
  /** 재생 중 여부 */
  isPlaying: boolean;
  /** 현재 재생 위치 (초) */
  currentTime: number;
  /** 트랙 길이 (초, 메타데이터 도착 전에는 0) */
  duration: number;
  /** 로드 실패 여부 (파일 없음·코덱 미지원 등) */
  error: boolean;
  /** 0~1 볼륨 */
  volume: number;
  /** 반복 모드 */
  repeat: RepeatMode;
  /** i 번째 트랙 재생. 이미 그 트랙이면 재생/일시정지 토글 */
  play: (i: number) => void;
  /** 현재 트랙 재생/일시정지 토글 */
  toggle: () => void;
  /** 다음 트랙 */
  next: () => void;
  /** 이전 트랙 (3초 이상 재생됐으면 현재 곡 처음으로) */
  prev: () => void;
  /** 초 단위로 이동 */
  seek: (t: number) => void;
  /** 볼륨 설정 (0~1) */
  setVolume: (v: number) => void;
  /** 반복 모드 설정 */
  setRepeat: (m: RepeatMode) => void;
  /** 정지하고 트랙 선택 해제 */
  stop: () => void;
}

export interface UseAudioPlayerOptions {
  /** 초기 볼륨 (0~1, 기본 1) */
  initialVolume?: number;
  /** 초기 반복 모드 (기본 `"all"` — 마지막 곡 다음에 첫 곡으로 돌아간다) */
  initialRepeat?: RepeatMode;
}

/**
 * 재생 목록 하나를 굴리는 오디오 재생 엔진 훅.
 *
 * 표준 `HTMLAudioElement` 만 쓰고 외부 라이브러리에 의존하지 않는다. 훅은 상태만
 * 관리하고 화면은 호출부가 그리므로, 같은 엔진 위에 미니 바·전체 화면 플레이어·
 * 트랙 리스트를 동시에 얹을 수 있다.
 *
 * 재생 상태는 `play`/`pause` **이벤트**로 갱신하므로, 사용자가 OS 미디어 키나
 * 이어폰 버튼으로 조작해도 UI 가 어긋나지 않는다.
 *
 * `<audio>` 엘리먼트는 호출부가 직접 렌더해서 `audioRef` 를 걸어야 한다.
 *
 * @param tracks - 재생 목록. 배열이 바뀌어도 현재 재생은 끊기지 않는다.
 *
 * @example
 * ```tsx
 * const player = useAudioPlayer(tracks);
 * return (
 *   <>
 *     <audio ref={player.audioRef} />
 *     <button onClick={player.toggle}>{player.isPlaying ? "일시정지" : "재생"}</button>
 *   </>
 * );
 * ```
 */
export function useAudioPlayer(
  tracks: PlayerTrack[],
  options: UseAudioPlayerOptions = {},
): AudioPlayerState {
  const { initialVolume = 1, initialRepeat = "all" } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // tracks 는 매 렌더 새 배열일 수 있다. 이벤트 핸들러가 항상 최신 목록을 보되
  // 리스너를 재등록하지는 않도록 ref 로 넘긴다.
  const tracksRef = useRef(tracks);
  tracksRef.current = tracks;

  const [index, setIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(false);
  const [volume, setVolumeState] = useState(initialVolume);
  const [repeat, setRepeat] = useState<RepeatMode>(initialRepeat);

  const repeatRef = useRef(repeat);
  repeatRef.current = repeat;

  const current = index === null ? null : (tracks[index] ?? null);

  const next = useCallback(() => {
    setIndex((i) => {
      const n = tracksRef.current.length;
      if (i === null || n === 0) return i;
      const last = i === n - 1;
      // repeat "off" 는 마지막 곡에서 더 넘어가지 않는다
      if (last && repeatRef.current === "off") return i;
      return (i + 1) % n;
    });
  }, []);

  const prev = useCallback(() => {
    // 3초 넘게 재생됐으면 "이전 곡"이 아니라 "현재 곡 처음으로"가 자연스럽다
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => {
      const n = tracksRef.current.length;
      if (i === null || n === 0) return i;
      return (i - 1 + n) % n;
    });
  }, []);

  // 오디오 엘리먼트 이벤트 → 상태 동기화. 한 번만 등록한다.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onEnd = () => {
      if (repeatRef.current === "one") {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      next();
    };
    const onErr = () => {
      setError(true);
      setIsPlaying(false);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("durationchange", onMeta);
    audio.addEventListener("ended", onEnd);
    audio.addEventListener("error", onErr);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("durationchange", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.removeEventListener("error", onErr);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [next]);

  // 트랙이 바뀌면 로드 후 자동 재생.
  // src 가 아니라 index 에만 반응해야 한다 — 같은 곡을 다시 고른 경우는
  // play() 안에서 토글로 처리하므로 여기서 재로드하면 재생이 끊긴다.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || current === null) return;
    setError(false);
    setCurrentTime(0);
    setDuration(0);
    audio.src = current.src;
    audio.load();
    const p = audio.play();
    // 자동재생 정책상 사용자 제스처 없이는 거부될 수 있다 — 조용히 일시정지 상태로
    if (p && typeof p.catch === "function") p.catch(() => setIsPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // 볼륨은 상태가 곧 엘리먼트 속성
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
  }, [volume, index]);

  const play = useCallback((i: number) => {
    setIndex((cur) => {
      if (cur === i) {
        const audio = audioRef.current;
        if (audio) {
          if (audio.paused) void audio.play();
          else audio.pause();
        }
        return cur;
      }
      return i;
    });
  }, []);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || index === null) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }, [index]);

  const seek = useCallback((t: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = t;
    setCurrentTime(t);
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(Math.min(1, Math.max(0, v)));
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setIndex(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  return {
    audioRef,
    index,
    current,
    isPlaying,
    currentTime,
    duration,
    error,
    volume,
    repeat,
    play,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    setRepeat,
    stop,
  };
}

/** 초를 `m:ss` 로 포맷한다. 음수/NaN 은 `0:00`. */
export function formatAudioTime(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
