import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";

// jsdom marks window.location as `configurable: true`, which makes
// _isLocationTampered() believe the page is being attacked. Force it to
// always report "not tampered" so we can exercise the rest of the provider
// state machine. Real browsers always have configurable: false here.
vi.mock("@/ds/auth/domain-lock", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/ds/auth/domain-lock")>();
  return {
    ...actual,
    _isLocationTampered: () => false,
  };
});

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

function mockFetchOk(body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(
      () =>
        Promise.resolve(
          new Response(JSON.stringify(body), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
        ),
    ),
  );
}

function mockFetchPending() {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation(() => new Promise(() => {})),
  );
}

beforeEach(() => {
  vi.unstubAllGlobals();
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  sessionStorage.clear();
});

describe("JunDSProvider — happy path", () => {
  it("transitions pending → valid and renders children", async () => {
    mockFetchOk({
      valid: true,
      plan: "pro",
      expiresAt: "2099-01-01T00:00:00Z",
    });

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
    mockFetchPending();

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
    mockFetchPending(); // never used because format check rejects first
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
    mockFetchOk({
      valid: true,
      plan: "starter",
      expiresAt: "2000-01-01T00:00:00Z",
    });

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
    mockFetchOk({ valid: false });
    const onErr = vi.fn();

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
      mockFetchOk({
        valid: true,
        plan: "pro",
        domains: ["only.allowed.com"],
      });

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
    mockFetchOk({ valid: true, plan: "team" });

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
    mockFetchOk({ valid: true });
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
