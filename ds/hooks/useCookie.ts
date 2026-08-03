"use client";
import { useCallback, useEffect, useState } from "react";

export interface CookieOptions {
  /** 만료 일수 (Date 직접 지정도 가능) */
  days?: number;
  /** 만료 시각 */
  expires?: Date;
  /** 경로 (기본 "/") */
  path?: string;
  /** 도메인 */
  domain?: string;
  /** Secure (HTTPS only) */
  secure?: boolean;
  /** SameSite */
  sameSite?: "Strict" | "Lax" | "None";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, opts: CookieOptions = {}) {
  if (typeof document === "undefined") return;
  let str = `${name}=${encodeURIComponent(value)}`;
  const expires =
    opts.expires ??
    (opts.days !== undefined ? new Date(Date.now() + opts.days * 86400000) : undefined);
  if (expires) str += `; expires=${expires.toUTCString()}`;
  str += `; path=${opts.path ?? "/"}`;
  if (opts.domain) str += `; domain=${opts.domain}`;
  if (opts.secure) str += `; secure`;
  if (opts.sameSite) str += `; samesite=${opts.sameSite}`;
  document.cookie = str;
}

function eraseCookie(name: string, opts: CookieOptions = {}) {
  writeCookie(name, "", { ...opts, days: -1 });
}

/**
 * 쿠키 read/write 훅 (consent storage, locale, theme 등).
 * @example
 * const [locale, setLocale, removeLocale] = useCookie("locale", "ko");
 * setLocale("en", { days: 365 });
 */
export function useCookie(
  name: string,
  initialValue: string | null = null,
  defaultOptions: CookieOptions = {},
): [string | null, (value: string, options?: CookieOptions) => void, () => void] {
  const [value, setValue] = useState<string | null>(() => readCookie(name) ?? initialValue);

  // re-sync if name changes
  useEffect(() => {
    setValue(readCookie(name) ?? initialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const set = useCallback(
    (v: string, options?: CookieOptions) => {
      writeCookie(name, v, { ...defaultOptions, ...options });
      setValue(v);
    },
    [name, defaultOptions],
  );

  const remove = useCallback(() => {
    eraseCookie(name, defaultOptions);
    setValue(null);
  }, [name, defaultOptions]);

  return [value, set, remove];
}
