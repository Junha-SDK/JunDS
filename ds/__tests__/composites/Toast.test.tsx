import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DsToastProvider, useDsToast } from "../../composites/Toast";

function TestComponent() {
  const { success, error } = useDsToast();
  return (
    <>
      <button onClick={() => success("성공!")}>show-success</button>
      <button onClick={() => error("에러!")}>show-error</button>
    </>
  );
}

describe("Toast", () => {
  it("shows toast on trigger", () => {
    render(
      <DsToastProvider>
        <TestComponent />
      </DsToastProvider>,
    );
    fireEvent.click(screen.getByText("show-success"));
    expect(screen.getByText("성공!")).toBeInTheDocument();
  });

  it("shows error toast", () => {
    render(
      <DsToastProvider>
        <TestComponent />
      </DsToastProvider>,
    );
    fireEvent.click(screen.getByText("show-error"));
    expect(screen.getByText("에러!")).toBeInTheDocument();
  });

  it("auto-dismisses toast", async () => {
    vi.useFakeTimers();
    render(
      <DsToastProvider>
        <TestComponent />
      </DsToastProvider>,
    );
    fireEvent.click(screen.getByText("show-success"));
    expect(screen.getByText("성공!")).toBeInTheDocument();
    await act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByText("성공!")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("throws when used outside provider", () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useDsToast는 DsToastProvider 안에서 사용하세요");
  });
});
