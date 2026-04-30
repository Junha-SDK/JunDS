import type { Meta, StoryObj } from "@storybook/react";
import { FormField } from "./FormField";

const meta: Meta<typeof FormField> = {
  title: "Composites/FormField",
  component: FormField,
};

export default meta;
type Story = StoryObj<typeof FormField>;

export const Default: Story = {
  render: () => <FormField>{null}</FormField>,
};
