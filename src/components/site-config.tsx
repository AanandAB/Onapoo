"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_ORDERING_START, isOrderingOpenFor, formatOrderingDate } from "@/lib/site";

type SiteConfig = {
  orderingStart: string;
};

const SiteConfigCtx = createContext<SiteConfig>({ orderingStart: DEFAULT_ORDERING_START });

export function SiteConfigProvider({
  orderingStart,
  children,
}: {
  orderingStart?: string | null;
  children: ReactNode;
}) {
  const value: SiteConfig = { orderingStart: orderingStart?.trim() || DEFAULT_ORDERING_START };
  return <SiteConfigCtx.Provider value={value}>{children}</SiteConfigCtx.Provider>;
}

// Whether ordering is currently open, using the admin-configurable date.
export function useOrderingOpen(): boolean {
  const { orderingStart } = useContext(SiteConfigCtx);
  return isOrderingOpenFor(orderingStart);
}

// Human label for the ordering-open date, e.g. "21 August".
export function useOrderingOpenLabel(): string {
  const { orderingStart } = useContext(SiteConfigCtx);
  return formatOrderingDate(orderingStart);
}
