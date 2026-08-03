import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { _isDomainAllowed, _isLocationTampered } from "@/ds/auth/domain-lock";

const ORIGINAL_LOCATION = window.location;

function stubHostname(hostname: string) {
  vi.stubGlobal("location", { ...ORIGINAL_LOCATION, hostname });
  Object.defineProperty(window, "location", {
    configurable: true,
    value: { ...ORIGINAL_LOCATION, hostname },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  Object.defineProperty(window, "location", {
    configurable: true,
    value: ORIGINAL_LOCATION,
  });
});

describe("_isDomainAllowed", () => {
  beforeEach(() => {
    stubHostname("app.example.com");
  });

  it("allows localhost regardless of allowedDomains", () => {
    stubHostname("localhost");
    expect(_isDomainAllowed(["only.example.com"])).toBe(true);
  });

  it("allows 127.0.0.1", () => {
    stubHostname("127.0.0.1");
    expect(_isDomainAllowed([])).toBe(true);
  });

  it("allows .local TLD (mDNS dev)", () => {
    stubHostname("mybook.local");
    expect(_isDomainAllowed(["only.example.com"])).toBe(true);
  });

  it("returns true when allowedDomains is undefined (graceful default)", () => {
    expect(_isDomainAllowed(undefined)).toBe(true);
  });

  it("returns true when allowedDomains is empty", () => {
    expect(_isDomainAllowed([])).toBe(true);
  });

  it("returns true on exact match", () => {
    expect(_isDomainAllowed(["app.example.com"])).toBe(true);
  });

  it("returns false on mismatch", () => {
    expect(_isDomainAllowed(["other.example.com"])).toBe(false);
  });

  it("matches wildcard subdomains via *.base", () => {
    expect(_isDomainAllowed(["*.example.com"])).toBe(true);
  });

  it("wildcard matches the apex domain too", () => {
    stubHostname("example.com");
    expect(_isDomainAllowed(["*.example.com"])).toBe(true);
  });

  it("wildcard does not match a different base", () => {
    stubHostname("app.other.com");
    expect(_isDomainAllowed(["*.example.com"])).toBe(false);
  });
});

describe("_isLocationTampered", () => {
  it("returns boolean", () => {
    expect(typeof _isLocationTampered()).toBe("boolean");
  });

  it("returns true when location is configurable (i.e. tampered)", () => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: window.location,
    });
    expect(_isLocationTampered()).toBe(true);
  });
});
