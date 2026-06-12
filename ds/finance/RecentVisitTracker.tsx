"use client";

import { useEffect } from "react";
import { recordVisit } from "./lib/recentlyViewed";

interface RecentVisitTrackerProps {
  name: string;
}

export function RecentVisitTracker({ name }: RecentVisitTrackerProps) {
  useEffect(() => {
    if (name) recordVisit(decodeURIComponent(name));
  }, [name]);
  return null;
}
