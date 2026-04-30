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
  const btn =
    "px-3 py-1.5 text-sm rounded-lg border border-border text-foreground hover:bg-gray-50 cursor-pointer";
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
