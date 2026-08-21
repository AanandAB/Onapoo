"use client";

import { createContext, useContext, type ReactNode } from "react";

// Live product stock (id -> available quantity), fetched server-side in the site
// layout and passed down so client components can cap cart quantities against the
// CURRENT stock — not the value captured when the item was first added.
const StockContext = createContext<Record<string, number>>({});

export function StockProvider({
  stocks,
  children,
}: {
  stocks: Record<string, number>;
  children: ReactNode;
}) {
  return <StockContext.Provider value={stocks}>{children}</StockContext.Provider>;
}

export function useStock(): Record<string, number> {
  return useContext(StockContext);
}
