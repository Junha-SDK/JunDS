"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  Banknote,
  BarChart3,
  Bell,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Command,
  Crown,
  ExternalLink,
  Flame,
  Globe2,
  LayoutDashboard,
  LayoutGrid,
  LineChart,
  ListOrdered,
  Menu,
  Newspaper,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  Star,
  Sun,
  Moon,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  X,
  Info,
  AlertTriangle,
  Building2,
  Activity,
  Lock,
  Clock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICONS = {
  bell: Bell,
  calendar: Calendar,
  calendarCheck: CalendarCheck,
  search: Search,
  menu: Menu,
  settings: Settings,
  star: Star,
  crown: Crown,
  command: Command,
  newspaper: Newspaper,
  refresh: RefreshCw,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  arrowLeft: ArrowLeft,
  arrowRight: ArrowRight,
  swap: ArrowLeftRight,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronUp: ChevronUp,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  flame: Flame,
  layoutGrid: LayoutGrid,
  layoutDashboard: LayoutDashboard,
  listOrdered: ListOrdered,
  barChart: BarChart3,
  pieChart: PieChart,
  lineChart: LineChart,
  banknote: Banknote,
  wallet: Wallet,
  target: Target,
  sliders: SlidersHorizontal,
  globe: Globe2,
  external: ExternalLink,
  sparkles: Sparkles,
  sun: Sun,
  moon: Moon,
  plus: Plus,
  close: X,
  info: Info,
  alert: AlertTriangle,
  building: Building2,
  activity: Activity,
  lock: Lock,
  clock: Clock,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

interface AppIconProps {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
  color?: string;
}

export function AppIcon({ name, size = 16, className, strokeWidth = 2, color }: AppIconProps) {
  const Cmp = ICONS[name];
  return <Cmp size={size} className={className} strokeWidth={strokeWidth} color={color} />;
}
