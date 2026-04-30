import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Combobox } from "./Combobox";

const meta: Meta<typeof Combobox> = {
  title: "Composites/Combobox",
  component: Combobox,
  argTypes: {
    creatable: { control: "boolean" },
    loading: { control: "boolean" },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { placeholder: "사용자 검색..." },
};

export default meta;
type Story = StoryObj<typeof Combobox>;

const options = [
  { value: "alice", label: "Alice Kim", description: "프론트엔드 엔지니어" },
  { value: "bob", label: "Bob Lee", description: "백엔드 엔지니어" },
  { value: "carol", label: "Carol Park", description: "디자이너" },
  { value: "dave", label: "Dave Choi", description: "PM" },
];

const Demo = (props: Parameters<typeof Combobox>[0]) => {
  const [value, setValue] = useState<string | undefined>(props.value);
  return (
    <div className="w-80">
      <Combobox {...props} value={value} onChange={setValue} />
    </div>
  );
};

export const Default: Story = {
  args: { options },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const Creatable: Story = {
  args: { options, creatable: true, onCreateLabel: "새로 만들기:" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const Loading: Story = {
  args: { options: [], loading: true },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const Empty: Story = {
  args: { options: [], emptyMessage: "사용자를 찾을 수 없습니다" },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const Error: Story = {
  args: { options, error: true },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};
