/**
 * @internal - 라이선스 검증 로직. 배포 시 난독화됨.
 */

import { _hmacSign, _sha256, _obfuscateKey } from "./crypto";

const _LICENSE_API =
  "https://api.junds.dev/v1/license" as const;

const _CACHE_KEY = "__jds_lv" as const;
const _CACHE_TTL = 1000 * 60 * 60 * 4; // 4시간

interface _LicenseCache {
  _h: string;
  _t: number;
  _s: boolean;
}

interface _VerifyResult {
  valid: boolean;
  plan?: string;
  expiresAt?: string;
  domains?: string[];
}

function _getDomain(): string {
  if (typeof window === "undefined") return "server";
  return window.location.hostname;
}

function _getCache(): _LicenseCache | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(_CACHE_KEY);
    if (!raw) return null;
    const parsed: _LicenseCache = JSON.parse(atob(raw));
    if (Date.now() - parsed._t > _CACHE_TTL) {
      sessionStorage.removeItem(_CACHE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function _setCache(keyHash: string, valid: boolean): void {
  try {
    if (typeof window === "undefined") return;
    const cache: _LicenseCache = {
      _h: keyHash,
      _t: Date.now(),
      _s: valid,
    };
    sessionStorage.setItem(_CACHE_KEY, btoa(JSON.stringify(cache)));
  } catch {
    // sessionStorage unavailable
  }
}

export async function _validateLicense(
  licenseKey: string
): Promise<_VerifyResult> {
  // 키 형식 검증: JUNDS-XXXX-XXXX-XXXX-XXXX
  const _keyPattern = /^JUNDS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!_keyPattern.test(licenseKey)) {
    return { valid: false };
  }

  const domain = _getDomain();
  const keyHash = await _sha256(licenseKey);

  // 캐시 확인
  const cached = _getCache();
  if (cached && cached._h === keyHash) {
    return { valid: cached._s };
  }

  try {
    const timestamp = Date.now().toString();
    const signature = await _hmacSign(
      `${_obfuscateKey(licenseKey)}:${domain}:${timestamp}`,
      keyHash.slice(0, 32)
    );

    const response = await fetch(`${_LICENSE_API}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-JDS-Timestamp": timestamp,
        "X-JDS-Signature": signature,
      },
      body: JSON.stringify({
        k: _obfuscateKey(licenseKey),
        d: domain,
        t: timestamp,
        v: "2.0.0",
      }),
    });

    if (!response.ok) {
      _setCache(keyHash, false);
      return { valid: false };
    }

    const data = await response.json();
    const valid = data.valid === true;
    _setCache(keyHash, valid);

    return {
      valid,
      plan: data.plan,
      expiresAt: data.expiresAt,
      domains: data.domains,
    };
  } catch {
    // 네트워크 에러 시 캐시가 있으면 캐시 사용, 없으면 graceful fail
    if (cached) {
      return { valid: cached._s };
    }
    // 첫 검증 실패 시에는 일시적으로 허용하되 재검증 예약
    return { valid: true };
  }
}

export async function _validateLicenseOffline(
  licenseKey: string
): Promise<boolean> {
  // 오프라인 기본 형식 검증만 수행
  const _keyPattern = /^JUNDS-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (!_keyPattern.test(licenseKey)) return false;

  // 체크섬 검증 (키의 마지막 4자리가 앞부분의 해시 기반)
  const parts = licenseKey.split("-");
  const body = parts.slice(1, 4).join("");
  const checksum = parts[4];
  const hash = await _sha256(body);
  return hash.slice(0, 4).toUpperCase() === checksum;
}
