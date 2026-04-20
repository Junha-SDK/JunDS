"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { _validateLicense } from "./license-validator";
import { _isDomainAllowed, _isLocationTampered } from "./domain-lock";
import { _startIntegrityMonitor, _stopIntegrityMonitor } from "./integrity";

type LicenseStatus = "pending" | "valid" | "invalid" | "expired";

interface LicenseState {
  status: LicenseStatus;
  plan?: string;
  expiresAt?: string;
}

interface JunDSContextValue {
  license: LicenseState;
}

const JunDSContext = createContext<JunDSContextValue>({
  license: { status: "pending" },
});

const _REVALIDATION_INTERVAL = 1000 * 60 * 60; // 1시간마다 재검증

export interface JunDSProviderProps {
  licenseKey: string;
  children: ReactNode;
  fallback?: ReactNode;
  onLicenseError?: (status: LicenseStatus) => void;
}

export function JunDSProvider({
  licenseKey,
  children,
  fallback,
  onLicenseError,
}: JunDSProviderProps) {
  const [license, setLicense] = useState<LicenseState>({
    status: "pending",
  });
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const onErrorRef = useRef(onLicenseError);
  onErrorRef.current = onLicenseError;

  const verify = useCallback(async () => {
    // 도메인 변조 감지
    if (_isLocationTampered()) {
      setLicense({ status: "invalid" });
      onErrorRef.current?.("invalid");
      return;
    }

    const result = await _validateLicense(licenseKey);

    // 도메인 잠금 확인
    if (result.valid && !_isDomainAllowed(result.domains)) {
      setLicense({ status: "invalid" });
      onErrorRef.current?.("invalid");
      return;
    }

    const newStatus: LicenseStatus = result.valid
      ? result.expiresAt && new Date(result.expiresAt) < new Date()
        ? "expired"
        : "valid"
      : "invalid";

    setLicense({
      status: newStatus,
      plan: result.plan,
      expiresAt: result.expiresAt,
    });

    if (newStatus !== "valid") {
      onErrorRef.current?.(newStatus);
    }
  }, [licenseKey]);

  useEffect(() => {
    verify();

    // 주기적 재검증
    intervalRef.current = setInterval(verify, _REVALIDATION_INTERVAL);

    // 무결성 모니터 시작
    _startIntegrityMonitor((type) => {
      if (type === "repeated_violations") {
        setLicense({ status: "invalid" });
      }
    });

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      _stopIntegrityMonitor();
    };
  }, [verify]);

  if (license.status === "pending") {
    return <>{fallback ?? null}</>;
  }

  if (license.status === "invalid" || license.status === "expired") {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `[JunDS] License ${license.status}. Please check your license key.`
      );
    }
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#ef4444",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <p style={{ fontWeight: 600 }}>JunDS License {license.status === "expired" ? "Expired" : "Invalid"}</p>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Please verify your license at junds.dev
        </p>
      </div>
    );
  }

  return (
    <JunDSContext.Provider value={{ license }}>
      {children}
    </JunDSContext.Provider>
  );
}

export function useJunDS(): JunDSContextValue {
  const context = useContext(JunDSContext);
  if (!context) {
    throw new Error("useJunDS must be used within a JunDSProvider");
  }
  return context;
}

export function useLicenseStatus(): LicenseStatus {
  const { license } = useJunDS();
  return license.status;
}
