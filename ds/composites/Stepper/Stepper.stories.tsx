import type { Meta, StoryObj } from "@storybook/react";
import { Stepper } from "./Stepper";

const meta: Meta<typeof Stepper> = {
  title: "Composites/Stepper",
  component: Stepper,
  argTypes: {
    direction: { control: "radio", options: ["horizontal", "vertical"] },
    current: { control: { type: "number", min: 0, max: 3 } },
  },
  args: { current: 1, direction: "horizontal" },
};

export default meta;
type Story = StoryObj<typeof Stepper>;

const steps = [
  { key: "1", title: "정보 입력", description: "기본 정보를 입력합니다" },
  { key: "2", title: "확인", description: "내용을 검토합니다" },
  { key: "3", title: "완료", description: "제출이 완료되었습니다" },
];

export const Horizontal: Story = {
  args: { steps, current: 1 },
  render: (args: React.ComponentProps<typeof Stepper>) => (
    <div className="w-[520px]">
      <Stepper {...args} />
    </div>
  ),
};

export const Vertical: Story = {
  args: { steps, current: 1, direction: "vertical" },
};

export const FirstStep: Story = {
  args: { steps, current: 0 },
  render: (args: React.ComponentProps<typeof Stepper>) => (
    <div className="w-[520px]">
      <Stepper {...args} />
    </div>
  ),
};

export const LastStep: Story = {
  args: { steps, current: 2 },
  render: (args: React.ComponentProps<typeof Stepper>) => (
    <div className="w-[520px]">
      <Stepper {...args} />
    </div>
  ),
};

export const NoDescription: Story = {
  args: {
    steps: steps.map(({ description: _description, ...s }) => s),
    current: 1,
  },
  render: (args: React.ComponentProps<typeof Stepper>) => (
    <div className="w-[520px]">
      <Stepper {...args} />
    </div>
  ),
};
