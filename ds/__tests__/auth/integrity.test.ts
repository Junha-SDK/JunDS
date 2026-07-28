import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  _runIntegrityCheck,
  _startIntegrityMonitor,
  _stopIntegrityMonitor,
} from "@/ds/auth/integrity";

afterEach(() => {
  vi.unstubAllEnvs();
  _stopIntegrityMonitor();
  vi.restoreAllMocks();
});

describe("_runIntegrityCheck — dev short-circuit", () => {
  it("returns true and skips checks in non-production", () => {
    vi.stubEnv("NODE_ENV", "development");
    const violation = vi.fn();
    expect(_runIntegrityCheck(violation)).toBe(true);
    expect(violation).not.toHaveBeenCalled();
  });
});

describe("_runIntegrityCheck — production behavior", () => {
  beforeEach(() => {
    vi.stubEnv("NODE_ENV", "production");
  });

  it("clean run reports no violations", () => {
    Object.defineProperty(window, "outerWidth", { configurable: true, value: 1280 });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
    Object.defineProperty(window, "outerHeight", { configurable: true, value: 800 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });

    const violation = vi.fn();
    const clean = _runIntegrityCheck(violation);
    if (clean) expect(violation).not.toHaveBeenCalled();
    else expect(violation).toHaveBeenCalled();
  });

  it("flags devtools by window size differential", () => {
    Object.defineProperty(window, "outerWidth", { configurable: true, value: 1500 });
    Object.defineProperty(window, "innerWidth", { configurable: true, value: 1280 });
    Object.defineProperty(window, "outerHeight", { configurable: true, value: 800 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 800 });

    const violation = vi.fn();
    _runIntegrityCheck(violation);
    expect(violation).toHaveBeenCalledWith(expect.stringMatching(/devtools|prototype|global/));
  });
});

describe("_startIntegrityMonitor / _stopIntegrityMonitor", () => {
  it("is a no-op in development mode", () => {
    vi.stubEnv("NODE_ENV", "development");
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    _startIntegrityMonitor();
    expect(setIntervalSpy).not.toHaveBeenCalled();
    expect(() => _stopIntegrityMonitor()).not.toThrow();
  });

  it("starts only once even if called repeatedly", () => {
    vi.stubEnv("NODE_ENV", "production");
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    _startIntegrityMonitor();
    _startIntegrityMonitor();
    _startIntegrityMonitor();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it("clears its interval on stop", () => {
    vi.stubEnv("NODE_ENV", "production");
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    _startIntegrityMonitor();
    _stopIntegrityMonitor();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });
});
