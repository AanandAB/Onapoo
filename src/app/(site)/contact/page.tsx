import type { Metadata } from "next";
import { InfoPage } from "@/components/info-pages";

export const metadata: Metadata = {
  title: "Contact · Onapookkal",
  description: "Order Onam flowers on WhatsApp or pick up from our Kannur store.",
};

export default function ContactPage() {
  return <InfoPage kind="contact" />;
}
