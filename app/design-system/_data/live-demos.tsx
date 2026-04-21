"use client";
import { useState, useEffect } from "react";
import { cn } from "@/ds/utils/cn";

// Primitives
import { Button } from "@/ds/primitives/Button";
import { Toggle } from "@/ds/primitives/Toggle";
import { Switch } from "@/ds/primitives/Switch";
import { Checkbox } from "@/ds/primitives/Checkbox";
import { Spinner } from "@/ds/primitives/Spinner";
import { Badge } from "@/ds/primitives/Badge";
import { StarRating } from "@/ds/primitives/StarRating";
import { StatusDot } from "@/ds/primitives/StatusDot";
import { Slider } from "@/ds/primitives/Slider";
import { Input } from "@/ds/primitives/Input";

// Composites
import { ProgressBar } from "@/ds/composites/Progress";
import { Alert } from "@/ds/composites/Alert";
import { Tabs } from "@/ds/composites/Tabs";
import { Accordion } from "@/ds/composites/Accordion";
import { Stepper } from "@/ds/composites/Stepper";
import { Pagination } from "@/ds/composites/Pagination";
import { Skeleton } from "@/ds/composites/Skeleton";
import { Tooltip } from "@/ds/composites/Tooltip";
import { Timeline } from "@/ds/composites/Timeline";
import { Card } from "@/ds/composites/Card";

import type { ButtonVariant } from "@/ds/primitives/Button";
import type { AlertVariant } from "@/ds/composites/Alert";
import type { BadgeVariant } from "@/ds/primitives/Badge";
import type { SpinnerSize } from "@/ds/primitives/Spinner";
import type { StatusDotStatus } from "@/ds/primitives/StatusDot";
import type { TooltipPosition } from "@/ds/composites/Tooltip";

/* ─── 1. ButtonLiveDemo ─────────────────────── */
const buttonVariants: ButtonVariant[] = ["primary", "secondary", "danger", "ghost", "outline"];

export function ButtonLiveDemo() {
  const [idx, setIdx] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((p) => {
        const next = (p + 1) % buttonVariants.length;
        if (next === 0) setLoading(true);
        else setLoading(false);
        return next;
      });
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <Button variant={buttonVariants[idx]} loading={loading} size="sm">
        {buttonVariants[idx]}
      </Button>
    </div>
  );
}

/* ─── 2. ToggleLiveDemo ─────────────────────── */
export function ToggleLiveDemo() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setOn((p) => !p), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <Toggle checked={on} onChange={setOn} label={on ? "ON" : "OFF"} />
    </div>
  );
}

/* ─── 3. SwitchLiveDemo ─────────────────────── */
export function SwitchLiveDemo() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  const [c, setC] = useState(false);

  useEffect(() => {
    const id1 = setInterval(() => setA((p) => !p), 700);
    const id2 = setInterval(() => setB((p) => !p), 1000);
    const id3 = setInterval(() => setC((p) => !p), 1300);
    return () => {
      clearInterval(id1);
      clearInterval(id2);
      clearInterval(id3);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 items-start justify-center h-full px-3">
      <Switch checked={a} onChange={setA} label="Wi-Fi" size="sm" />
      <Switch checked={b} onChange={setB} label="Bluetooth" size="sm" />
      <Switch checked={c} onChange={setC} label="Airdrop" size="sm" />
    </div>
  );
}

/* ─── 4. CheckboxLiveDemo ───────────────────── */
export function CheckboxLiveDemo() {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  const [c, setC] = useState(false);

  useEffect(() => {
    const id1 = setInterval(() => setA((p) => !p), 800);
    const id2 = setInterval(() => setB((p) => !p), 1100);
    const id3 = setInterval(() => setC((p) => !p), 1400);
    return () => {
      clearInterval(id1);
      clearInterval(id2);
      clearInterval(id3);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 items-start justify-center h-full px-3">
      <Checkbox checked={a} onChange={() => setA((p) => !p)} label="Design" size="sm" />
      <Checkbox checked={b} onChange={() => setB((p) => !p)} label="Develop" size="sm" />
      <Checkbox checked={c} onChange={() => setC((p) => !p)} label="Deploy" size="sm" />
    </div>
  );
}

/* ─── 5. ProgressBarLiveDemo ────────────────── */
export function ProgressBarLiveDemo() {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setValue((p) => (p >= 100 ? 0 : p + 2));
    }, 60);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-1 justify-center h-full px-3">
      <ProgressBar value={value} showLabel animated size="md" />
    </div>
  );
}

