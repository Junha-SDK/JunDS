import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar, ProgressSteps } from "./Progress";

const meta: Meta<typeof ProgressBar> = {
  title: "Composites/Progress",
  component: ProgressBar,
  argTypes: {
    variant: { control: "select", options: ["default", "success", "warning", "danger"] },
    size: { control: "radio", options: ["sm", "md", "lg"] },
    showLabel: { control: "boolean" },
    animated: { control: "boolean" },
  },
  args: { value: 60, max: 100, variant: "default", size: "md" },
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Default: Story = {
  render: (args: React.ComponentProps<typeof ProgressBar>) => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const WithLabel: Story = {
  args: { showLabel: true, label: "업로드 중" },
  render: (args: React.ComponentProps<typeof ProgressBar>) => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Success: Story = {
  args: { value: 100, variant: "success", showLabel: true },
  render: (args: React.ComponentProps<typeof ProgressBar>) => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Danger: Story = {
  args: { value: 25, variant: "danger", size: "lg", showLabel: true },
  render: (args: React.ComponentProps<typeof ProgressBar>) => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Animated: Story = {
  args: { value: 70, animated: true },
  render: (args: React.ComponentProps<typeof ProgressBar>) => (
    <div className="w-80">
      <ProgressBar {...args} />
    </div>
  ),
};

export const Steps: Story = {
  render: () => (
    <div className="w-[420px]">
      <ProgressSteps
        current={2}
        total={4}
        labels={["접수", "진행", "검토", "완료"]}
      />
    </div>
  ),
};
