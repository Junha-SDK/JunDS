"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ComponentShowcase } from "@/ds/composites/ComponentShowcase";
import { showcaseItems } from "../_data/component-demos";
import { cn } from "@/ds/utils/cn";

interface Intent {
  id: string;
  label: string;
  icon: string;
  names: string[];
}

const intents: Intent[] = [
  {
    id: "form",
    label: "폼 / 입력",
    icon: "✍️",
    names: [
      "Input", "Textarea", "Select", "MultiSelect", "Combobox", "Checkbox", "Radio",
      "Switch", "Toggle", "Slider", "RangeSlider", "NumberInput", "FileUpload",
      "DateInput", "PasswordInput", "PinInput", "OTPInput", "CurrencyInput",
      "PhoneInput", "TagInput", "SearchInput", "AddressInput", "Form", "FormWizard",
      "FormArray", "FormBuilder", "InlineEdit", "StarRating", "Rating", "ColorPicker",
      "EmojiPicker", "Label", "FormField", "MonthPicker", "YearPicker",
    ],
  },
  {
    id: "data",
    label: "데이터 / 표",
    icon: "📊",
    names: [
      "Table", "DataTable", "DataGrid", "Pagination", "Timeline", "TreeView",
      "Kanban", "Heatmap", "DiffViewer", "JSONViewer", "InfiniteList", "VirtualList",
      "MasonryGrid", "CollectionView", "Descriptions", "SortableList", "Transfer",
    ],
  },
  {
    id: "viz",
    label: "차트 / 시각화",
    icon: "📈",
    names: [
      "MiniChart", "ProgressRing", "GaugeChart", "FunnelChart", "TreemapChart",
      "ChartCard", "MetricCard", "StatCard", "BatteryIndicator", "AnimatedCounter",
      "BentoGrid", "ProgressBar", "Globe",
    ],
  },
  {
    id: "feedback",
    label: "피드백 / 알림",
    icon: "💬",
    names: [
      "Toast", "Alert", "AlertDialog", "ConfirmDialog", "Modal", "Drawer", "Sheet",
      "Tooltip", "Popover", "HoverCard", "Banner", "Snackbar", "Notification",
      "Callout", "EmptyState", "LoadingOverlay", "Skeleton", "SkeletonPreset",
      "Spinner", "Onboarding", "Tour", "ChatBubble", "ThinkingIndicator",
    ],
  },
  {
    id: "nav",
    label: "내비게이션",
    icon: "🧭",
    names: [
      "Tabs", "Accordion", "Breadcrumb", "Stepper", "NavigationMenu", "Menubar",
      "ContextMenu", "Dropdown", "Sidebar", "BackTop", "AutoHideHeader", "TreeNav",
      "AppShell", "PageHeader", "Affix", "Sticky",
    ],
  },
  {
    id: "actions",
    label: "액션 / 트리거",
    icon: "🎯",
    names: [
      "Button", "ButtonGroup", "IconButton", "ActionBar", "ActionSheet",
      "BottomSheet", "CommandPalette", "Dock", "FloatingActionButton",
      "CopyButton", "CopyBlock",
    ],
  },
  {
    id: "media",
    label: "미디어",
    icon: "🎬",
    names: [
      "VideoPlayer", "AudioPlayer", "Carousel", "ImageCropper", "ImageLightbox",
      "CompareSlider", "AvatarStack", "Avatar", "QRCode", "ColorSwatch",
      "Image",
    ],
  },
  {
    id: "marketing",
    label: "마케팅 / 랜딩",
    icon: "✨",
    names: [
      "SpotlightCard", "BentoGrid", "GradientBorder", "Marquee", "Confetti",
      "Typewriter", "Starfield", "PricingTable", "AnnouncementBar",
      "CookieConsent", "BookCard",
    ],
  },
];

export default function ShowcasePage() {
  const router = useRouter();
  const [intent, setIntent] = useState<string | null>(null);

  const items = useMemo(() => {
    if (!intent) return showcaseItems;
    const cur = intents.find((i) => i.id === intent);
    if (!cur) return showcaseItems;
    const allow = new Set(cur.names);
    return showcaseItems.filter((it) => allow.has(it.label));
  }, [intent]);

  const activeIntent = intents.find((i) => i.id === intent);

  return (
    <div className="h-full overflow-y-auto">
      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden border-b border-border">
        {/* 배경 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-transparent" />
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-accent/8 blur-3xl" />

        <div className="relative px-8 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
                <rect x="3" y="3" width="7" height="7" rx="2" />
                <rect x="14" y="3" width="7" height="7" rx="2" />
                <rect x="3" y="14" width="7" height="7" rx="2" />
                <rect x="14" y="14" width="7" height="7" rx="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">컴포넌트 갤러리</h1>
              <p className="text-sm text-muted">
                {showcaseItems.length}개의 컴포넌트를 시각적으로 탐색하세요
              </p>
            </div>
          </div>
          <p className="text-xs text-muted/70 max-w-lg mb-5">
            카드 위에 마우스를 올리면 컴포넌트의 실제 동작을 미리볼 수 있습니다. 클릭하면 상세 문서 페이지로 이동합니다.
          </p>

          {/* ── Intent chips ── */}
          <div>
            <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-2">
              💡 의도별 추천
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setIntent(null)}
                aria-pressed={intent === null}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer border",
                  "transition-all duration-200 active:scale-95",
                  intent === null
                    ? "bg-foreground text-background border-foreground"
                    : "bg-white text-muted border-border hover:border-primary/30 hover:text-foreground",
                )}
              >
                전체
                <span className="text-[10px] opacity-70">{showcaseItems.length}</span>
              </button>
              {intents.map((i) => {
                const count = showcaseItems.filter((it) => i.names.includes(it.label)).length;
                if (count === 0) return null;
                const active = intent === i.id;
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => setIntent(active ? null : i.id)}
                    aria-pressed={active}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium cursor-pointer border",
                      "transition-all duration-200 active:scale-95",
                      active
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-muted border-border hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    <span aria-hidden>{i.icon}</span>
                    {i.label}
                    <span className={cn("text-[10px]", active ? "opacity-80" : "opacity-60")}>{count}</span>
                  </button>
                );
              })}
            </div>
            {activeIntent && (
              <p className="mt-2 text-[11px] text-muted">
                <span className="font-medium text-primary">{activeIntent.label}</span> 의도로 {items.length}개 컴포넌트만 표시 중 — 칩을 다시 누르거나 "전체"로 돌아가세요.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Gallery ── */}
      <div className="px-8 py-8">
        <ComponentShowcase
          key={intent ?? "all"}
          items={items}
          searchable
          filterable
          columns={4}
          onItemClick={(item) => {
            if (item.href) router.push(item.href);
          }}
        />
      </div>
    </div>
  );
}
