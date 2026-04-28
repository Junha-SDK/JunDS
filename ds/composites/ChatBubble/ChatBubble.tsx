"use client";
import { cn } from "../../utils/cn";
import type { ReactNode } from "react";

export interface ChatBubbleProps {
  children: ReactNode;
  sender?: string;
  avatar?: ReactNode;
  timestamp?: string;
  side?: "left" | "right";
  variant?: "default" | "primary";
  className?: string;
}

export function ChatBubble({
  children, sender, avatar, timestamp, side = "left", variant = "default", className,
}: ChatBubbleProps) {
  const isRight = side === "right";
  return (
    <div className={cn("flex gap-2 max-w-[80%]", isRight && "ml-auto flex-row-reverse", className)}>
      {avatar && <div className="shrink-0 mt-auto">{avatar}</div>}
      <div>
        {sender && <p className={cn("text-[10px] text-muted mb-0.5 px-1", isRight && "text-right")}>{sender}</p>}
        <div className={cn(
          "px-3.5 py-2 rounded-2xl text-sm leading-relaxed",
          isRight
            ? variant === "primary" ? "bg-primary text-white rounded-br-sm" : "bg-gray-100 text-foreground rounded-br-sm"
            : "bg-gray-100 text-foreground rounded-bl-sm",
        )}>
          {children}
        </div>
        {timestamp && <p className={cn("text-[10px] text-muted mt-0.5 px-1", isRight && "text-right")}>{timestamp}</p>}
      </div>
    </div>
  );
}
