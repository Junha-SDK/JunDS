"use client";
import { useEffect, useState, useCallback } from "react";
import { cn } from "../../utils/cn";

export interface ConfettiProps {
  /** 활성화 여부 */
  active: boolean;
  /** 파티클 수 */
  count?: number;
  /** 애니메이션 지속 시간(ms) */
  duration?: number;
  /** 추가 클래스 */
  className?: string;
}

const COLORS = [
  "var(--primary)",
  "var(--success)",
  "var(--warning)",
  "var(--danger)",
  "var(--info)",
  "var(--accent)",
];

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  size: number;
  type: "square" | "circle" | "strip";
  /** 회전 주기(ms). 렌더에서 뽑으면 리렌더마다 값이 튄다 — 생성 시점에 고정한다 */
  spinMs: number;
}

/**
 * 축하/완료 시점에 화면을 가득 채우는 색종이 효과.
 * @example
 * <Confetti active={success} count={150} duration={3000} />
 * @status stable
 * @since 2.2.0
 * @tags feedback
 */
export function Confetti({ active, count = 50, duration = 3000, className }: ConfettiProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const generate = useCallback(() => {
    const types: Particle["type"][] = ["square", "circle", "strip"];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 500,
      rotation: Math.random() * 360,
      size: 6 + Math.random() * 6,
      type: types[Math.floor(Math.random() * types.length)],
      spinMs: 600 + Math.random() * 400,
    }));
  }, [count]);

  useEffect(() => {
    if (!active) {
      setParticles([]);
      return;
    }
    setParticles(generate());
    const timer = setTimeout(() => setParticles([]), duration);
    return () => clearTimeout(timer);
  }, [active, generate, duration]);

  if (particles.length === 0) return null;

  return (
    <div
      // 순수 장식이고 화면 전체가 움직인다 — 감속을 요청했으면 아예 그리지 않는다.
      // (애니메이션이 인라인 style 이라 `motion-reduce:animate-none` 으로는 못 이긴다)
      className={cn(
        "fixed inset-0 z-[9999] pointer-events-none overflow-hidden motion-reduce:hidden",
        className,
      )}
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0"
          style={{
            left: `${p.x}%`,
            animationDelay: `${p.delay}ms`,
            animation: `confetti-fall ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
          }}
        >
          <div
            style={{
              width: p.type === "strip" ? p.size * 0.4 : p.size,
              height: p.type === "strip" ? p.size * 1.5 : p.size,
              backgroundColor: p.color,
              borderRadius: p.type === "circle" ? "50%" : "2px",
              transform: `rotate(${p.rotation}deg)`,
              animation: `confetti-spin ${p.spinMs}ms linear infinite`,
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
        @keyframes confetti-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