/* ─── 6. StarRatingLiveDemo ─────────────────── */
const starSequence = [1, 2, 3, 4, 5, 4, 3, 2];

export function StarRatingLiveDemo() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((p) => (p + 1) % starSequence.length);
    }, 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <StarRating value={starSequence[idx]} readonly size="sm" />
    </div>
  );
}

/* ─── 7. SpinnerLiveDemo ────────────────────── */
const spinnerSizes: SpinnerSize[] = ["sm", "md", "lg"];

export function SpinnerLiveDemo() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((p) => (p + 1) % spinnerSizes.length);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full gap-2">
      <div className="transition-opacity duration-300">
        <Spinner size={spinnerSizes[idx]} />
      </div>
      <span className="text-xs text-muted">{spinnerSizes[idx]}</span>
    </div>
  );
}

/* ─── 8. AlertLiveDemo ──────────────────────── */
const alertVariants: AlertVariant[] = ["info", "success", "warning", "danger"];
const alertMessages: Record<AlertVariant, { title: string; body: string }> = {
  info: { title: "Info", body: "New update available." },
  success: { title: "Success", body: "Changes saved." },
  warning: { title: "Warning", body: "Storage almost full." },
  danger: { title: "Error", body: "Connection lost." },
};

export function AlertLiveDemo() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((p) => (p + 1) % alertVariants.length);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const v = alertVariants[idx];
  const msg = alertMessages[v];

  return (
    <div className="flex items-center justify-center h-full px-2">
      <Alert variant={v} title={msg.title}>
        {msg.body}
      </Alert>
    </div>
  );
}

/* ─── 9. BadgeLiveDemo ──────────────────────── */
const badgeVariants: BadgeVariant[] = ["primary", "success", "warning", "danger", "info", "default"];
const badgeLabels: Record<string, string> = {
  primary: "New",
  success: "Done",
  warning: "Pending",
  danger: "Error",
  info: "Info",
  default: "Draft",
};

export function BadgeLiveDemo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((p) => (p >= badgeVariants.length ? 0 : p + 1));
    }, 400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full gap-1.5 flex-wrap px-2">
      {badgeVariants.slice(0, count).map((v) => (
        <Badge key={v} variant={v} size="sm">
          {badgeLabels[v]}
        </Badge>
      ))}
    </div>
  );
}

/* ─── 10. TabsLiveDemo ──────────────────────── */
const tabItems = [
  { value: "overview" as const, label: "Overview" },
  { value: "details" as const, label: "Details" },
  { value: "settings" as const, label: "Settings" },
];
const tabValues = ["overview", "details", "settings"] as const;
type TabValue = (typeof tabValues)[number];

export function TabsLiveDemo() {
  const [tab, setTab] = useState<TabValue>("overview");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((p) => {
        const next = (p + 1) % tabValues.length;
        setTab(tabValues[next]);
        return next;
      });
    }, 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col justify-center h-full px-2">
      <Tabs tabs={tabItems} value={tab} onChange={setTab} size="sm" />
      <p className="text-xs text-muted mt-2 px-1">{tab} content</p>
    </div>
  );
}

