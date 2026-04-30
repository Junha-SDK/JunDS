import type { Meta, StoryObj } from "@storybook/react";
import { BookCard } from "./BookCard";

const meta: Meta<typeof BookCard> = {
  title: "Composites/BookCard",
  component: BookCard,
};

export default meta;
type Story = StoryObj<typeof BookCard>;

export const Default: Story = {
  render: () => <BookCard title="" />,
};
