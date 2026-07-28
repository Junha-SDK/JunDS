import { EmptyState } from "@junds/ui";
import type { ReactNode } from "react";

interface PageEmptyStateProps {
  icon?: ReactNode;
  emoji?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  size?: "sm" | "md" | "lg";
}

const PADDING: Record<NonNullable<PageEmptyStateProps["size"]>, string> = {
  sm: "px-6 py-8",
  md: "px-6 py-12",
  lg: "px-6 py-16",
};

export function PageEmptyState({
  icon,
  emoji,
  title,
  description,
  action,
  size = "md",
}: PageEmptyStateProps) {
  const resolvedIcon = icon ?? (emoji ? <span style={{ fontSize: 40 }}>{emoji}</span> : null);
  return (
    <div className={`bm-card ${PADDING[size]}`}>
      <EmptyState icon={resolvedIcon} title={title} description={description} action={action} />
    </div>
  );
}
