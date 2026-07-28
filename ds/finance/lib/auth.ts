/**
 * 초대제 단일-소유자 인증.
 *
 * 모델
 * - 소유자: BM_OWNER_PASSWORD를 알고 있는 사람. 모든 페이지 + /admin 접근.
 * - 게스트: 소유자가 /admin에서 발급한 토큰(URL)을 가진 사람. /admin 외 일반 페이지만 접근.
 *
 * 토큰 구조 (URL-safe base64)
 *   payload = { sub: "owner"|"guest", iat: number, exp: number, name?: string, jti?: string }
 *   signature = HMAC-SHA256(BM_AUTH_SECRET, base64url(payload))
 *   cookie value = `${b64payload}.${b64signature}`
 *
 * Edge runtime 호환: 표준 Web Crypto(SubtleCrypto) + TextEncoder만 사용.
 */

export type Role = "owner" | "guest";

export interface AuthClaims {
  sub: Role;
  iat: number;
  exp: number;
  /** 게스트 토큰을 식별/표시할 때 쓰는 라벨 */
  name?: string;
  /** Token id, 가능하면 unique */
  jti?: string;
}

export const COOKIE_NAME = "bm_auth";
export const OWNER_TTL_SECONDS = 60 * 60 * 24 * 30; // 30일
export const GUEST_TTL_SECONDS_DEFAULT = 60 * 60 * 24 * 7; // 7일

function b64urlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);
  let s = "";
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): Uint8Array {
  const pad = (4 - (s.length % 4)) % 4;
  const norm = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  const bin = atob(norm);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;
  let out = 0;
  for (let i = 0; i < a.byteLength; i++) out |= a[i] ^ b[i];
  return out === 0;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function getSecret(): string {
  // 개발 시 secret이 빠지면 의미 있는 에러로 빠르게 실패. 배포 시는 반드시 설정해야 함.
  const s = process.env.BM_AUTH_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV !== "production") {
      // dev fallback — 동일 머신 내에서만 유효
      return "dev-buttermoney-secret-please-change";
    }
    throw new Error("BM_AUTH_SECRET (>=16 chars) is required in production");
  }
  return s;
}

export async function signToken(claims: AuthClaims): Promise<string> {
  const key = await importKey(getSecret());
  const payload = b64urlEncode(new TextEncoder().encode(JSON.stringify(claims)));
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return `${payload}.${b64urlEncode(sig)}`;
}

export async function verifyToken(token: string): Promise<AuthClaims | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const payload = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  let key: CryptoKey;
  try {
    key = await importKey(getSecret());
  } catch {
    return null;
  }
  const expected = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  let sig: Uint8Array;
  try {
    sig = b64urlDecode(sigB64);
  } catch {
    return null;
  }
  if (!timingSafeEqual(new Uint8Array(expected), sig)) return null;
  let claims: AuthClaims;
  try {
    claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payload)));
  } catch {
    return null;
  }
  if (
    typeof claims !== "object" ||
    !claims ||
    (claims.sub !== "owner" && claims.sub !== "guest") ||
    typeof claims.exp !== "number"
  ) {
    return null;
  }
  if (Math.floor(Date.now() / 1000) >= claims.exp) return null;
  return claims;
}

export async function issueOwnerToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return signToken({ sub: "owner", iat: now, exp: now + OWNER_TTL_SECONDS });
}

export async function issueGuestToken(opts: {
  name?: string;
  ttlSeconds?: number;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const jti = `g_${now.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  return signToken({
    sub: "guest",
    iat: now,
    exp: now + (opts.ttlSeconds ?? GUEST_TTL_SECONDS_DEFAULT),
    name: opts.name,
    jti,
  });
}

/** 평문 비밀번호와 BM_OWNER_PASSWORD를 상수시간 비교 */
export function checkOwnerPassword(input: string): boolean {
  const expected = process.env.BM_OWNER_PASSWORD ?? "";
  if (!expected) return false;
  if (input.length !== expected.length) return false;
  let out = 0;
  for (let i = 0; i < input.length; i++) {
    out |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return out === 0;
}
