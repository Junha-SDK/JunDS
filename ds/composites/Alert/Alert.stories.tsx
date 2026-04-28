import type { Meta, StoryObj } from "@storybook/react";
import { Alert } from "./Alert";

const meta: Meta<typeof Alert> = {
  title: "Composites/Alert",
  component: Alert,
  argTypes: {
    variant: { control: "select", options: ["info", "success", "warning", "danger"] },
  },
  args: { title: "알림", children: "이것은 알림 메시지입니다.", variant: "info" },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Info: Story = { args: { variant: "info" } };
export const Success: Story = { args: { variant: "success", title: "성공", children: "작업이 완료되었습니다." } };
export const Warning: Story = { args: { variant: "warning", title: "경고", children: "주의가 필요합니다." } };
export const Danger: Story = { args: { variant: "danger", title: "오류", children: "문제가 발생했습니다." } };
