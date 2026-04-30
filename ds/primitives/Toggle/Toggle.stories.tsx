import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Toggle } from "./Toggle";

const meta: Meta<typeof Toggle> = {
  title: "Primitives/Toggle",
  component: Toggle,
  argTypes: {
    size: { control: "radio", options: ["sm", "md"] },
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { size: "md", label: "알림" },
};

export default meta;
type Story = StoryObj<typeof Toggle>;

const Interactive = (props: Parameters<typeof Toggle>[0]) => {
  const [checked, setChecked] = useState(!!props.checked);
  return <Toggle {...props} checked={checked} onChange={setChecked} />;
};

export const Off: Story = { render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} checked={false} /> };
export const On: Story = { render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} checked={true} /> };
export const Small: Story = { args: { size: "sm" }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const Disabled: Story = { args: { disabled: true }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const NoLabel: Story = { args: { label: undefined }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
