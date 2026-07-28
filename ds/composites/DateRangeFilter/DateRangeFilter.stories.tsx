import type { Meta, StoryObj } from "@storybook/react";
import { DateRangeFilter } from "./DateRangeFilter";

const meta: Meta<typeof DateRangeFilter> = {
  title: "Composites/DateRangeFilter",
  component: DateRangeFilter,
};

export default meta;
type Story = StoryObj<typeof DateRangeFilter>;

export const Default: Story = {
  render: () => (
    <DateRangeFilter
      startDate=""
      endDate=""
      onStartChange={() => {}}
      onEndChange={() => {}}
      onApply={() => {}}
    />
  ),
};
