import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Select } from "./Select";

const meta: Meta<typeof Select> = {
  title: "Composites/Select",
  component: Select,
  argTypes: {
    size: { control: "radio", options: ["sm", "md", "lg"] },
    searchable: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
  args: { placeholder: "국가 선택" },
};

export default meta;
type Story = StoryObj<typeof Select>;

const options = [
  { value: "kr", label: "한국" },
  { value: "us", label: "미국" },
  { value: "jp", label: "일본" },
  { value: "uk", label: "영국" },
  { value: "fr", label: "프랑스" },
  { value: "de", label: "독일" },
];

const Demo = (props: Parameters<typeof Select>[0]) => {
  const [value, setValue] = useState<string | undefined>(props.value);
  return <Select {...props} value={value} onChange={setValue} />;
};

export const Default: Story = {
  args: { options },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const Searchable: Story = {
  args: { options, searchable: true },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const WithValue: Story = {
  args: { options, value: "kr" },
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

export const Error: Story = {
  args: { options, error: true },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const Disabled: Story = {
  args: { options, disabled: true, value: "kr" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};
