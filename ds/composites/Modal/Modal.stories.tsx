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

const Demo = ({
  size = "md",
  dismissible = true,
}: { size?: "sm" | "md" | "lg" | "xl" | "full"; dismissible?: boolean }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-h-[320px]">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-sm rounded-lg bg-primary text-white"
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
            className="px-3 py-1.5 text-sm rounded-lg border border-border text-muted"
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="px-3 py-1.5 text-sm rounded-lg bg-danger text-white"
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