/* ─── 11. AccordionLiveDemo ─────────────────── */
export function AccordionLiveDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((p) => (p + 1) % 3);
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const items = [
    { key: "1", title: "What is JunDS?", content: "A design system.", defaultOpen: step >= 1 },
    { key: "2", title: "How to install?", content: "npm install junds", defaultOpen: step >= 2 },
  ];

  return (
    <div className="flex flex-col justify-center h-full px-2" key={step}>
      <Accordion items={items} />
    </div>
  );
}

/* ─── 12. StepperLiveDemo ───────────────────── */
const stepperSteps = [
  { key: "1", title: "Info" },
  { key: "2", title: "Review" },
  { key: "3", title: "Confirm" },
  { key: "4", title: "Done" },
];

export function StepperLiveDemo() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((p) => (p >= 4 ? 0 : p + 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full px-2">
      <Stepper steps={stepperSteps} current={current} />
    </div>
  );
}

/* ─── 13. PaginationLiveDemo ────────────────── */
export function PaginationLiveDemo() {
  const [page, setPage] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setPage((p) => (p >= 5 ? 1 : p + 1));
    }, 800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full">
      <Pagination page={page} totalPages={5} onChange={setPage} />
    </div>
  );
}

/* ─── 14. SkeletonLiveDemo ──────────────────── */
export function SkeletonLiveDemo() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setLoading((p) => !p), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-2 justify-center h-full px-3">
      {loading ? (
        <>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" lines={2} />
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-foreground">Loaded!</p>
          <p className="text-xs text-muted">Content is now visible.</p>
        </>
      )}
    </div>
  );
}

/* ─── 15. TooltipLiveDemo ───────────────────── */
const tooltipPositions: TooltipPosition[] = ["top", "right", "bottom", "left"];
const tooltipLabels: Record<TooltipPosition, string> = {
  top: "Top tooltip",
  right: "Right tooltip",
  bottom: "Bottom tooltip",
  left: "Left tooltip",
};

export function TooltipLiveDemo() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((p) => (p + 1) % tooltipPositions.length);
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const pos = tooltipPositions[idx];

  return (
    <div className="flex items-center justify-center h-full">
      <div className="relative inline-flex">
        <span className="text-xs px-3 py-1.5 bg-gray-100 rounded-lg text-foreground font-medium">
          Hover me
        </span>
        <div
          className={`absolute z-50 px-2.5 py-1.5 text-xs text-white bg-gray-800 rounded-lg shadow-lg whitespace-nowrap pointer-events-none ${
            pos === "top" ? "bottom-full left-1/2 -translate-x-1/2 mb-2" :
            pos === "bottom" ? "top-full left-1/2 -translate-x-1/2 mt-2" :
            pos === "left" ? "right-full top-1/2 -translate-y-1/2 mr-2" :
            "left-full top-1/2 -translate-y-1/2 ml-2"
          }`}
        >
          {tooltipLabels[pos]}
        </div>
      </div>
    </div>
  );
}

/* ─── 16. TimelineLiveDemo ──────────────────── */
const allTimelineItems = [
  { key: "1", title: "Created", time: "09:00", color: "primary" as const },
  { key: "2", title: "In Progress", time: "10:30", color: "success" as const },
  { key: "3", title: "Review", time: "14:00", color: "warning" as const },
  { key: "4", title: "Deployed", time: "16:00", color: "danger" as const },
];

export function TimelineLiveDemo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount((p) => (p >= allTimelineItems.length ? 0 : p + 1));
    }, 800);
    return () => clearInterval(id);
  }, []);

  const visible = allTimelineItems.slice(0, count);

  return (
    <div className="flex flex-col justify-center h-full px-3 py-2 overflow-hidden">
      {visible.length > 0 ? (
        <Timeline items={visible} />
      ) : (
        <span className="text-xs text-muted text-center">Loading events...</span>
      )}
    </div>
  );
}

