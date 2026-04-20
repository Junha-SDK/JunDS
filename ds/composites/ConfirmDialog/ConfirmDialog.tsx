"use client";
import { Modal } from "../Modal";
import { Button } from "../../primitives/Button";
import type { ReactNode } from "react";

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string | ReactNode;
  /** 확인 버튼 텍스트 */
  confirmLabel?: string;
  cancelLabel?: string;
  /** 위험 액션 여부 */
  danger?: boolean;
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
            <div className="w-10 h-10 rounded-full bg-danger-light flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L1.5 17.5h17L10 2z" stroke="var(--danger)" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M10 8v4M10 14.5h.01" stroke="var(--danger)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="var(--primary)" strokeWidth="1.5" />
                <path d="M10 7v4M10 13.5h.01" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          )}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
            {description && (
              <div className="text-sm text-muted">{description}</div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-border-light">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          variant={danger ? "danger" : "primary"}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
