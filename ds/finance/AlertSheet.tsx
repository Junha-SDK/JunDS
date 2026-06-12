"use client";

import { useState } from "react";
import {
  BottomSheet,
  Button,
  Input,
  useDsToast,
} from "@junds/ui";
import { addAlert, type AlertDirection } from "./lib/alerts";
import { currentTick } from "./lib/livePrices";
import { SegmentedPill } from "./SegmentedPill";

interface AlertSheetProps {
  open: boolean;
  onClose: () => void;
  name: string;
}

export function AlertSheet({ open, onClose, name }: AlertSheetProps) {
  const tick = currentTick(name);
  const [direction, setDirection] = useState<AlertDirection>("above");
  const [value, setValue] = useState<string>(() =>
    Math.round(tick.price * 1.05).toString(),
  );
  const toast = useDsToast();

  const numeric = Number(value.replace(/,/g, ""));
  const valid = Number.isFinite(numeric) && numeric > 0;
  const delta =
    valid && tick.price > 0 ? ((numeric - tick.price) / tick.price) * 100 : 0;

  function submit() {
    if (!valid) return;
    addAlert({
      name,
      target: numeric,
      direction,
      basePrice: tick.price,
    });
    toast.success(`${name} 알림이 등록되었습니다`);
    onClose();
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="가격 알림 등록" height="auto">
      <div className="px-4 pb-5 pt-1">
        <div className="text-[13px] text-[color:var(--bm-muted)] font-semibold">
          종목
        </div>
        <div className="text-[18px] font-extrabold mt-0.5">{name}</div>
        <div className="mt-1 flex items-baseline gap-2 text-[12.5px]">
          <span className="text-[color:var(--bm-muted)]">현재가</span>
          <span className="bm-num font-bold">
            {tick.price.toLocaleString("ko-KR")}
          </span>
        </div>

        <div className="mt-4">
          <div className="text-[12px] font-bold text-[color:var(--bm-muted)] mb-1.5">
            조건
          </div>
          <SegmentedPill
            options={[
              { key: "above", label: "이상 ↑" },
              { key: "below", label: "이하 ↓" },
            ]}
            value={direction}
            onChange={(v) => setDirection(v as AlertDirection)}
            size="md"
            fullWidth
          />
        </div>

        <div className="mt-4">
          <div className="text-[12px] font-bold text-[color:var(--bm-muted)] mb-1.5">
            목표가
          </div>
          <Input
            size="lg"
            inputMode="numeric"
            value={value}
            onChange={(e) =>
              setValue(e.target.value.replace(/[^0-9.,]/g, ""))
            }
            leftSlot={<span style={{ fontWeight: 700 }}>₩</span>}
            rightSlot={
              <span className="text-[11px] text-[color:var(--bm-muted)] font-semibold bm-num">
                {valid
                  ? `${delta >= 0 ? "+" : ""}${delta.toFixed(2)}%`
                  : ""}
              </span>
            }
          />
          <div className="mt-2 flex items-center gap-2">
            {[0.95, 1.0, 1.05, 1.1, 1.2].map((m) => (
              <button
                key={m}
                onClick={() =>
                  setValue(Math.round(tick.price * m).toString())
                }
                className="bm-pill text-[11px] font-bold"
                style={{
                  background: "var(--bm-soft-100)",
                  color: "var(--bm-text)",
                  padding: "3px 10px",
                }}
              >
                {m === 1 ? "현재가" : `${Math.round((m - 1) * 100)}%`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" onClick={submit} disabled={!valid}>
            알림 등록
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
