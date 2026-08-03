"use client";
import { Modal } from "../Modal";
import { Button } from "../../primitives/Button";
import type { ReactNode } from "react";

export interface ConfirmDialogProps {
  /** 열림 상태 */
  open: boolean;
  /** 닫기 콜백 */
  onClose: () => void;
  /** 확인 콜백 */
  onConfirm: () => void;
  /** 다이얼로그 제목 */
  title: string;
  /** 본문 설명 */
  description?: string | ReactNode;
  /** 확인 버튼 텍스트 */
  confirmLabel?: string;
  /** 취소 버튼 텍스트 */
  cancelLabel?: string;
  /** 위험 액션 여부 */
  danger?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
}

/**
 * 확인 다이얼로그
 * @example
 * <ConfirmDialog
 *   open={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="정말 삭제하시겠습니까?"
 *   description="이 작업은 되돌릴 수 없습니다."
 *   danger
 *   confirmLabel="삭제"
 * />
 * @status stable
 * @since 2.2.0
 * @tags overlay, feedback
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  danger,
  loading,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="p-5">
        <div className="flex items-start gap-3">
          {danger ? (
            // 아이콘 배지는 색면 하나로 끝나 평평했다 — 얇은 링으로 면을 세운다.
            <div className="w-10 h-10 rounded-full bg-danger-light ring-1 ring-danger/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2L1.5 17.5h17L10 2z"
                  stroke="var(--danger)"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 8v4M10 14.5h.01"
                  stroke="var(--danger)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-light ring-1 ring-primary/20 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="var(--primary)" strokeWidth="1.5" />
                <path
                  d="M10 7v4M10 13.5h.01"
                  stroke="var(--primary)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
            {description && <div className="text-sm text-muted">{description}</div>}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-light">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
