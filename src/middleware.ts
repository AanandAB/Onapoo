import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Canonical redirect: www.onapookkal.store → onapookkal.store (301).
export function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host.toLowerCase().startsWith("www.")) {
    const url = request.nextUrl.clone();
    url.hostname = host.replace(/^www\./i, "");
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  // Page routes only (skip static assets + API).
  matcher: ["/((?!_next/|api/|.*\\..*).*)"],
};
