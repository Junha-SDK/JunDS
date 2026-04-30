"use client";
import { cn } from "../../utils/cn";

export interface GlobeProps {
  /** 글로브 크기(px) */
  size?: number;
  /** 기본 색상 */
  color?: string;
  /** 점 색상 */
  dotColor?: string;
  /** 회전 속도 */
  speed?: number;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 회전하는 인터랙티브 3D 지구본.
 * @example
 * <Globe size={400} dotColor="#3b82f6" speed={0.5} />
 * @status stable
 * @since 2.2.0
 * @tags data-display
 */
export function Globe({
  size = 300,
  color = "var(--primary)",
  dotColor = "var(--primary-light)",
  speed = 20,
  className,
}: GlobeProps) {
  // Generate latitude/longitude dots
  const dots: { x: number; y: number; z: number; lat: number; lng: number }[] = [];
  for (let lat = -80; lat <= 80; lat += 20) {
    const latRad = (lat * Math.PI) / 180;
    const count = Math.round(18 * Math.cos(latRad));
    for (let i = 0; i < count; i++) {
      const lng = (360 / count) * i;
      const lngRad = (lng * Math.PI) / 180;
      const r = size / 2;
      dots.push({
        x: r * Math.cos(latRad) * Math.sin(lngRad),
        y: r * Math.sin(latRad),
        z: r * Math.cos(latRad) * Math.cos(lngRad),
        lat,
        lng,
      });
    }
  }

  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size, perspective: size * 2 }}
      aria-hidden="true"
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full opacity-20 blur-xl"
        style={{ backgroundColor: color }}
      />
      {/* Sphere outline */}
      <div
        className="absolute inset-0 rounded-full border-2 opacity-20"
        style={{ borderColor: color }}
      />
      {/* Rotating container */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          animation: `globe-spin ${speed}s linear infinite`,
        }}
      >
        {dots.map((dot, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 3,
              height: 3,
              backgroundColor: dotColor,
              left: "50%",
              top: "50%",
              transform: `translate(-50%, -50%) translate3d(${dot.x}px, ${dot.y}px, ${dot.z}px)`,
              opacity: 0.3 + (dot.z + size / 2) / size * 0.7,
            }}
          />
        ))}
      </div>
      {/* Equator ring */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-10"
        style={{ width: size, height: size, borderColor: color, transform: "translate(-50%, -50%) rotateX(75deg)" }}
      />
      <style>{`
        @keyframes globe-spin {
          from { transform: rotateY(0deg); }
          to { transform: rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
