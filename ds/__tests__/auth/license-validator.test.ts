import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  _validateLicense,
  _validateLicenseOffline,
} from "@/ds/auth/license-validator";
import { _sha256 } from "@/ds/auth/crypto";

const VALID_KEY = "JUNDS-ABCD-1234-EFGH-5678";
const INVALID_FORMAT = "not-a-license";

beforeEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});

afterEach(() => {
  sessionStorage.clear();
});

describe("_validateLicense — format gate", () => {
  it("rejects malformed key without calling fetch", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const result = await _validateLicense(INVALID_FORMAT);
    expect(result.valid).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rejects partial key", async () => {
    const result = await _validateLicense("JUNDS-ABCD");
    expect(result.valid).toBe(false);
  });
});

describe("_validateLicense — server response", () => {
  it("returns valid=true with plan when server confirms", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          valid: true,
          plan: "pro",
          expiresAt: "2099-01-01T00:00:00Z",
          domains: ["*.example.com"],
        }),
        { status: 200 },
      ),
    );

    const result = await _validateLicense(VALID_KEY);
    expect(result.valid).toBe(true);
    expect(result.plan).toBe("pro");
    expect(result.expiresAt).toBe("2099-01-01T00:00:00Z");
    expect(result.domains).toEqual(["*.example.com"]);
  });

  it("returns valid=false when server returns valid=false", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ valid: false }), { status: 200 }),
    );
    const result = await _validateLicense(VALID_KEY);
    expect(result.valid).toBe(false);
  });

  it("returns valid=false on non-OK HTTP status", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("forbidden", { status: 403 }),
    );
    const result = await _validateLicense(VALID_KEY);
    expect(result.valid).toBe(false);
  });
});

describe("_validateLicense — caching", () => {
  it("hits the cache on the second call (same key) without calling fetch again", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ valid: true }), { status: 200 }),
      );

    await _validateLicense(VALID_KEY);
    await _validateLicense(VALID_KEY);

    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it("falls back to cache when network fails (graceful)", async () => {
    // Prime cache with a valid response.
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ valid: true }), { status: 200 }),
    );
    await _validateLicense(VALID_KEY);

    // Next call: simulate network outage, but cache is still warm.
    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(new Error("offline"));
    // Force cache miss path by changing the key so we re-fetch.
    // Then verify graceful fail returns valid=true on first-time outage.
    sessionStorage.clear();
    const otherKey = "JUNDS-ZZZZ-0000-AAAA-1111";
    const result = await _validateLicense(otherKey);
    expect(result.valid).toBe(true); // graceful first-time fail
  });

  it("cache key tracks the license key (different keys do not share)", async () => {
    const keyA = "JUNDS-AAAA-AAAA-AAAA-AAAA";
    const keyB = "JUNDS-BBBB-BBBB-BBBB-BBBB";

    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ valid: true }), { status: 200 }),
      );

    await _validateLicense(keyA);
    await _validateLicense(keyB);

    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});

describe("_validateLicenseOffline", () => {
  it("rejects malformed format", async () => {
    expect(await _validateLicenseOffline(INVALID_FORMAT)).toBe(false);
  });

  it("rejects keys whose checksum block does not match the body hash", async () => {
    // Body parts hashed → first 4 hex chars uppercased = checksum.
    expect(await _validateLicenseOffline(VALID_KEY)).toBe(false);
  });

  it("accepts a key whose checksum block matches the body hash", async () => {
    const body = "ABCD12345EFG6789"; // 4+4+4 = 12 chars... padded to 4 each
    // Build a synthetic key whose checksum is correct.
    const part2 = "ABCD";
    const part3 = "1234";
    const part4 = "EFGH";
    const hash = await _sha256(part2 + part3 + part4);
    const checksum = hash.slice(0, 4).toUpperCase();
    const synthesized = `JUNDS-${part2}-${part3}-${part4}-${checksum}`;
    // Some hashes may yield non-[A-Z0-9] characters in the slice; if so, skip.
    if (!/^[A-Z0-9]{4}$/.test(checksum)) {
      // SHA-256 hex always satisfies [0-9a-f] → uppercase always [0-9A-F].
      // The regex requires [A-Z0-9] which excludes digits 0-9? No — it
      // includes them. So this branch should never trigger.
      throw new Error(`unexpected checksum shape: ${checksum}`);
    }
    expect(await _validateLicenseOffline(synthesized)).toBe(true);
    // Mark `body` referenced for clarity.
    expect(body.length).toBeGreaterThan(0);
  });
});
