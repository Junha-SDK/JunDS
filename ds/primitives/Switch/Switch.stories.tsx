import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Primitives/Switch",
  component: Switch,
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { size: "md", label: "알림 수신" },
};

export default meta;
type Story = StoryObj<typeof Switch>;

const Interactive = (props: Parameters<typeof Switch>[0]) => {
  const [checked, setChecked] = useState(!!props.checked);
  return <Switch {...props} checked={checked} onChange={setChecked} />;
};

export const Off: Story = { render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} checked={false} /> };
export const On: Story = { render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} checked={true} /> };
export const Small: Story = { args: { size: "sm" }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} checked={true} /> };
export const Large: Story = { args: { size: "lg" }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} checked={true} /> };
export const Disabled: Story = { args: { disabled: true }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} checked={true} /> };
