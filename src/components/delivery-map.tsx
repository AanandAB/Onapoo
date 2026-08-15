"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { MapOrder } from "@/lib/admin";

const STATUS_COLOR: Record<string, string> = {
  new: "#d97706", // amber
  confirmed: "#2563eb", // blue
  packed: "#7c3aed", // violet
  out_for_delivery: "#16a34a", // green
};

const STATUS_LABEL: Record<string, string> = {
  new: "New",
  confirmed: "Confirmed",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function makeIcon(color: string): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.45)"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -10],
  });
}

export function DeliveryMap({
  orders,
  center,
}: {
  orders: MapOrder[];
  center: [number, number];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { scrollWheelZoom: true });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markers = orders.map((o) => {
      const marker = L.marker([o.lat, o.lng], {
        icon: makeIcon(STATUS_COLOR[o.orderStatus] ?? "#6b7280"),
      });
      const status = STATUS_LABEL[o.orderStatus] ?? o.orderStatus;
      marker.bindPopup(
        `<div style="font-family:system-ui,sans-serif;font-size:13px;line-height:1.45;min-width:200px">
          <strong>${escapeHtml(o.customerName)}</strong><br/>
          <span style="color:#666">${escapeHtml(o.orderNumber)}</span><br/>
          <span style="color:#333">${escapeHtml(o.address)}</span><br/>
          <span style="color:#666">${escapeHtml(o.area ?? "")}${o.district ? ", " + escapeHtml(o.district) : ""} · ${escapeHtml(o.pincode)}</span><br/>
          <em style="color:#555">${escapeHtml(status)}${o.approximate ? " · approx. pincode" : ""}</em>
        </div>`,
      );
      return marker;
    });

    if (markers.length > 0) {
      L.featureGroup(markers).addTo(map);
      map.fitBounds(L.featureGroup(markers).getBounds().pad(0.3));
    } else {
      map.setView(center, 12);
    }

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [orders, center]);

  return <div ref={containerRef} className="h-[60vh] w-full overflow-hidden rounded-xl border border-ink/10" />;
}
