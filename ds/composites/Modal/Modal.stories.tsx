import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "./Modal";

const meta: Meta<typeof Modal> = {
  title: "Composites/Modal",
  component: Modal,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl", "full"] },
    dismissible: { control: "boolean" },
  },
  args: { size: "md", dismissible: true },
};

export default meta;
type Story = StoryObj<typeof Modal>;

/** 스토리 안의 데모 버튼도 상태 3종을 갖춰야 실제 사용례로 읽힌다 */
const btn = [
  "px-3 py-1.5 text-sm rounded-xl cursor-pointer transition-colors duration-150",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
].join(" ");

const Demo = ({
  size = "md",
  dismissible = true,
}: {
  size?: "sm" | "md" | "lg" | "xl" | "full";
  dismissible?: boolean;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-[320px]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${btn} bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-[0_1px_2px_var(--primary-glow),inset_0_1px_0_rgba(255,255,255,0.18)]`}
      >
        모달 열기
      </button>
      <Modal open={open} onClose={() => setOpen(false)} size={size} dismissible={dismissible}>
        <Modal.Header onClose={() => setOpen(false)}>알림</Modal.Header>
        <div className="p-6 text-sm text-foreground">
          저장하지 않은 변경 사항이 있습니다. 정말로 페이지를 떠나시겠습니까?
        </div>
        <Modal.Footer>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={`${btn} border border-border text-muted hover:bg-muted/10 active:bg-muted/20`}
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={`${btn} bg-danger text-white hover:bg-danger-hover active:bg-danger-hover shadow-[0_1px_2px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.18)]`}
          >
            나가기
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export const Open: Story = { render: () => <Demo /> };
export const Small: Story = { render: () => <Demo size="sm" /> };
export const Large: Story = { render: () => <Demo size="lg" /> };
export const NotDismissible: Story = { render: () => <Demo dismissible={false} /> };
