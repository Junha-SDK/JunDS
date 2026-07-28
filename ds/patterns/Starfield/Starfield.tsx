"use client";

import { useEffect, useRef } from "react";
import { cn } from "../../utils";

const TWO_PI = Math.PI * 2;
const COLORS = ["#fff", "#fff", "#fff", "#ffeedd", "#dde8ff", "#cce0ff"];

/** 별 하나의 정보 */
type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
  color: string;
  bright: boolean;
};

/** 유성 하나의 정보 */
type Shooting = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
};

/**
 * Canvas 기반 애니메이션 별 배경 컴포넌트
 *
 * - 반짝이는 별들과 유성 애니메이션
 * - requestAnimationFrame 기반 부드러운 렌더링
 * - 언마운트 시 자동 정리
 */
export interface StarfieldProps {
  /** 별 개수 */
  starCount?: number;
  /** 유성 간격 (초) */
  shootingStarInterval?: number;
  /** 배경색 */
  backgroundColor?: string;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 별이 흐르는 우주 배경 애니메이션.
 * @example
 * <Starfield starCount={200} shootingStarInterval={3000} backgroundColor="#000" />
 * @status stable
 * @since 2.2.0
 * @tags misc
 */
export function Starfield({
  starCount = 220,
  shootingStarInterval = 5,
  backgroundColor = "#0b0d1a",
  className,
}: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 화면 전체가 계속 반짝이고 유성이 가로지른다 — 감속 요청이면 한 장만 그리고 멈춘다
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const dpr = window.devicePixelRatio || 1;
    let w: number;
    let h: number;

    const stars: Star[] = [];
    const shootings: Shooting[] = [];

    for (let i = 0; i < starCount; i++) {
      const bright = Math.random() < 0.05;
      stars.push({
        x: 0,
        y: 0,
        r: bright ? Math.random() * 1.0 + 1.2 : Math.random() * 1.2 + 0.15,
        a: bright ? Math.random() * 0.25 + 0.55 : Math.random() * 0.4 + 0.08,
        phase: Math.random() * TWO_PI,
        speed: Math.random() * 0.4 + 0.7,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        bright,
      });
    }

    let lastShoot = 0;
    let t = 0;
    let raf: number;
    const intervalMs = shootingStarInterval * 1000;

    function resize() {
      const parent = canvas!.parentElement;
      w = parent ? parent.clientWidth : window.innerWidth;
      h = parent ? parent.clientHeight : window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const s of stars) {
        s.x = Math.random() * w;
        s.y = Math.random() * h;
      }
      // 정지 모드에선 rAF 루프가 없으니 리사이즈마다 한 장을 다시 그려야 한다
      if (reduced) draw(0);
    }
    resize();

    function draw(now: number) {
      ctx!.clearRect(0, 0, w, h);
      t += 0.01;

      /* --- 별 --- */
      for (const s of stars) {
        const tw = Math.sin(t * s.speed + s.phase);
        const alpha = s.a * (tw * 0.2 + 0.8);
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = s.color;
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, TWO_PI);
        ctx!.fill();

        if (s.bright) {
          ctx!.globalAlpha = alpha * 0.35;
          ctx!.strokeStyle = s.color;
          ctx!.lineWidth = 0.5;
          const l = s.r * 3;
          ctx!.beginPath();
          ctx!.moveTo(s.x - l, s.y);
          ctx!.lineTo(s.x + l, s.y);
          ctx!.moveTo(s.x, s.y - l);
          ctx!.lineTo(s.x, s.y + l);
          ctx!.stroke();
        }
      }

      /* --- 유성 --- */
      if (!reduced && now - lastShoot > intervalMs) {
        const left = Math.random() > 0.5;
        shootings.push({
          x: left ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
          y: Math.random() * h * 0.4,
          vx: (left ? 1 : -1) * (Math.random() * 3 + 5),
          vy: Math.random() * 1.5 + 1.5,
          life: 0,
          max: Math.random() * 25 + 25,
          size: Math.random() * 1 + 0.8,
        });
        lastShoot = now;
      }

      for (let i = shootings.length - 1; i >= 0; i--) {
        const s = shootings[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const p = s.life / s.max;
        if (p >= 1) {
          shootings.splice(i, 1);
          continue;
        }
        const a = p < 0.2 ? p / 0.2 : 1 - (p - 0.2) / 0.8;

        ctx!.globalAlpha = a * 0.8;
        ctx!.strokeStyle = "#fff";
        ctx!.lineWidth = s.size;
        ctx!.lineCap = "round";
        ctx!.beginPath();
        ctx!.moveTo(s.x, s.y);
        ctx!.lineTo(s.x - s.vx * 5, s.y - s.vy * 5);
        ctx!.stroke();
      }

      ctx!.globalAlpha = 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [starCount, shootingStarInterval]);

  return (
    <div
      className={cn("relative w-full h-full overflow-hidden", className)}
      style={{ backgroundColor }}
    >
      {/* 장식용 배경이다 — 스크린리더가 읽을 것이 없다 */}
      <canvas ref={canvasRef} className="absolute inset-0 block" aria-hidden="true" />
    </div>
  );
}
