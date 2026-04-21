"use client";

import { type ComponentType } from "react";
import { useLicenseStatus } from "./JunDSProvider";

/**
 * 라이선스가 유효한 경우에만 컴포넌트를 렌더링하는 HOC.
 * 난독화 후 내부 로직이 보이지 않으므로 우회가 어려움.
 */
export function withLicense<P extends object>(
  WrappedComponent: ComponentType<P>,
  componentName?: string
) {
  const displayName =
    componentName ||
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    "Component";

  function LicensedComponent(props: P) {
    const status = useLicenseStatus();

    if (status !== "valid") {
      if (process.env.NODE_ENV === "development" && status === "invalid") {
        return (
          <div
            style={{
              border: "2px dashed #ef4444",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "12px",
              color: "#ef4444",
              fontFamily: "monospace",
            }}
          >
            [{displayName}] requires a valid JunDS license
          </div>
        );
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  }

  LicensedComponent.displayName = `Licensed(${displayName})`;

  return LicensedComponent;
}
