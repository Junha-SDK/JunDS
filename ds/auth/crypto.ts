/**
 * @internal - 내부 암호화 유틸리티. 배포 시 난독화됨.
 */

const _encoder = new TextEncoder();

export async function _hmacSign(message: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    _encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, _encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function _sha256(data: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", _encoder.encode(data));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function _obfuscateKey(key: string): string {
  return btoa(key.split("").reverse().join("")).replace(/=/g, "").split("").reverse().join("");
}

export function _deobfuscateKey(obfuscated: string): string {
  const padded = obfuscated.split("").reverse().join("");
  const padding = "=".repeat((4 - (padded.length % 4)) % 4);
  return atob(padded + padding)
    .split("")
    .reverse()
    .join("");
}
