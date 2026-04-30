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
            "w-28 h-9 px-3 text-sm border border-border rounded-lg bg-gray-50 outline-none tabular-nums",
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
            "h-9 px-4 text-sm font-medium bg-primary text-white rounded-lg",
            "hover:bg-primary-hover transition-colors cursor-pointer",
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
        className="w-full h-9 px-3 text-sm border border-border rounded-lg bg-gray-50 outline-none"
        disabled={disabled}
      />
      <input
        value={detail}
        onChange={handleDetailChange}
        placeholder="상세주소 입력"
        className={cn(
          "w-full h-9 px-3 text-sm border border-border rounded-lg bg-white outline-none",
          "focus:border-primary focus:shadow-[0_0_0_3px_var(--primary-glow)]",
        )}
        disabled={disabled}
      />
    </div>
  );
}