/* ─── 17. SliderLiveDemo ────────────────────── */
export function SliderLiveDemo() {
  const [value, setValue] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const id = setInterval(() => {
      setValue((p) => {
        if (p >= 100) {
          setDirection(-1);
          return 98;
        }
        if (p <= 0) {
          setDirection(1);
          return 2;
        }
        return p + direction * 2;
      });
    }, 50);
    return () => clearInterval(id);
  }, [direction]);

  return (
    <div className="flex flex-col items-center justify-center h-full px-6 gap-2 w-full max-w-[200px] mx-auto">
      <span className="text-lg font-bold text-primary tabular-nums">{value}</span>
      <Slider value={value} onChange={setValue} size="sm" />
    </div>
  );
}

/* ─── 18. InputLiveDemo ─────────────────────── */
const typewriterText = "안녕하세요...";

export function InputLiveDemo() {
  const [text, setText] = useState("");
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCharIdx((p) => {
        if (p >= typewriterText.length) {
          setText("");
          return 0;
        }
        setText(typewriterText.slice(0, p + 1));
        return p + 1;
      });
    }, 100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full px-3">
      <Input value={text} readOnly placeholder="Type here..." inputSize="sm" />
    </div>
  );
}

/* ─── 19. CardLiveDemo ──────────────────────── */
export function CardLiveDemo() {
  const [hoverable, setHoverable] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setHoverable((p) => !p), 1500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center h-full px-3">
      <Card hoverable={hoverable} className="w-full">
        <Card.Body>
          <p className="text-xs font-medium text-foreground">Card Title</p>
          <p className="text-[10px] text-muted mt-1">
            {hoverable ? "hoverable: on" : "hoverable: off"}
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}

/* ─── 20. StatusDotLiveDemo ─────────────────── */
const statusSequence: { status: StatusDotStatus; label: string }[] = [
  { status: "success", label: "Online" },
  { status: "warning", label: "Away" },
  { status: "danger", label: "Busy" },
  { status: "neutral", label: "Offline" },
];

export function StatusDotLiveDemo() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((p) => (p + 1) % statusSequence.length);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const current = statusSequence[idx];

  return (
    <div className="flex items-center justify-center h-full">
      <StatusDot status={current.status} label={current.label} size="lg" />
    </div>
  );
}

/* ─── 21. EmptyStateLiveDemo ───────────────── */
export function EmptyStateLiveDemo() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setShow(p => !p), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center gap-2 transition-all duration-500">
      {show ? (
        <>
          <div className="text-xs font-medium text-foreground">업무 목록</div>
          <div className="space-y-1.5 w-full max-w-[160px]">
            <div className="h-6 rounded bg-primary/10 flex items-center px-2 text-[10px]">디자인 리뷰</div>
            <div className="h-6 rounded bg-primary/10 flex items-center px-2 text-[10px]">코드 작성</div>
          </div>
        </>
      ) : (
        <>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-muted text-sm">∅</div>
          <span className="text-xs font-medium text-foreground">업무가 없습니다</span>
          <span className="text-[10px] text-muted">빈 상태 → 데이터 전환</span>
        </>
      )}
    </div>
  );
}

