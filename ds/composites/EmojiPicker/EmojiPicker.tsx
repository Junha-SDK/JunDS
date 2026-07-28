"use client";
import { useState, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface EmojiPickerProps {
  /** 이모지 선택 콜백 */
  onSelect: (emoji: string) => void;
  /** 추가 클래스 */
  className?: string;
}

const CATEGORIES: Record<string, string[]> = {
  "자주 쓰는": [
    "😀",
    "😂",
    "❤️",
    "👍",
    "🎉",
    "🔥",
    "✨",
    "💯",
    "🙏",
    "😍",
    "🤔",
    "👀",
    "💪",
    "🚀",
    "⭐",
  ],
  표정: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😜",
    "🤪",
    "😝",
    "🤑",
    "🤗",
    "🤭",
    "🤫",
    "🤔",
    "🤐",
    "🤨",
    "😐",
    "😑",
    "😶",
    "😏",
    "😒",
    "🙄",
    "😬",
    "🤥",
    "😌",
    "😔",
    "😪",
    "🤤",
    "😴",
    "😷",
    "🤒",
    "🤕",
  ],
  손: [
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "✊",
    "👊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
  ],
  동물: [
    "🐶",
    "🐱",
    "🐭",
    "🐹",
    "🐰",
    "🦊",
    "🐻",
    "🐼",
    "🐨",
    "🐯",
    "🦁",
    "🐮",
    "🐷",
    "🐸",
    "🐵",
    "🐔",
    "🐧",
    "🐦",
    "🦅",
    "🦆",
    "🦉",
    "🐴",
    "🦄",
    "🐝",
    "🐛",
    "🦋",
    "🐌",
    "🐞",
  ],
  음식: [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🥑",
    "🍕",
    "🍔",
    "🍟",
    "🌭",
    "🍿",
    "🧁",
    "🍰",
    "🎂",
    "🍫",
    "🍬",
  ],
  활동: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🎮",
    "🎯",
    "🎲",
    "🧩",
    "🎭",
    "🎨",
    "🎵",
    "🎶",
    "🎤",
    "🎧",
    "🎸",
    "🎹",
    "🥁",
    "🎺",
    "🎻",
  ],
  기호: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💝",
    "💘",
    "💌",
    "💤",
    "💢",
    "💥",
    "💦",
    "💨",
    "🕳️",
    "💣",
    "💬",
    "🔔",
    "🔕",
    "📢",
  ],
};

/**
 * 카테고리별 이모지를 선택할 수 있는 피커.
 * @example
 * <EmojiPicker onSelect={(emoji) => append(emoji)} />
 * @status stable
 * @since 2.2.0
 * @tags form, input
 */
export function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
  const [category, setCategory] = useState("자주 쓰는");
  const [search, setSearch] = useState("");

  const emojis = useMemo(() => {
    if (search) {
      return Object.values(CATEGORIES)
        .flat()
        .filter((e, i, arr) => arr.indexOf(e) === i);
    }
    return CATEGORIES[category] ?? [];
  }, [category, search]);

  return (
    <div
      className={cn(
        // 떠 있는 패널이라 한 겹 그림자로는 배경에서 떨어져 보이지 않는다 — 다층 + 얇은 링
        "w-72 bg-card border border-border rounded-2xl overflow-hidden",
        "shadow-[0_10px_30px_-8px_rgba(0,0,0,0.35),0_4px_10px_-4px_rgba(0,0,0,0.2)] ring-1 ring-white/10",
        className,
      )}
    >
      <div className="p-2 border-b border-border">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이모지 검색..."
          className={cn(
            "w-full h-7 px-2.5 text-xs border border-border rounded-lg bg-transparent",
            "transition-colors duration-150 placeholder:text-muted-light",
            // outline 을 지우므로 같은 자리에서 ring 으로 초점을 되돌려준다
            "outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/40",
          )}
        />
      </div>
      {!search && (
        <div className="flex gap-0.5 px-2 py-1.5 border-b border-border overflow-x-auto overscroll-x-contain">
          {Object.keys(CATEGORIES).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "px-2 py-1 text-[10px] font-medium rounded-lg whitespace-nowrap cursor-pointer transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-1 focus-visible:ring-offset-card",
                category === cat
                  ? "bg-primary/10 text-primary-ink"
                  : "text-muted hover:bg-muted/10 hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}
      <div className="grid grid-cols-8 gap-0.5 p-2 max-h-48 overflow-y-auto">
        {emojis.map((emoji, i) => (
          <button
            key={`${emoji}-${i}`}
            type="button"
            onClick={() => onSelect(emoji)}
            className={cn(
              "w-8 h-8 flex items-center justify-center rounded-lg cursor-pointer text-lg",
              "transition-[background-color,transform] duration-150 hover:bg-muted/10",
              "hover:scale-110 active:scale-95 motion-reduce:hover:scale-100 motion-reduce:active:scale-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-1 focus-visible:ring-offset-card",
            )}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
