import type { Meta, StoryObj } from "@storybook/react";
import { DsToastProvider, useDsToast } from "./Toast";

const meta: Meta<typeof DsToastProvider> = {
  title: "Composites/Toast",
  component: DsToastProvider,
  argTypes: {
    position: {
      control: "select",
      options: ["top-right", "top-center", "bottom-right", "bottom-center"],
    },
  },
  args: { position: "bottom-right" },
};

export default meta;
type Story = StoryObj<typeof DsToastProvider>;

function Trigger() {
  const t = useDsToast();
  // 스토리 트리거도 라이브러리와 같은 기준선을 따른다 — hover/active/focus-visible 3종 +
  // 라이트 전용 회색(bg-gray-50) 대신 모드를 따라가는 표면 토큰.
  const btn = [
    "px-3 py-1.5 text-sm rounded-xl border border-border bg-card text-foreground cursor-pointer",
    "transition-colors duration-150 hover:bg-surface-soft",
    "active:scale-[0.97] motion-reduce:active:scale-100 motion-reduce:transition-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  ].join(" ");
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className={btn} onClick={() => t.success("저장되었습니다")}>
        Success
      </button>
      <button type="button" className={btn} onClick={() => t.error("오류가 발생했습니다")}>
        Error
      </button>
      <button type="button" className={btn} onClick={() => t.warning("주의가 필요합니다")}>
        Warning
      </button>
      <button type="button" className={btn} onClick={() => t.info("새 메시지가 도착했습니다")}>
        Info
      </button>
      <button
        type="button"
        className={btn}
        onClick={() =>
          t.success("실행 취소 가능", {
            action: { label: "되돌리기", onClick: () => t.info("되돌렸습니다") },
          })
        }
      >
        With Action
      </button>
    </div>
  );
}

export const Default: Story = {
  render: (args: React.ComponentProps<typeof DsToastProvider>) => (
    <DsToastProvider {...args}>
      <Trigger />
    </DsToastProvider>
  ),
};

export const TopRight: Story = {
  args: { position: "top-right" },
  render: (args: React.ComponentProps<typeof DsToastProvider>) => (
    <DsToastProvider {...args}>
      <Trigger />
    </DsToastProvider>
  ),
};

export const BottomCenter: Story = {
  args: { position: "bottom-center" },
  render: (args: React.ComponentProps<typeof DsToastProvider>) => (
    <DsToastProvider {...args}>
      <Trigger />
    </DsToastProvider>
  ),
};
