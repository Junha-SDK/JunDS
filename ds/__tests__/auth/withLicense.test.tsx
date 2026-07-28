import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { withLicense } from "@/ds/auth/withLicense";
import * as ProviderModule from "@/ds/auth/JunDSProvider";

function Sample({ label }: { label: string }) {
  return <div data-testid="inner">{label}</div>;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("withLicense HOC", () => {
  it("renders the wrapped component when license is valid", () => {
    vi.spyOn(ProviderModule, "useLicenseStatus").mockReturnValue("valid");
    const Wrapped = withLicense(Sample);
    render(<Wrapped label="hello" />);
    expect(screen.getByTestId("inner")).toHaveTextContent("hello");
  });

  it("renders nothing in production when license is pending", () => {
    vi.spyOn(ProviderModule, "useLicenseStatus").mockReturnValue("pending");
    const Wrapped = withLicense(Sample);
    const { container } = render(<Wrapped label="hello" />);
    expect(container.querySelector('[data-testid="inner"]')).toBeNull();
  });

  it("renders a dev-mode warning placeholder when license is invalid", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(ProviderModule, "useLicenseStatus").mockReturnValue("invalid");
    try {
      const Wrapped = withLicense(Sample, "MyComp");
      render(<Wrapped label="x" />);
      expect(screen.getByText(/MyComp.*requires a valid JunDS license/)).toBeInTheDocument();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("uses the wrapped component name when displayName is not provided", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.spyOn(ProviderModule, "useLicenseStatus").mockReturnValue("invalid");
    try {
      const Wrapped = withLicense(Sample);
      render(<Wrapped label="x" />);
      expect(screen.getByText(/Sample.*requires a valid JunDS license/)).toBeInTheDocument();
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("sets a Licensed(...) displayName on the wrapped component", () => {
    const Wrapped = withLicense(Sample, "Custom");
    expect(Wrapped.displayName).toBe("Licensed(Custom)");
  });
});
