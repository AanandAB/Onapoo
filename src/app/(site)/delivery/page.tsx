import type { Metadata } from "next";
import { InfoPage } from "@/components/info-pages";

export const metadata: Metadata = {
  title: "Delivery & Shipping · Onapookkal",
  description: "Delivery areas, charges, timing and the freshness promise for Onam flower delivery in Kannur.",
};

export default function DeliveryPage() {
  return <InfoPage kind="delivery" />;
}