/* ─── 22. StatCardLiveDemo ─────────────────── */
export function StatCardLiveDemo() {
  const [value, setValue] = useState(1234);
  useEffect(() => {
    const id = setInterval(() => {
      setValue(p => p + Math.floor(Math.random() * 20 - 5));
    }, 800);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-card border border-border rounded-xl p-3 w-full max-w-[160px] transition-all duration-300">
      <div className="text-[10px] text-muted mb-1">총 사용자</div>
      <div className="text-xl font-bold text-foreground tabular-nums">{value.toLocaleString()}</div>
      <div className="text-[10px] text-success mt-0.5">↑ 실시간 변동</div>
    </div>
  );
}

/* ─── 23. FlowDiagramLiveDemo ──────────────── */
export function FlowDiagramLiveDemo() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % 4), 800);
    return () => clearInterval(id);
  }, []);
  const nodes = ["수집", "처리", "검증", "완료"];
  const colors = ["bg-blue-500/20 border-blue-500/50 text-blue-600", "bg-amber-500/20 border-amber-500/50 text-amber-600", "bg-purple-500/20 border-purple-500/50 text-purple-600", "bg-green-500/20 border-green-500/50 text-green-600"];
  return (
    <div className="flex items-center gap-2">
      {nodes.map((n, i) => (
        <div key={n} className="flex items-center gap-2">
          <div className={cn(
            "w-12 h-7 rounded-lg border flex items-center justify-center text-[9px] font-bold transition-all duration-300",
            colors[i],
            i === active && "ring-2 ring-primary scale-110",
          )}>{n}</div>
          {i < 3 && <svg width="12" height="8" viewBox="0 0 12 8"><path d="M0 4h8M8 4l-3-3M8 4l-3 3" stroke={i < active ? "#3b82f6" : "#d1d5db"} strokeWidth="1.5" fill="none" className="transition-colors duration-300" /></svg>}
        </div>
      ))}
    </div>
  );
}

