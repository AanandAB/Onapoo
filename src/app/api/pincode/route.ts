import { NextResponse } from "next/server";

// Reverse pincode lookup → district + area (via India Post free API).
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = (url.searchParams.get("code") ?? "").trim();

  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ ok: false, error: "Enter a 6-digit pincode" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${code}`);
    if (!res.ok) return NextResponse.json({ ok: false, error: "Lookup failed" });
    const data = (await res.json()) as {
      PostOffice?: { Name: string; District: string; State: string; Pincode: string }[];
    }[];
    const po = data?.[0]?.PostOffice?.[0];
    if (!po) return NextResponse.json({ ok: false, error: "Pincode not found" });

    return NextResponse.json({
      ok: true,
      district: po.District,
      area: po.Name,
      state: po.State,
      pincode: po.Pincode,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Lookup failed" });
  }
}
