import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Disclosure } from "../../composites/Disclosure";

describe("Disclosure", () => {
  it("renders trigger and hides content by default", () => {
    const { getByText, queryByText } = render(
      <Disclosure>
        <Disclosure.Trigger>open</Disclosure.Trigger>
        <Disclosure.Content>secret</Disclosure.Content>
      </Disclosure>,
    );
    expect(getByText("open")).toBeInTheDocument();
    expect(queryByText("secret")).not.toBeInTheDocument();
  });

  it("toggles content when trigger is clicked (uncontrolled)", () => {
    const { getByText, queryByText } = render(
      <Disclosure>
        <Disclosure.Trigger>open</Disclosure.Trigger>
        <Disclosure.Content>secret</Disclosure.Content>
      </Disclosure>,
    );
    fireEvent.click(getByText("open"));
    expect(getByText("secret")).toBeInTheDocument();
    fireEvent.click(getByText("open"));
    expect(queryByText("secret")).not.toBeInTheDocument();
  });

  it("respects controlled open prop and calls onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { getByText, queryByText, rerender } = render(
      <Disclosure open={false} onOpenChange={onOpenChange}>
        <Disclosure.Trigger>open</Disclosure.Trigger>
        <Disclosure.Content>secret</Disclosure.Content>
      </Disclosure>,
    );
    expect(queryByText("secret")).not.toBeInTheDocument();
    fireEvent.click(getByText("open"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    rerender(
      <Disclosure open={true} onOpenChange={onOpenChange}>
        <Disclosure.Trigger>open</Disclosure.Trigger>
        <Disclosure.Content>secret</Disclosure.Content>
      </Disclosure>,
    );
    expect(getByText("secret")).toBeInTheDocument();
  });

  it("links trigger to content via aria-controls + aria-expanded", () => {
    const { getByText } = render(
      <Disclosure defaultOpen>
        <Disclosure.Trigger>t</Disclosure.Trigger>
        <Disclosure.Content>c</Disclosure.Content>
      </Disclosure>,
    );
    const trigger = getByText("t");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    const controlsId = trigger.getAttribute("aria-controls");
    expect(controlsId).toBeTruthy();
    expect(getByText("c").id).toBe(controlsId);
  });

  it("throws helpful error when sub-component is rendered without root", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Disclosure.Trigger>x</Disclosure.Trigger>)).toThrow(
      /must be rendered inside a <Disclosure>/,
    );
    consoleError.mockRestore();
  });
});
