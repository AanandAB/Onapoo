"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_ORDERING_START, formatOrderingDate } from "@/lib/site";

type SiteConfig = {
  orderingStart: string;
  // Computed on the server and passed down as a prop so the client never calls
  // `new Date()` during render — avoids a hydration mismatch on the boundary day.
  orderingOpen: boolean;
};

const SiteConfigCtx = createContext<SiteConfig>({
  orderingStart: DEFAULT_ORDERING_START,
  orderingOpen: false,
});

export function SiteConfigProvider({
  orderingStart,
  orderingOpen,
  children,
}: {
  orderingStart?: string | null;
  orderingOpen?: boolean;
  children: ReactNode;
}) {
  const value: SiteConfig = {
    orderingStart: orderingStart?.trim() || DEFAULT_ORDERING_START,
    orderingOpen: orderingOpen ?? false,
  };
  return <SiteConfigCtx.Provider value={value}>{children}</SiteConfigCtx.Provider>;
}

// Whether ordering is currently open (computed server-side; stable on client).
export function useOrderingOpen(): boolean {
  return useContext(SiteConfigCtx).orderingOpen;
}

// Human label for the ordering-open date, e.g. "21 August".
export function useOrderingOpenLabel(): string {
  return formatOrderingDate(useContext(SiteConfigCtx).orderingStart);
}
