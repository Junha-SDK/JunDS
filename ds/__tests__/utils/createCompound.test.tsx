import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { createRef, forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { createCompound } from "../../utils/createCompound";

function makeRoot() {
  return function Root({ children }: { children?: ReactNode }) {
    return <div data-testid="root">{children}</div>;
  };
}

function makeHeader() {
  return function Header({ children, ...props }: HTMLAttributes<HTMLDivElement>) {
    return (
      <div data-testid="header" {...props}>
        {children}
      </div>
    );
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("createCompound", () => {
  it("attaches members to the root and both render", () => {
    const Compound = createCompound(makeRoot(), { Header: makeHeader() });
    render(
      <Compound>
        <Compound.Header>제목</Compound.Header>
      </Compound>,
    );
    expect(screen.getByTestId("root")).toBeInTheDocument();
    expect(screen.getByTestId("header")).toHaveTextContent("제목");
  });

  it("warns in dev when a member key already exists on the root", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const Root = makeRoot() as ReturnType<typeof makeRoot> & { Header?: unknown };
    Root.Header = makeHeader(); // 기존 직접 대입 잔재를 흉내
    createCompound(Root, { Header: makeHeader() });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('멤버 키 "Header"가 root에 이미 존재합니다'),
    );
  });

  it("does not warn when member keys are new", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    createCompound(makeRoot(), { Header: makeHeader() });
    expect(warn).not.toHaveBeenCalled();
  });

  it("errors in dev when asChild is passed to a sub-member", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const Compound = createCompound(makeRoot(), { Header: makeHeader() });
    render(
      <Compound>
        {/* @ts-expect-error — sub-member는 asChild를 받지 않는다 (런타임 가드 검증) */}
        <Compound.Header asChild>제목</Compound.Header>
      </Compound>,
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("[JunDS] sub-member에는 asChild를 사용할 수 없습니다"),
    );
    // asChild는 멤버로 전달되지 않고 제거된다 — DOM에 새지 않는다.
    expect(screen.getByTestId("header")).not.toHaveAttribute("aschild");
  });

  it("does not error when a sub-member is used without asChild", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const Compound = createCompound(makeRoot(), { Header: makeHeader() });
    render(
      <Compound>
        <Compound.Header>제목</Compound.Header>
      </Compound>,
    );
    expect(error).not.toHaveBeenCalled();
  });

  it("forwards refs through the dev guard to forwardRef members", () => {
    const Item = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
      (props, ref) => <button type="button" ref={ref} {...props} />,
    );
    Item.displayName = "Item";
    const Compound = createCompound(makeRoot(), { Item });
    const ref = createRef<HTMLButtonElement>();
    render(
      <Compound>
        <Compound.Item ref={ref}>x</Compound.Item>
      </Compound>,
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("passes regular props through to the member unchanged", () => {
    const Compound = createCompound(makeRoot(), { Header: makeHeader() });
    render(
      <Compound>
        <Compound.Header className="custom" id="hd">
          제목
        </Compound.Header>
      </Compound>,
    );
    const header = screen.getByTestId("header");
    expect(header).toHaveClass("custom");
    expect(header).toHaveAttribute("id", "hd");
  });
});
