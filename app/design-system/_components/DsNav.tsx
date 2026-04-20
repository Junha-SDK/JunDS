"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/ds/utils/cn";

const sections = [
  {
    title: "Foundation",
    items: [
      { href: "/design-system", label: "개요", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
      { href: "/design-system/tokens/colors", label: "Colors" },
      { href: "/design-system/tokens/typography", label: "Typography" },
      { href: "/design-system/tokens/spacing", label: "Spacing" },
      { href: "/design-system/tokens/shadows", label: "Shadows" },
      { href: "/design-system/tokens/animations", label: "Animations" },
    ],
  },
  {
    title: "Primitives",
    items: [
      { href: "/design-system/primitives/button", label: "Button" },
      { href: "/design-system/primitives/input", label: "Input" },
      { href: "/design-system/primitives/textarea", label: "Textarea" },
      { href: "/design-system/primitives/badge", label: "Badge" },
      { href: "/design-system/primitives/avatar", label: "Avatar" },
      { href: "/design-system/primitives/spinner", label: "Spinner" },
      { href: "/design-system/primitives/divider", label: "Divider" },
      { href: "/design-system/primitives/toggle", label: "Toggle" },
      { href: "/design-system/primitives/checkbox", label: "Checkbox" },
      { href: "/design-system/primitives/radio", label: "Radio" },
      { href: "/design-system/primitives/tag", label: "Tag" },
      { href: "/design-system/primitives/icon-button", label: "IconButton" },
      { href: "/design-system/primitives/kbd", label: "Kbd" },
      { href: "/design-system/primitives/slider", label: "Slider" },
      { href: "/design-system/primitives/number-input", label: "NumberInput" },
      { href: "/design-system/primitives/file-upload", label: "FileUpload" },
      { href: "/design-system/primitives/copy-button", label: "CopyButton" },
      { href: "/design-system/primitives/status-dot", label: "StatusDot" },
      { href: "/design-system/primitives/switch", label: "Switch" },
      { href: "/design-system/primitives/aspect-ratio", label: "AspectRatio" },
      { href: "/design-system/primitives/scroll-area", label: "ScrollArea" },
      { href: "/design-system/primitives/star-rating", label: "StarRating" },
      { href: "/design-system/primitives/back-top", label: "BackTop" },
    ],
  },
  {
    title: "Composites",
    items: [
      { href: "/design-system/composites/select", label: "Select" },
      { href: "/design-system/composites/multi-select", label: "MultiSelect" },
      { href: "/design-system/composites/modal", label: "Modal" },
      { href: "/design-system/composites/toast", label: "Toast" },
      { href: "/design-system/composites/dropdown", label: "Dropdown" },
      { href: "/design-system/composites/tabs", label: "Tabs" },
      { href: "/design-system/composites/accordion", label: "Accordion" },
      { href: "/design-system/composites/breadcrumb", label: "Breadcrumb" },
      { href: "/design-system/composites/progress", label: "Progress" },
      { href: "/design-system/composites/tooltip", label: "Tooltip" },
      { href: "/design-system/composites/card", label: "Card" },
      { href: "/design-system/composites/alert", label: "Alert" },
      { href: "/design-system/composites/empty-state", label: "EmptyState" },
      { href: "/design-system/composites/skeleton", label: "Skeleton" },
      { href: "/design-system/composites/pagination", label: "Pagination" },
      { href: "/design-system/composites/date-input", label: "DateInput" },
      { href: "/design-system/composites/drawer", label: "Drawer" },
      { href: "/design-system/composites/confirm-dialog", label: "ConfirmDialog" },
      { href: "/design-system/composites/combobox", label: "Combobox" },
      { href: "/design-system/composites/stat-card", label: "StatCard" },
      { href: "/design-system/composites/timeline", label: "Timeline" },
      { href: "/design-system/composites/button-group", label: "ButtonGroup" },
      { href: "/design-system/composites/avatar-stack", label: "AvatarStack" },
      { href: "/design-system/composites/collapsible", label: "Collapsible" },
      { href: "/design-system/composites/hover-card", label: "HoverCard" },
      { href: "/design-system/composites/context-menu", label: "ContextMenu" },
      { href: "/design-system/composites/alert-dialog", label: "AlertDialog" },
      { href: "/design-system/composites/sheet", label: "Sheet" },
      { href: "/design-system/composites/navigation-menu", label: "NavigationMenu" },
      { href: "/design-system/composites/menubar", label: "Menubar" },
      { href: "/design-system/composites/table", label: "Table" },
      { href: "/design-system/composites/carousel", label: "Carousel" },
      { href: "/design-system/composites/resizable", label: "Resizable" },
      { href: "/design-system/composites/tree-view", label: "TreeView" },
      { href: "/design-system/composites/stepper", label: "Stepper" },
      { href: "/design-system/composites/transfer", label: "Transfer" },
      { href: "/design-system/composites/descriptions", label: "Descriptions" },
      { href: "/design-system/composites/segmented-control", label: "SegmentedControl" },
      { href: "/design-system/composites/color-picker", label: "ColorPicker" },
      { href: "/design-system/composites/time-picker", label: "TimePicker" },
      { href: "/design-system/composites/date-range-picker", label: "DateRangePicker" },
      { href: "/design-system/composites/mention", label: "Mention" },
      { href: "/design-system/composites/auto-complete", label: "AutoComplete" },
      { href: "/design-system/composites/result", label: "Result" },
      { href: "/design-system/composites/watermark", label: "Watermark" },
      { href: "/design-system/composites/scroll-spy", label: "ScrollSpy" },
      { href: "/design-system/composites/spotlight", label: "Spotlight" },
    ],
  },
  {
    title: "Patterns",
    items: [
      { href: "/design-system/patterns/data-table", label: "DataTable" },
      { href: "/design-system/patterns/filter-bar", label: "FilterBar" },
      { href: "/design-system/patterns/command-palette", label: "CommandPalette" },
      { href: "/design-system/patterns/sidebar", label: "Sidebar" },
      { href: "/design-system/patterns/calendar", label: "Calendar" },
      { href: "/design-system/patterns/kanban", label: "Kanban" },
      { href: "/design-system/patterns/stats-grid", label: "StatsGrid" },
      { href: "/design-system/patterns/action-bar", label: "ActionBar" },
      { href: "/design-system/patterns/form-builder", label: "FormBuilder" },
      { href: "/design-system/patterns/infinite-list", label: "InfiniteList" },
      { href: "/design-system/patterns/virtual-list", label: "VirtualList" },
      { href: "/design-system/patterns/chart-card", label: "ChartCard" },
      { href: "/design-system/patterns/notification-center", label: "NotificationCenter" },
      { href: "/design-system/patterns/sortable-list", label: "SortableList" },
      { href: "/design-system/patterns/rich-text-editor", label: "RichTextEditor" },
      { href: "/design-system/patterns/tour", label: "Tour" },
    ],
  },
  {
    title: "Security",
    items: [
      { href: "/design-system/security/password-input", label: "PasswordInput" },
      { href: "/design-system/security/pin-input", label: "PinInput" },
      { href: "/design-system/security/security-badge", label: "SecurityBadge" },
      { href: "/design-system/security/trust-indicator", label: "TrustIndicator" },
      { href: "/design-system/security/security-checklist", label: "SecurityChecklist" },
      { href: "/design-system/security/login-form", label: "LoginForm" },
    ],
  },
  {
    title: "Advanced",
    items: [
      { href: "/design-system/advanced/dependency-graph", label: "Dependency Graph" },
      { href: "/design-system/advanced/token-export", label: "Token Export" },
      { href: "/design-system/advanced/ai-prompt", label: "AI Prompt Generator" },
      { href: "/design-system/advanced/changelog", label: "Changelog" },
    ],
  },
];

const categoryColors: Record<string, string> = {
  Foundation: "bg-violet-500",
  Primitives: "bg-blue-500",
  Composites: "bg-emerald-500",
  Patterns: "bg-amber-500",
  Security: "bg-red-500",
  Advanced: "bg-rose-500",
};

export function DsNav() {
  const pathname = usePathname();

  return (
    <nav className="py-3 px-2">
      {sections.map((section) => (
        <div key={section.title} className="mb-3">
          <div className="flex items-center gap-1.5 px-2 mb-1">
            <span className={cn("w-1.5 h-1.5 rounded-full", categoryColors[section.title] || "bg-gray-500")} />
            <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
              {section.title}
            </h4>
            <span className="text-[10px] text-white/20 ml-auto">{section.items.length}</span>
          </div>
          <div className="flex flex-col gap-px">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-2.5 py-[5px] text-[13px] rounded-lg transition-all duration-150",
                    isActive
                      ? "bg-white/10 text-white font-medium shadow-sm shadow-black/10"
                      : "text-white/50 hover:text-white/80 hover:bg-white/5",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