/* ─── 24. SelectLiveDemo ──────────────────── */
export function SelectLiveDemo() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOpen(p => !p), 1500);
    return () => clearInterval(id);
  }, []);
  const options = ["React", "Vue", "Svelte", "Angular"];
  const [sel, setSel] = useState(0);
  useEffect(() => {
    if (!open) setSel(p => (p + 1) % options.length);
  }, [open]);
  return (
    <div className="w-full max-w-[180px] space-y-1">
      <div className={cn("border border-border rounded-lg px-3 py-2 text-xs bg-card flex justify-between items-center transition-all", open && "border-primary ring-2 ring-primary/20")}>
        <span>{options[sel]}</span>
        <svg width="10" height="10" viewBox="0 0 10 10" className={cn("transition-transform", open && "rotate-180")}><path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>
      </div>
      <div className={cn("border border-border rounded-lg bg-card shadow-lg overflow-hidden transition-all duration-300", open ? "max-h-[120px] opacity-100" : "max-h-0 opacity-0")}>
        {options.map((o, i) => (
          <div key={o} className={cn("px-3 py-1.5 text-xs transition-colors", i === sel ? "bg-primary/10 text-primary font-medium" : "text-foreground")}>{o}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── 25. ModalLiveDemo ───────────────────── */
export function ModalLiveDemo() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setShow(p => !p), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className={cn("absolute inset-0 bg-foreground/5 rounded-lg transition-opacity duration-300", show ? "opacity-100" : "opacity-0")} />
      <div className={cn("relative bg-card border border-border rounded-xl shadow-2xl p-3 w-[180px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]", show ? "scale-100 opacity-100" : "scale-90 opacity-0")}>
        <div className="text-xs font-bold mb-1">삭제 확인</div>
        <div className="text-[10px] text-muted mb-2">이 작업은 되돌릴 수 없습니다.</div>
        <div className="flex gap-1.5 justify-end">
          <div className="px-2 py-1 text-[10px] rounded-md bg-gray-100 text-foreground">취소</div>
          <div className="px-2 py-1 text-[10px] rounded-md bg-danger text-white">삭제</div>
        </div>
      </div>
    </div>
  );
}

/* ─── 26. ToastLiveDemo ───────────────────── */
export function ToastLiveDemo() {
  const [idx, setIdx] = useState(-1);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % 5), 1200);
    return () => clearInterval(id);
  }, []);
  const toasts = [
    { bg: "bg-success/10 border-success/30", icon: "✓", text: "저장 완료", color: "text-success" },
    { bg: "bg-danger/10 border-danger/30", icon: "✕", text: "오류 발생", color: "text-danger" },
    { bg: "bg-warning/10 border-warning/30", icon: "⚠", text: "주의 필요", color: "text-warning" },
    { bg: "bg-blue-50 border-blue-200", icon: "ℹ", text: "업데이트 있음", color: "text-blue-600" },
  ];
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-[200px]">
      {toasts.map((t, i) => (
        <div key={i} className={cn("flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all duration-300", t.bg, i <= idx ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4")}>
          <span className={cn("text-sm", t.color)}>{t.icon}</span>
          <span className="text-foreground">{t.text}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── 27. DrawerLiveDemo ──────────────────── */
export function DrawerLiveDemo() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setOpen(p => !p), 2000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="relative w-full h-[120px] bg-gray-50 rounded-lg overflow-hidden border border-border">
      <div className="p-2 text-[10px] text-muted">메인 콘텐츠</div>
      <div className={cn("absolute top-0 right-0 h-full w-[120px] bg-card border-l border-border shadow-xl transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] p-2", open ? "translate-x-0" : "translate-x-full")}>
        <div className="text-[10px] font-bold mb-1">필터</div>
        <div className="space-y-1">
          <div className="h-4 rounded bg-gray-100"></div>
          <div className="h-4 rounded bg-gray-100"></div>
          <div className="h-4 rounded bg-primary/10"></div>
        </div>
      </div>
    </div>
  );
}

/* ─── 28. CarouselLiveDemo ────────────────── */
export function CarouselLiveDemo() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % 3), 1500);
    return () => clearInterval(id);
  }, []);
  const colors = ["bg-blue-100", "bg-emerald-100", "bg-amber-100"];
  return (
    <div className="w-full max-w-[200px]">
      <div className="relative h-[80px] rounded-lg overflow-hidden">
        {colors.map((c, i) => (
          <div key={i} className={cn("absolute inset-0 flex items-center justify-center text-xs font-bold transition-all duration-500", c, i === idx ? "opacity-100 scale-100" : "opacity-0 scale-95")}>
            슬라이드 {i + 1}
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1 mt-2">
        {[0,1,2].map(i => (
          <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all duration-300", i === idx ? "bg-primary w-4" : "bg-gray-300")} />
        ))}
      </div>
    </div>
  );
}

/* ─── 29. TreeViewLiveDemo ────────────────── */
export function TreeViewLiveDemo() {
  const [expanded, setExpanded] = useState(new Set(["src"]));
  useEffect(() => {
    const sequence = [new Set(["src"]), new Set(["src","components"]), new Set(["src","components","hooks"]), new Set<string>()];
    let i = 0;
    const id = setInterval(() => { i = (i + 1) % sequence.length; setExpanded(sequence[i]); }, 1200);
    return () => clearInterval(id);
  }, []);
  const items = [
    { id: "src", label: "src/", depth: 0, has: true },
    { id: "components", label: "components/", depth: 1, has: true, parent: "src" },
    { id: "button", label: "Button.tsx", depth: 2, has: false, parent: "components" },
    { id: "input", label: "Input.tsx", depth: 2, has: false, parent: "components" },
    { id: "hooks", label: "hooks/", depth: 1, has: true, parent: "src" },
    { id: "useform", label: "useForm.ts", depth: 2, has: false, parent: "hooks" },
  ];
  const visible = items.filter(it => {
    if (it.depth === 0) return true;
    if (it.depth === 1) return expanded.has("src");
    if (it.parent === "components") return expanded.has("components");
    if (it.parent === "hooks") return expanded.has("hooks");
    return false;
  });
  return (
    <div className="text-xs space-y-0.5 w-full max-w-[180px]">
      {visible.map(it => (
        <div key={it.id} className={cn("flex items-center gap-1 py-0.5 transition-all duration-200")} style={{ paddingLeft: it.depth * 12 }}>
          <span className="text-muted">{it.has ? (expanded.has(it.id) ? "▼" : "▶") : "·"}</span>
          <span className={cn(it.has ? "font-medium text-foreground" : "text-muted")}>{it.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── 30. DropdownLiveDemo ────────────────── */
export function DropdownLiveDemo() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStep(p => (p + 1) % 6), 600);
    return () => clearInterval(id);
  }, []);
  const open = step >= 1 && step <= 4;
  const highlight = open ? step - 1 : -1;
  const items = ["수정", "복제", "삭제"];
  return (
    <div className="space-y-1 w-full max-w-[140px]">
      <div className={cn("px-3 py-1.5 rounded-lg bg-card border text-xs flex items-center justify-between transition-all", open ? "border-primary" : "border-border")}>
        <span>작업</span>
        <svg width="8" height="8" viewBox="0 0 8 8" className={cn("transition-transform", open && "rotate-180")}><path d="M1 2.5l3 3 3-3" stroke="currentColor" strokeWidth="1" fill="none"/></svg>
      </div>
      <div className={cn("border border-border rounded-lg bg-card shadow-lg overflow-hidden transition-all duration-300", open ? "max-h-[80px] opacity-100" : "max-h-0 opacity-0")}>
        {items.map((it, i) => (
          <div key={it} className={cn("px-3 py-1.5 text-xs transition-colors duration-150", i === highlight ? "bg-primary/10 text-primary" : "", i === 2 ? "text-danger" : "")}>{it}</div>
        ))}
      </div>
    </div>
  );
}

/* ─── 31. ConfirmDialogLiveDemo ───────────── */
export function ConfirmDialogLiveDemo() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setPhase(p => (p + 1) % 5), 1000);
    return () => clearInterval(id);
  }, []);
  const show = phase >= 1 && phase <= 3;
  return (
    <div className="relative w-full h-[110px] flex items-center justify-center">
      <div className={cn("absolute inset-0 bg-foreground/5 rounded-lg transition-opacity duration-300", show ? "opacity-100" : "opacity-0")} />
      <div className={cn("relative bg-card border border-border rounded-xl shadow-xl p-3 w-[170px] transition-all duration-400", show ? "scale-100 opacity-100" : "scale-95 opacity-0")}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-danger text-sm">⚠</span>
          <span className="text-xs font-bold">삭제하시겠습니까?</span>
        </div>
        <div className="text-[10px] text-muted mb-2">이 작업은 되돌릴 수 없습니다.</div>
        <div className="flex gap-1.5 justify-end">
          <div className={cn("px-2 py-1 text-[10px] rounded-md border transition-all", phase === 2 ? "bg-gray-100 border-foreground/20" : "border-border")}>취소</div>
          <div className={cn("px-2 py-1 text-[10px] rounded-md text-white transition-all", phase === 3 ? "bg-danger scale-105" : "bg-danger/80")}>삭제</div>
        </div>
      </div>
    </div>
  );
}

/* ─── 32. NavigationMenuLiveDemo ──────────── */
export function NavigationMenuLiveDemo() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % 4), 1000);
    return () => clearInterval(id);
  }, []);
  const items = ["홈", "제품", "문서", "블로그"];
  return (
    <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
      {items.map((it, i) => (
        <div key={it} className={cn("px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-300", i === active ? "bg-primary/10 text-primary" : "text-muted")}>{it}</div>
      ))}
    </div>
  );
}

/* ─── 33. SegmentedControlLiveDemo ────────── */
export function SegmentedControlLiveDemo() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx(p => (p + 1) % 3), 1200);
    return () => clearInterval(id);
  }, []);
  const items = ["일간", "주간", "월간"];
  return (
    <div className="flex rounded-xl bg-gray-100 p-1 gap-0.5 w-full max-w-[180px]">
      {items.map((it, i) => (
        <div key={it} className={cn("flex-1 text-center py-1.5 text-[10px] font-medium rounded-lg transition-all duration-300", i === idx ? "bg-white shadow-sm text-foreground" : "text-muted")}>{it}</div>
      ))}
    </div>
  );
}
