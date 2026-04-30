import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { StarRating } from "./StarRating";

const meta: Meta<typeof StarRating> = {
  title: "Primitives/StarRating",
  component: StarRating,
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    max: { control: { type: "number", min: 1, max: 10 } },
    readonly: { control: "boolean" },
  },
  args: { value: 3, max: 5, size: "md" },
};

export default meta;
type Story = StoryObj<typeof StarRating>;

const Interactive = (props: Parameters<typeof StarRating>[0]) => {
  const [value, setValue] = useState(props.value);
  return <StarRating {...props} value={value} onChange={setValue} />;
};

export const Default: Story = { render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const Small: Story = { args: { size: "sm" }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const Large: Story = { args: { size: "lg" }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const ReadOnly: Story = { args: { readonly: true, value: 4 } };
export const Empty: Story = { args: { value: 0 }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
export const TenStars: Story = { args: { max: 10, value: 7 }, render: (args: React.ComponentProps<typeof Interactive>) => <Interactive {...args} /> };
