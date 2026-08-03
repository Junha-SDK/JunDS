import type { Meta, StoryObj } from "@storybook/react";
import { ButtonGroup } from "./ButtonGroup";
import { Button } from "../../primitives/Button";

const meta: Meta<typeof ButtonGroup> = {
  title: "Composites/ButtonGroup",
  component: ButtonGroup,
  argTypes: {
    separated: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
  args: {},
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Joined: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="secondary">왼쪽</Button>
      <Button variant="secondary">중앙</Button>
      <Button variant="secondary">오른쪽</Button>
    </ButtonGroup>
  ),
};

export const Separated: Story = {
  render: () => (
    <ButtonGroup separated>
      <Button variant="secondary">취소</Button>
      <Button variant="primary">확인</Button>
    </ButtonGroup>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-80">
      <ButtonGroup fullWidth>
        <Button variant="secondary" fullWidth>
          왼쪽
        </Button>
        <Button variant="secondary" fullWidth>
          오른쪽
        </Button>
      </ButtonGroup>
    </div>
  ),
};

export const TwoButtons: Story = {
  render: () => (
    <ButtonGroup>
      <Button variant="outline">이전</Button>
      <Button variant="outline">다음</Button>
    </ButtonGroup>
  ),
};
