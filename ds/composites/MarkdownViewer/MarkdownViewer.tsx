"use client";
import { useMemo } from "react";
import { cn } from "../../utils/cn";

export interface MarkdownViewerProps {
  content: string;
  className?: string;
}

function parseMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-5 mb-2">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-3">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-primary">$1</code>')
    .replace(/^\- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-primary underline" target="_blank" rel="noopener">$1</a>')
    .replace(/^> (.+)$/gm, '<blockquote class="pl-4 border-l-4 border-primary/30 text-muted italic my-2">$1</blockquote>')
    .replace(/^---$/gm, '<hr class="border-border my-4" />')
    .replace(/\n\n/g, '<br/><br/>');
}

export function MarkdownViewer({ content, className }: MarkdownViewerProps) {
  const html = useMemo(() => parseMarkdown(content), [content]);
  return (
    <div
      className={cn("prose-custom text-sm leading-relaxed text-foreground", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
