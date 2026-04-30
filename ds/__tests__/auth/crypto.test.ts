import { describe, it, expect } from "vitest";
import {
  _hmacSign,
  _sha256,
  _obfuscateKey,
  _deobfuscateKey,
} from "@/ds/auth/crypto";

describe("crypto._sha256", () => {
  it("produces 64-char lowercase hex digest", async () => {
    const hash = await _sha256("hello");
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is deterministic for the same input", async () => {
    const a = await _sha256("license-key-001");
    const b = await _sha256("license-key-001");
    expect(a).toBe(b);
  });

  it("differs for different inputs", async () => {
    const a = await _sha256("a");
    const b = await _sha256("b");
    expect(a).not.toBe(b);
  });

  it("matches the known SHA-256 of empty string", async () => {
    const hash = await _sha256("");
    expect(hash).toBe(
      "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    );
  });
});

describe("crypto._hmacSign", () => {
  it("produces lowercase hex signature", async () => {
    const sig = await _hmacSign("payload", "secret");
    expect(sig).toMatch(/^[0-9a-f]+$/);
    expect(sig.length).toBe(64); // SHA-256 → 32 bytes → 64 hex
  });

  it("changes when message changes", async () => {
    const a = await _hmacSign("msg-a", "secret");
    const b = await _hmacSign("msg-b", "secret");
    expect(a).not.toBe(b);
  });

  it("changes when secret changes", async () => {
    const a = await _hmacSign("msg", "secret-1");
    const b = await _hmacSign("msg", "secret-2");
    expect(a).not.toBe(b);
  });
});

describe("crypto._obfuscateKey / _deobfuscateKey", () => {
  it("round-trips an ASCII key", () => {
    const original = "JUNDS-ABCD-1234-WXYZ-7890";
    const obf = _obfuscateKey(original);
    expect(_deobfuscateKey(obf)).toBe(original);
  });

  it("round-trips short keys", () => {
    const original = "x";
    expect(_deobfuscateKey(_obfuscateKey(original))).toBe(original);
  });

  it("does not produce the original verbatim", () => {
    const original = "JUNDS-ABCD-1234-WXYZ-7890";
    expect(_obfuscateKey(original)).not.toBe(original);
  });

  it("strips trailing '=' padding", () => {
    const obf = _obfuscateKey("ab"); // base64 of reversed "ba" = "YmE="
    expect(obf.includes("=")).toBe(false);
  });
});
