import type { Meta, StoryObj } from "@storybook/react";
import { FormBuilder } from "./FormBuilder";

const meta: Meta<typeof FormBuilder> = {
  title: "Patterns/FormBuilder",
  component: FormBuilder,
};

export default meta;
type Story = StoryObj<typeof FormBuilder>;

export const Default: Story = {
  render: () => <FormBuilder fields={[]} onSubmit={() => {}} />,
};
