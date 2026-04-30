import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SegmentedControl } from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
  title: "Composites/SegmentedControl",
  component: SegmentedControl,
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    fullWidth: { control: "boolean" },
  },
  args: { size: "md", fullWidth: false },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

const options = [
  { key: "list", label: "목록" },
  { key: "grid", label: "그리드" },
  { key: "kanban", label: "칸반" },
];

const Demo = (props: Omit<Parameters<typeof SegmentedControl>[0], "value" | "onChange">) => {
  const [value, setValue] = useState(options[0].key);
  return <SegmentedControl {...props} value={value} onChange={setValue} />;
};

export const Default: Story = {
  args: { options },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const Small: Story = {
  args: { options, size: "sm" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const Large: Story = {
  args: { options, size: "lg" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const FullWidth: Story = {
  args: { options, fullWidth: true },
  render: (args: React.ComponentProps<typeof Demo>) => (
    <div className="w-96">
      <Demo {...args} />
    </div>
  ),
};

function TwoOptionsDemo() {
  const opts = [
    { key: "month", label: "월간" },
    { key: "year", label: "연간" },
  ];
  const [value, setValue] = useState(opts[0].key);
  return <SegmentedControl options={opts} value={value} onChange={setValue} />;
}

export const TwoOptions: Story = {
  render: () => <TwoOptionsDemo />,
};
