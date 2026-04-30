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

const Demo = ({
  side = "right",
  size = "md",
  title = "필터",
}: { side?: "left" | "right" | "bottom"; size?: "sm" | "md" | "lg" | "xl"; title?: string }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-[320px]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white"
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
              className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white"
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
