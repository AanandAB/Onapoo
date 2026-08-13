import type { Metadata } from "next";
import { InfoPage } from "@/components/info-pages";

export const metadata: Metadata = {
  title: "FAQ · Onapookkal",
  description: "Delivery areas, Onam ordering, payment and freshness — common questions about Onapookkal.",
};

export default function FaqPage() {
  return <InfoPage kind="faq" />;
}
