import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import {
  JunDSProvider,
  useJunDS,
  useLicenseStatus,
} from "@/ds/auth/JunDSProvider";

const VALID_KEY = "JUNDS-ABCD-1234-EFGH-5678";

function StatusReadout() {
  const status = useLicenseStatus();
  return <div data-testid="status">{status}</div>;
}

function FullReadout() {
  const { license } = useJunDS();
  return (
    <div>
      <span data-testid="status">{license.status}</span>
      <span data-testid="plan">{license.plan ?? ""}</span>
      <span data-testid="exp">{license.expiresAt ?? ""}</span>
    </div>
  );
}

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe("JunDSProvider — happy path", () => {
  it("transitions pending → valid and renders children", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          valid: true,
          plan: "pro",
          expiresAt: "2099-01-01T00:00:00Z",
          domains: ["*"],
        }),
        { status: 200 },
      ),
    );

    render(
      <JunDSProvider licenseKey={VALID_KEY}>
        <FullReadout />
      </JunDSProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("valid");
    });
    expect(screen.getByTestId("plan")).toHaveTextContent("pro");
    expect(screen.getByTestId("exp")).toHaveTextContent("2099-01-01T00:00:00Z");
  });

  it("renders fallback while pending", () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(
      () => new Promise(() => {}), // never resolves
    );

    render(
      <JunDSProvider
        licenseKey={VALID_KEY}
        fallback={<span data-testid="fb">loading</span>}
      >
        <StatusReadout />
      </JunDSProvider>,
    );

    expect(screen.getByTestId("fb")).toBeInTheDocument();
  });
});

describe("JunDSProvider — error paths", () => {
  it("renders the invalid-license screen when format is bad", async () => {
    render(
      <JunDSProvider licenseKey="not-a-license">
        <StatusReadout />
      </JunDSProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/JunDS License Invalid/)).toBeInTheDocument();
    });
  });

  it("transitions to expired when expiresAt is in the past", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          valid: true,
          plan: "starter",
          expiresAt: "2000-01-01T00:00:00Z",
        }),
        { status: 200 },
      ),
    );

    render(
      <JunDSProvider licenseKey={VALID_KEY}>
        <StatusReadout />
      </JunDSProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/JunDS License Expired/)).toBeInTheDocument();
    });
  });

  it("invokes onLicenseError on invalid", async () => {
    const onErr = vi.fn();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ valid: false }), { status: 200 }),
    );

    render(
      <JunDSProvider licenseKey={VALID_KEY} onLicenseError={onErr}>
        <StatusReadout />
      </JunDSProvider>,
    );

    await waitFor(() => {
      expect(onErr).toHaveBeenCalledWith("invalid");
    });
  });

  it("rejects when domain is not in the allowed list", async () => {
    const originalLocation = window.location;
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...originalLocation, hostname: "evil.example.com" },
    });
    try {
      vi.spyOn(globalThis, "fetch").mockResolvedValue(
        new Response(
          JSON.stringify({
            valid: true,
            plan: "pro",
            domains: ["only.allowed.com"],
          }),
          { status: 200 },
        ),
      );

      const onErr = vi.fn();
      render(
        <JunDSProvider licenseKey={VALID_KEY} onLicenseError={onErr}>
          <StatusReadout />
        </JunDSProvider>,
      );

      await waitFor(() => {
        expect(onErr).toHaveBeenCalledWith("invalid");
      });
    } finally {
      Object.defineProperty(window, "location", {
        configurable: true,
        value: originalLocation,
      });
    }
  });
});

describe("useJunDS / useLicenseStatus", () => {
  it("useLicenseStatus returns 'pending' outside a provider (default context)", () => {
    render(<StatusReadout />);
    expect(screen.getByTestId("status")).toHaveTextContent("pending");
  });

  it("useJunDS exposes the license object", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ valid: true, plan: "team" }), {
        status: 200,
      }),
    );

    render(
      <JunDSProvider licenseKey={VALID_KEY}>
        <FullReadout />
      </JunDSProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("valid");
    });
    expect(screen.getByTestId("plan")).toHaveTextContent("team");
  });
});

describe("JunDSProvider — lifecycle", () => {
  it("clears its revalidation interval on unmount", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ valid: true }), { status: 200 }),
    );
    const clearSpy = vi.spyOn(globalThis, "clearInterval");

    const { unmount } = render(
      <JunDSProvider licenseKey={VALID_KEY}>
        <StatusReadout />
      </JunDSProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("status")).toHaveTextContent("valid");
    });

    await act(async () => {
      unmount();
    });

    expect(clearSpy).toHaveBeenCalled();
  });
});
