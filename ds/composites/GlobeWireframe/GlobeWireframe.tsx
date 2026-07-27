"use client";

import { useEffect, useRef, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";

/** 지구본의 현재 회전각 (라디안) */
export interface GlobeRotation {
  /** 세로축(요) 회전 — 좌우로 도는 각 */
  rotY: number;
  /** 가로축(피치) 회전 — 위아래로 기우는 각 */
  rotX: number;
}

export interface GlobeWireframeProps extends HTMLAttributes<HTMLDivElement> {
  /** 캔버스 한 변의 크기 (px, 기본 400) */
  size?: number;
  /** 구의 반지름 비율 (0~1, 캔버스 절반 기준. 기본 0.8) */
  radiusRatio?: number;
  /** 위도선 개수 (기본 8) */
  latitudes?: number;
  /** 경도선 개수 (기본 14) */
  longitudes?: number;
  /** 선 색 (CSS 색 문자열, 기본 `"rgba(130, 160, 220, 1)"`) */
  strokeColor?: string;
  /** 선의 최대 불투명도 (기본 0.13) */
  maxOpacity?: number;
  /** 자동 회전 속도 (라디안/프레임, 0 이면 정지. 기본 0.002) */
  autoRotate?: number;
  /** 드래그로 돌릴 수 있게 할지 (기본 true) */
  draggable?: boolean;
  /**
   * 회전 상태를 바깥과 공유할 ref.
   *
   * 지구본 위에 마커를 얹는 등 같은 각도로 다른 것을 그려야 할 때 넘긴다.
   * 넘기면 이 컴포넌트가 매 프레임 여기에 최신 각도를 써 넣는다.
   */
  rotationRef?: React.MutableRefObject<GlobeRotation>;
  /** 접근성 라벨. 주지 않으면 장식으로 취급해 숨긴다 */
  ariaLabel?: string;
}

const TWO_PI = Math.PI * 2;
const SEGMENTS = 60;
/** 원근 투영 거리 — 작을수록 왜곡이 세진다 */
const PERSPECTIVE = 2.4;

/**
 * 캔버스로 그리는 와이어프레임 지구본 — 위도·경도선만으로 이루어진 구.
 *
 * 점으로 대륙을 찍는 `Globe` 와 달리 격자선만 남긴 형태라, 배경으로 깔거나 위에
 * 다른 것을 얹기 좋다. 뒤쪽으로 넘어간 선은 깊이에 따라 흐려지므로 별도의 은면
 * 제거 없이도 구의 앞뒤가 읽힌다.
 *
 * `rotationRef` 를 주면 매 프레임 현재 각도가 기록되므로, 같은 각도로 마커·라벨
 * 같은 것을 겹쳐 그릴 수 있다. 드래그 회전은 포인터 캡처를 쓰므로 캔버스 밖으로
 * 끌어도 끊기지 않는다.
 *
 * `prefers-reduced-motion` 에서는 자동 회전이 멈춘다 — 드래그는 그대로 된다.
 *
 * @example
 * <GlobeWireframe size={520} autoRotate={0.0015} />
 * @status stable
 * @since 2.3.0
 * @tags data-display, canvas
 */
export function GlobeWireframe({
  size = 400,
  radiusRatio = 0.8,
  latitudes = 8,
  longitudes = 14,
  strokeColor = "rgba(130, 160, 220, 1)",
  maxOpacity = 0.13,
  autoRotate = 0.002,
  draggable = true,
  rotationRef,
  ariaLabel,
  className,
  ...props
}: GlobeWireframeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const internalRot = useRef<GlobeRotation>({ rotY: 0, rotX: 0.3 });
  const rot = rotationRef ?? internalRot;

  // 드래그 중에는 자동 회전을 멈춘다 — 손으로 돌리는 동안 계속 흘러가면 미끄럽다
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = size / 2;
    const cy = size / 2;
    const radius = (size / 2) * radiusRatio;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const spin = reduce ? 0 : autoRotate;

    /** 단위 구 위의 점을 화면 좌표로 투영한다 */
    const project = (nx: number, ny: number, nz: number, rotY: number, rotX: number) => {
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = nx * cosY - nz * sinY;
      const z1 = nx * sinY + nz * cosY;
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const y2 = ny * cosX - z1 * sinX;
      const z2 = ny * sinX + z1 * cosX;
      const s = PERSPECTIVE / (PERSPECTIVE + z2);
      return { sx: cx + x1 * radius * s, sy: cy - y2 * radius * s, z: z2 };
    };

    /** 뒤로 넘어갈수록 흐려지는 선분. 완전히 뒤면 아예 그리지 않는다 */
    const seg = (
      ax: number, ay: number, az: number,
      bx: number, by: number, bz: number,
    ) => {
      const depthA = (az + 1) / 2;
      const depthB = (bz + 1) / 2;
      if (depthA < 0.12 && depthB < 0.12) return;
      const avg = (depthA + depthB) / 2;
      const alpha = Math.max(0, (avg - 0.12) / 0.88) * maxOpacity;
      if (alpha < 0.005) return;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    };

    let raf = 0;
    const draw = () => {
      if (spin && !dragging.current) rot.current.rotY += spin;

      ctx.clearRect(0, 0, size, size);
      const { rotY, rotX } = rot.current;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 0.5;
      ctx.lineCap = "round";

      // 위도 링
      for (let li = 1; li < latitudes; li++) {
        const phi = (li / latitudes) * Math.PI;
        const ny = Math.cos(phi);
        const rr = Math.sin(phi);
        let prev = project(rr, ny, 0, rotY, rotX);
        for (let si = 1; si <= SEGMENTS; si++) {
          const theta = (si / SEGMENTS) * TWO_PI;
          const cur = project(rr * Math.cos(theta), ny, rr * Math.sin(theta), rotY, rotX);
          seg(prev.sx, prev.sy, prev.z, cur.sx, cur.sy, cur.z);
          prev = cur;
        }
      }

      // 경도 자오선
      for (let mi = 0; mi < longitudes; mi++) {
        const theta = (mi / longitudes) * TWO_PI;
        const ct = Math.cos(theta);
        const st = Math.sin(theta);
        let prev = project(0, 1, 0, rotY, rotX);
        for (let si = 1; si <= SEGMENTS; si++) {
          const phi = (si / SEGMENTS) * Math.PI;
          const ny = Math.cos(phi);
          const rr = Math.sin(phi);
          const cur = project(rr * ct, ny, rr * st, rotY, rotX);
          seg(prev.sx, prev.sy, prev.z, cur.sx, cur.sy, cur.z);
          prev = cur;
        }
      }

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(raf);
  }, [size, radiusRatio, latitudes, longitudes, strokeColor, maxOpacity, autoRotate, rot]);

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggable) return;
    // 캔버스 밖으로 끌어도 회전이 이어지도록 포인터를 붙잡는다
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    last.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!draggable || !dragging.current) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    rot.current.rotY += dx * 0.005;
    // 위아래는 극을 넘기지 않게 죈다 — 넘어가면 구가 뒤집혀 방향 감각을 잃는다
    rot.current.rotX = Math.max(
      -Math.PI / 2,
      Math.min(Math.PI / 2, rot.current.rotX + dy * 0.005),
    );
  };

  const endDrag = () => {
    dragging.current = false;
  };

  return (
    <div
      className={cn("inline-block", className)}
      aria-label={ariaLabel}
      role={ariaLabel ? "img" : undefined}
      aria-hidden={ariaLabel ? undefined : true}
      {...props}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={cn("block", draggable && "cursor-grab touch-none active:cursor-grabbing")}
      />
    </div>
  );
}
