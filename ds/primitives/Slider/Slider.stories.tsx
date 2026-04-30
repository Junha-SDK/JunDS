import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Primitives/Slider",
  component: Slider,
  argTypes: {
    color: { control: "select", options: ["primary", "success", "warning", "danger"] },
    size: { control: "radio", options: ["sm", "md"] },
    showValue: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { min: 0, max: 100, step: 1 },
};

export default meta;
type Story = StoryObj<typeof Slider>;

const Interactive = (props: Parameters<typeof Slider>[0]) => {
  const [value, setValue] = useState(props.value ?? 40);
  return (
    <div className="w-80">
      <Slider {...props} value={value} onChange={setValue} />
    </div>
  );
};

export const Default: Story = { render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const ShowValue: Story = { args: { showValue: true }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const Step10: Story = { args: { step: 10, showValue: true }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const Success: Story = { args: { color: "success", showValue: true }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const Danger: Story = { args: { color: "danger", showValue: true }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const Disabled: Story = { args: { disabled: true, showValue: true }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} value={60} /> };
function WithMarksDemo() {
  const [value, setValue] = useState(50);
  return (
    <div className="w-80 pb-6">
      <Slider
        value={value}
        onChange={setValue}
        marks={[
          { value: 0, label: "0%" },
          { value: 50, label: "50%" },
          { value: 100, label: "100%" },
        ]}
      />
    </div>
  );
}

export const WithMarks: Story = {
  render: () => <WithMarksDemo />,
};
