"use client";
import { useMemo } from "react";
import { cn } from "../../utils/cn";

export interface QRCodeProps {
  value: string;
  size?: number;
  color?: string;
  bgColor?: string;
  className?: string;
}

// Simple QR-like pattern generator (visual representation)
function generateMatrix(text: string, moduleCount: number = 21): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));

  // Finder patterns (top-left, top-right, bottom-left)
  const addFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      matrix[r + i][c + j] = i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4);
    }
  };
  addFinder(0, 0);
  addFinder(0, moduleCount - 7);
  addFinder(moduleCount - 7, 0);

  // Data area - hash-based pattern from input
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  }
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      if (matrix[r][c]) continue;
      if (r < 9 && c < 9) continue;
      if (r < 9 && c > moduleCount - 9) continue;
      if (r > moduleCount - 9 && c < 9) continue;
      hash = ((hash << 5) - hash + r * moduleCount + c) | 0;
      matrix[r][c] = (hash & 3) === 0;
    }
  }
  return matrix;
}

export function QRCode({ value, size = 128, color = "#000000", bgColor = "#ffffff", className }: QRCodeProps) {
  const matrix = useMemo(() => generateMatrix(value), [value]);
  const moduleCount = matrix.length;
  const cellSize = size / moduleCount;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn(className)} role="img" aria-label={`QR 코드: ${value}`}>
      <rect width={size} height={size} fill={bgColor} />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize} width={cellSize} height={cellSize} fill={color} /> : null,
        ),
      )}
    </svg>
  );
}
