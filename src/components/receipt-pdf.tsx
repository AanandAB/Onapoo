"use client";

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
  items: { name: string; nameMl?: string; qty: number; price: number }[];
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode: string | null;
  paymentMethod: string;
  paymentStatus: string;
};

// ₹ symbol + Indian digit grouping, rendered by the browser (so it always
// comes out correct, unlike jsPDF's Latin-only default fonts).
const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

// Latin first, with a Malayalam-capable fallback stack so customer names,
// addresses and product nameMl shape correctly via the browser's own stack.
const FONT =
  "'Plus Jakarta Sans', 'Noto Sans Malayalam', 'Manjari', 'Nirmala UI', 'Segoe UI', system-ui, sans-serif";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReceiptHtml(order: ReceiptOrder): string {
  const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const deliv =
    order.deliveryMethod === "pickup"
      ? "Store pickup · സ്റ്റോർ പിക്കപ്പ്"
      : `${order.address}${order.landmark ? ", " + order.landmark : ""} – ${order.pincode}`;

  const itemRows = order.items
    .map(
      (it) => `
      <tr>
        <td style="padding:5px 0;vertical-align:top;">
          <span style="font-weight:500;">${esc(it.name)}</span>${
            it.nameMl && it.nameMl !== it.name
              ? `<div style="font-size:10px;color:#6b6b6b;">${esc(it.nameMl)}</div>`
              : ""
          }
        </td>
        <td style="padding:5px 0;text-align:right;width:52px;vertical-align:top;">${it.qty}</td>
        <td style="padding:5px 0;text-align:right;width:112px;vertical-align:top;">${inr(it.price * it.qty)}</td>
      </tr>`,
    )
    .join("");

  const discountRow =
    order.discount > 0
      ? `<div style="display:flex;justify-content:space-between;padding:2px 0;">
           <span style="color:#2f7d32;">Discount${order.couponCode ? ` (${esc(order.couponCode)})` : ""}</span>
           <span style="color:#2f7d32;">− ${inr(order.discount)}</span>
         </div>`
      : "";

  return `
  <div style="width:595px;padding:38px 42px;background:#ffffff;color:#1f1f1f;font-family:${FONT};box-sizing:border-box;line-height:1.4;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;">
      <div>
        <div style="font-size:26px;font-weight:700;">Onapookkal <span style="color:#c07a1f;">ഓണപ്പൂക്കൾ</span></div>
        <div style="font-size:10px;color:#6b6b6b;margin-top:3px;">Fresh Onam flowers · Kannur, Kerala 670643</div>
        <div style="font-size:10px;color:#6b6b6b;">+91 70340 26295 · onapookkal.store</div>
      </div>
      <div style="text-align:right;flex-shrink:0;">
        <div style="font-size:15px;font-weight:700;letter-spacing:1px;">RECEIPT · രസീത്</div>
        <div style="font-size:11px;font-weight:700;margin-top:5px;">${esc(order.orderNumber)}</div>
        <div style="font-size:10px;color:#6b6b6b;margin-top:2px;">${date}</div>
      </div>
    </div>

    <div style="height:1px;background:#e3e3e3;margin:20px 0;"></div>

    <div style="display:flex;gap:28px;">
      <div style="flex:1;">
        <div style="font-size:9px;font-weight:700;color:#6b6b6b;letter-spacing:1px;">BILLED TO</div>
        <div style="font-size:12px;font-weight:600;margin-top:6px;">${esc(order.customerName)}</div>
        <div style="font-size:10.5px;color:#444;margin-top:2px;">${esc(order.phone)}</div>
      </div>
      <div style="flex:1.4;">
        <div style="font-size:9px;font-weight:700;color:#6b6b6b;letter-spacing:1px;">DELIVERY</div>
        <div style="font-size:11px;margin-top:6px;">${esc(deliv)}</div>
        ${order.deliveryDate ? `<div style="font-size:10.5px;color:#444;margin-top:2px;">Delivery day: ${esc(order.deliveryDate)}</div>` : ""}
      </div>
    </div>

    <div style="height:1px;background:#e3e3e3;margin:18px 0 8px;"></div>

    <table style="width:100%;border-collapse:collapse;font-size:11px;">
      <tr style="font-size:9px;font-weight:700;color:#6b6b6b;letter-spacing:1px;">
        <td style="padding:4px 0;">ITEM</td>
        <td style="padding:4px 0;text-align:right;width:52px;">QTY</td>
        <td style="padding:4px 0;text-align:right;width:112px;">AMOUNT</td>
      </tr>
      ${itemRows}
    </table>

    <div style="height:1px;background:#e3e3e3;margin:10px 0 12px;"></div>

    <div style="margin-left:auto;width:270px;font-size:11px;">
      <div style="display:flex;justify-content:space-between;padding:2px 0;">
        <span style="color:#555;">Subtotal</span><span>${inr(order.subtotal)}</span>
      </div>
      ${discountRow}
      <div style="display:flex;justify-content:space-between;padding:2px 0;">
        <span style="color:#555;">Delivery</span><span>${order.deliveryCharge > 0 ? inr(order.deliveryCharge) : "Free"}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:7px 0 2px;font-size:14px;font-weight:700;border-top:1px solid #e3e3e3;margin-top:5px;">
        <span>Total</span><span>${inr(order.total)}</span>
      </div>
    </div>

    <div style="margin-top:16px;font-size:9.5px;color:#6b6b6b;">Payment: ${esc(order.paymentMethod.toUpperCase())} (${esc(order.paymentStatus)})</div>

    <div style="text-align:center;font-size:10px;color:#555;margin-top:26px;">
      നന്ദി! Thank you for shopping with Onapookkal 🌼<br>
      Track your order: onapookkal.store/track
    </div>
  </div>`;
}

export function ReceiptPdfButton({
  order,
  label = "Download PDF",
  className = "",
  title,
}: {
  order: ReceiptOrder;
  label?: string;
  className?: string;
  title?: string;
}) {
  const download = async () => {
    // Dynamic imports so the PDF tooling only loads when the admin actually
    // clicks "PDF bill" (keeps the admin bundle lean).
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import("html2canvas-pro"),
      import("jspdf"),
    ]);

    const host = document.createElement("div");
    host.style.position = "fixed";
    host.style.left = "-10000px";
    host.style.top = "0";
    host.style.zIndex = "-1";
    host.innerHTML = buildReceiptHtml(order);
    document.body.appendChild(host);

    try {
      if (document.fonts?.ready) await document.fonts.ready;

      const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const ratio = pageW / canvas.width; // px -> pt
      const contentH = canvas.height * ratio;
      const pages = Math.max(1, Math.ceil(contentH / pageH));

      for (let p = 0; p < pages; p++) {
        if (p > 0) doc.addPage();
        const srcY = p * (pageH / ratio);
        const srcH = Math.min(canvas.height - srcY, pageH / ratio);

        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = Math.max(1, Math.ceil(srcH));
        const ctx = slice.getContext("2d")!;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, slice.width, slice.height);
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);

        doc.addImage(slice.toDataURL("image/png"), "PNG", 0, 0, pageW, srcH * ratio);
      }

      doc.save(`Onapookkal-${order.orderNumber}.pdf`);
    } finally {
      host.remove();
    }
  };

  return (
    <button type="button" onClick={download} className={className} title={title}>
      ⬇ {label}
    </button>
  );
}
