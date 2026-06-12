import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  I18nProvider,
  useI18n,
  useT,
  interpolate,
  defaultLocale,
  enLocale,
} from "@/ds/providers/I18nProvider";

function ReadKey({ k }: { k: keyof typeof defaultLocale }) {
  const dict = useI18n();
  return <span data-testid="v">{dict[k]}</span>;
}

function ReadT({ k, params }: { k: string; params?: Record<string, string | number> }) {
  const t = useT();
  return <span data-testid="v">{t(k, params)}</span>;
}

describe("interpolate", () => {
  it("returns the message unchanged when no params are given", () => {
    expect(interpolate("Hello")).toBe("Hello");
  });

  it("replaces {var} placeholders with param values", () => {
    expect(interpolate("Hello, {name}!", { name: "Junha" })).toBe(
      "Hello, Junha!",
    );
  });

  it("supports number values", () => {
    expect(interpolate("{n} items", { n: 3 })).toBe("3 items");
  });

  it("leaves missing placeholders intact", () => {
    expect(interpolate("Hello, {name}!", {})).toBe("Hello, {name}!");
  });

  it("replaces multiple occurrences of the same key", () => {
    expect(interpolate("{x} + {x}", { x: 1 })).toBe("1 + 1");
  });
});

describe("I18nProvider — default", () => {
  it("returns Korean strings without any provider", () => {
    render(<ReadKey k="close" />);
    expect(screen.getByTestId("v")).toHaveTextContent("닫기");
  });

  it("returns Korean strings under provider with no locale prop", () => {
    render(
      <I18nProvider>
        <ReadKey k="confirm" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("v")).toHaveTextContent("확인");
  });
});

describe("I18nProvider — locale='en' shorthand", () => {
  it("swaps the entire dictionary to English", () => {
    render(
      <I18nProvider locale="en">
        <ReadKey k="close" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("v")).toHaveTextContent("Close");
  });

  it("falls back to default for unknown locale ids", () => {
    render(
      <I18nProvider locale={"jp" as never}>
        <ReadKey k="close" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("v")).toHaveTextContent("닫기");
  });
});

describe("I18nProvider — Partial<Locale> override", () => {
  it("replaces only listed keys, keeps the rest as Korean default", () => {
    render(
      <I18nProvider locale={{ close: "x" }}>
        <ReadKey k="close" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("v")).toHaveTextContent("x");
  });

  it("untouched keys still come from the Korean default", () => {
    render(
      <I18nProvider locale={{ close: "x" }}>
        <ReadKey k="confirm" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("v")).toHaveTextContent("확인");
  });
});

describe("useT — interpolated translation", () => {
  it("looks up known keys", () => {
    render(<ReadT k="cancel" />);
    expect(screen.getByTestId("v")).toHaveTextContent("취소");
  });

  it("returns the input string unchanged when not a known key", () => {
    render(<ReadT k="Hello" />);
    expect(screen.getByTestId("v")).toHaveTextContent("Hello");
  });

  it("interpolates {var} placeholders in arbitrary strings", () => {
    render(<ReadT k="Hi, {name}" params={{ name: "Junha" }} />);
    expect(screen.getByTestId("v")).toHaveTextContent("Hi, Junha");
  });

  it("respects the active locale when looking up keys", () => {
    render(
      <I18nProvider locale="en">
        <ReadT k="cancel" />
      </I18nProvider>,
    );
    expect(screen.getByTestId("v")).toHaveTextContent("Cancel");
  });
});

describe("locale dictionaries", () => {
  it("enLocale covers every key in defaultLocale", () => {
    const koKeys = Object.keys(defaultLocale);
    const enKeys = Object.keys(enLocale);
    expect(enKeys.sort()).toEqual(koKeys.sort());
  });
});
