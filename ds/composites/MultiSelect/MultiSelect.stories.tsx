import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { MultiSelect } from "./MultiSelect";

const meta: Meta<typeof MultiSelect> = {
  title: "Composites/MultiSelect",
  component: MultiSelect,
  argTypes: {
    searchable: { control: "boolean" },
    maxDisplay: { control: { type: "number", min: 1, max: 10 } },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: { placeholder: "기술 선택" },
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "angular", label: "Angular" },
  { value: "next", label: "Next.js" },
  { value: "nuxt", label: "Nuxt" },
  { value: "remix", label: "Remix" },
];

const Demo = (props: Omit<Parameters<typeof MultiSelect>[0], "value" | "onChange">) => {
  const [value, setValue] = useState<string[]>(["react", "next"]);
  return (
    <div className="w-80">
      <MultiSelect {...props} value={value} onChange={setValue} />
    </div>
  );
};

export const Default: Story = {
  args: { options },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

export const Searchable: Story = {
  args: { options, searchable: true },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};

function EmptyDemo() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="w-80">
      <MultiSelect options={options} value={value} onChange={setValue} />
    </div>
  );
}

export const Empty: Story = {
  render: () => <EmptyDemo />,
};

function ManySelectedDemo() {
  const [value, setValue] = useState<string[]>(["react", "vue", "svelte", "next", "remix"]);
  return (
    <div className="w-80">
      <MultiSelect options={options} value={value} onChange={setValue} maxDisplay={2} />
    </div>
  );
}

export const ManySelected: Story = {
  render: () => <ManySelectedDemo />,
};

export const Error: Story = {
  args: { options, error: true },
  render: (args: React.ComponentProps<typeof Demo>) => <Demo {...args} />,
};
