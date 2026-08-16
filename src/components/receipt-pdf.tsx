"use client";

import { jsPDF } from "jspdf";

export type ReceiptOrder = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  pincode: string;
  landmark: string | null;
  deliveryMethod: "delivery" | "pickup";
  deliveryDate: string | null;
  createdAt: string;
  items: { name: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode: string | null;
  paymentMethod: string;
  paymentStatus: string;
};

const inr = (n: number) => "Rs. " + n.toLocaleString("en-IN");

export function ReceiptPdfButton({
  order,
  label = "Download PDF",
  className = "",
}: {
  order: ReceiptOrder;
  label?: string;
  className?: string;
}) {
  const download = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const M = 40;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text("Onapookkal", M, 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(110);
    doc.text("Onam flowers - Kannur, Kerala 670643", M, 70);
    doc.text("+91 70340 26295  |  onapookkal.store", M, 82);

    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("RECEIPT", W - M, 56, { align: "right" });
    doc.setFontSize(11);
    doc.text(order.orderNumber, W - M, 70, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(110);
    doc.text(
      new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      W - M,
      82,
      { align: "right" },
    );

    doc.setDrawColor(190);
    doc.line(M, 96, W - M, 96);

    // Billed to + delivery
    let y = 118;
    doc.setTextColor(30, 30, 30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("BILLED TO", M, y);
    doc.text("DELIVERY", W / 2 + 12, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.text(order.customerName, M, y + 15);
    doc.text(order.phone, M, y + 27);
    const deliv =
      order.deliveryMethod === "pickup"
        ? "Store pickup"
        : `${order.address}${order.landmark ? ", " + order.landmark : ""} - ${order.pincode}`;
    doc.text(deliv, W / 2 + 12, y + 15, { maxWidth: W - M - (W / 2 + 12) });
    if (order.deliveryDate) doc.text("Delivery day: " + order.deliveryDate, W / 2 + 12, y + 32);

    y += 56;

    // Items
    doc.setDrawColor(190);
    doc.line(M, y, W - M, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(110);
    doc.text("ITEM", M, y + 14);
    doc.text("QTY", W - 150, y + 14, { align: "right" });
    doc.text("AMOUNT", W - M, y + 14, { align: "right" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(30, 30, 30);
    y += 30;
    for (const it of order.items) {
      doc.text(it.name, M, y, { maxWidth: W - 210 });
      doc.text(String(it.qty), W - 150, y, { align: "right" });
      doc.text(inr(it.price * it.qty), W - M, y, { align: "right" });
      y += 16;
    }

    // Totals
    doc.setDrawColor(190);
    doc.line(M, y + 2, W - M, y + 2);
    y += 20;
    const row = (label: string, val: string, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(bold ? 12 : 10.5);
      doc.setTextColor(30, 30, 30);
      doc.text(label, W - 180, y);
      doc.text(val, W - M, y, { align: "right" });
      y += bold ? 20 : 16;
    };
    row("Subtotal", inr(order.subtotal));
    if (order.discount > 0) {
      row("Discount" + (order.couponCode ? " (" + order.couponCode + ")" : ""), "- " + inr(order.discount));
    }
    row("Delivery", order.deliveryCharge > 0 ? inr(order.deliveryCharge) : "Free");
    row("Total", inr(order.total), true);

    // Payment
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(110);
    doc.text("Payment: " + order.paymentMethod.toUpperCase() + " (" + order.paymentStatus + ")", M, y);

    // Footer
    y += 26;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(10);
    doc.text("Thank you for shopping with Onapookkal!", W / 2, y, { align: "center" });

    doc.save(`Onapookkal-${order.orderNumber}.pdf`);
  };

  return (
    <button type="button" onClick={download} className={className}>
      ⬇ {label}
    </button>
  );
}
