"use client";
import { useState, useMemo } from "react";
import { cn } from "../../utils/cn";

export interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  className?: string;
}

const CATEGORIES: Record<string, string[]> = {
  "자주 쓰는": ["😀","😂","❤️","👍","🎉","🔥","✨","💯","🙏","😍","🤔","👀","💪","🚀","⭐"],
  "표정": ["😀","😃","😄","😁","😅","😂","🤣","😊","😇","🙂","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕"],
  "손": ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏"],
  "동물": ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🐔","🐧","🐦","🦅","🦆","🦉","🐴","🦄","🐝","🐛","🦋","🐌","🐞"],
  "음식": ["🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍕","🍔","🍟","🌭","🍿","🧁","🍰","🎂","🍫","🍬"],
  "활동": ["⚽","🏀","🏈","⚾","🥎","🎾","🏐","🎮","🎯","🎲","🧩","🎭","🎨","🎵","🎶","🎤","🎧","🎸","🎹","🥁","🎺","🎻"],
  "기호": ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💝","💘","💌","💤","💢","💥","💦","💨","🕳️","💣","💬","🔔","🔕","📢"],
};

export function EmojiPicker({ onSelect, className }: EmojiPickerProps) {
  const [category, setCategory] = useState("자주 쓰는");
  const [search, setSearch] = useState("");

  const emojis = useMemo(() => {
    if (search) {
      return Object.values(CATEGORIES).flat().filter((e, i, arr) => arr.indexOf(e) === i);
    }
    return CATEGORIES[category] ?? [];
  }, [category, search]);

  return (
    <div className={cn("w-72 bg-white border border-border rounded-xl shadow-lg overflow-hidden", className)}>
      <div className="p-2 border-b border-border">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이모지 검색..."
          className="w-full h-7 px-2.5 text-xs border border-border rounded-lg outline-none focus:border-primary"
        />
      </div>
      {!search && (
        <div className="flex gap-0.5 px-2 py-1.5 border-b border-border overflow-x-auto">
          {Object.keys(CATEGORIES).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={cn(
                "px-2 py-1 text-[10px] font-medium rounded-md whitespace-nowrap cursor-pointer transition-colors",
                category === cat ? "bg-primary/10 text-primary" : "text-muted hover:bg-gray-100",
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
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-lg transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
