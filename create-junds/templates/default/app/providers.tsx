"use client";

import { JunDSProvider } from "@junds/ui";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  const licenseKey = process.env.NEXT_PUBLIC_JUNDS_LICENSE_KEY ?? "";

  return <JunDSProvider licenseKey={licenseKey}>{children}</JunDSProvider>;
}
