import { getSession, listAllOrders } from "@/lib/admin";

export const runtime = "edge";

function cell(v: string | number | null | undefined): string {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const orders = await listAllOrders();

  const header = [
    "Order #",
    "Date",
    "Customer",
    "Phone",
    "Address",
    "Pincode",
    "Landmark",
    "Delivery date",
    "Delivery method",
    "Items",
    "Subtotal",
    "Delivery",
    "Total",
    "Payment method",
    "Payment status",
    "Order status",
    "Location",
    "Notes",
  ];

  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt.toISOString(),
    o.customerName,
    o.phone,
    o.address,
    o.pincode,
    o.landmark ?? "",
    o.deliveryDate ?? "",
    o.deliveryMethod ?? "delivery",
    o.items.map((i) => `${i.name} x${i.qty}`).join("; "),
    o.subtotal,
    o.deliveryCharge,
    o.total,
    o.paymentMethod,
    o.paymentStatus,
    o.orderStatus,
    o.location ?? "",
    o.notes ?? "",
  ]);

  const csv = [header, ...rows].map((r) => r.map(cell).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
