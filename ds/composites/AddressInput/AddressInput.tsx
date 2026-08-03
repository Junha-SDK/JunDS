"use client";
import { useState } from "react";
import { cn } from "../../utils/cn";

export interface AddressInputProps {
  /** 주소 선택 콜백 */
  onSelect?: (address: { zonecode: string; address: string; detail: string }) => void;
  /** 주소 입력 플레이스홀더 */
  placeholder?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 추가 클래스 */
  className?: string;
}

/**
 * 주소 검색 자동완성 입력기.
 * @example
 * <AddressInput onSelect={(addr) => setAddress(addr)} placeholder="주소 검색" />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function AddressInput({
  onSelect,
  placeholder = "주소 검색",
  disabled,
  className,
}: AddressInputProps) {
  const [zonecode, setZonecode] = useState("");
  const [address, setAddress] = useState("");
  const [detail, setDetail] = useState("");

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetail(e.target.value);
    onSelect?.({ zonecode, address, detail: e.target.value });
  };

  return (
    <div className={cn("space-y-2", disabled && "opacity-50", className)}>
      <div className="flex gap-2">
        <input
          value={zonecode}
          readOnly
          placeholder="우편번호"
          className={cn(
            // 읽기 전용 칸은 "입력 불가"가 표면색으로 읽혀야 한다. bg-gray-50 은 다크에서
            // 그 대비가 뒤집히므로 surface-soft 토큰으로 옮긴다.
            "w-28 h-9 px-3 text-sm border border-border rounded-xl bg-surface-soft text-muted outline-none tabular-nums",
          )}
          disabled={disabled}
        />
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setZonecode("06134");
            setAddress("서울특별시 강남구 테헤란로 123");
            onSelect?.({ zonecode: "06134", address: "서울특별시 강남구 테헤란로 123", detail });
          }}
          className={cn(
            "h-9 px-4 text-sm font-medium bg-primary text-white rounded-xl shrink-0",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
            "transition-[background-color,transform] duration-150 cursor-pointer hover:bg-primary-hover active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:opacity-50 disabled:cursor-not-allowed",
          )}
        >
          주소 검색
        </button>
      </div>
      <input
        value={address}
        readOnly
        placeholder={placeholder}
        className="w-full h-9 px-3 text-sm border border-border rounded-xl bg-surface-soft text-muted outline-none"
        disabled={disabled}
      />
      <input
        value={detail}
        onChange={handleDetailChange}
        placeholder="상세주소 입력"
        className={cn(
          "w-full h-9 px-3 text-sm border border-border rounded-xl bg-card outline-none",
          "transition-[border-color,box-shadow] duration-200 ease-out",
          "hover:border-muted-light focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
        )}
        disabled={disabled}
      />
    </div>
  );
}
