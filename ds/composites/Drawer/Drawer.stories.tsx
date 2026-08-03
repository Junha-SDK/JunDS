import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Drawer } from "./Drawer";

const meta: Meta<typeof Drawer> = {
  title: "Composites/Drawer",
  component: Drawer,
  argTypes: {
    side: { control: "radio", options: ["left", "right", "bottom"] },
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
  },
  args: { side: "right", size: "md", title: "필터" },
};

export default meta;
type Story = StoryObj<typeof Drawer>;

// 스토리도 기준선을 보여 주는 자리다 — 누를 수 있는 것에는 hover·active·focus-visible 이 전부 있어야 한다.
const btnBase =
  "px-3 py-1.5 text-sm rounded-xl cursor-pointer transition-[background-color,border-color,transform] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background";
const btnPrimary = `${btnBase} bg-primary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] hover:bg-primary-hover`;
const btnGhost = `${btnBase} border border-border text-muted hover:bg-surface-soft hover:text-foreground hover:border-muted-light`;

const Demo = ({
  side = "right",
  size = "md",
  title = "필터",
}: {
  side?: "left" | "right" | "bottom";
  size?: "sm" | "md" | "lg" | "xl";
  title?: string;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-[320px]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={btnPrimary}
      >
        Drawer 열기
      </button>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        side={side}
        size={size}
        title={title}
        footer={
          <>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={btnGhost}
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className={btnPrimary}
            >
              적용
            </button>
          </>
        }
      >
        <div className="space-y-3 text-sm text-foreground">
          <p>드로어 내부 콘텐츠입니다.</p>
          <p className="text-muted">필터, 상세 정보, 빠른 액션 등에 적합합니다.</p>
        </div>
      </Drawer>
    </div>
  );
};

export const Right: Story = { render: () => <Demo side="right" /> };
export const Left: Story = { render: () => <Demo side="left" /> };
export const Bottom: Story = { render: () => <Demo side="bottom" /> };
export const Large: Story = { render: () => <Demo size="lg" /> };
