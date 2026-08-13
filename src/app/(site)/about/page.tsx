import type { Metadata } from "next";
import { InfoPage } from "@/components/info-pages";

export const metadata: Metadata = {
  title: "About · Onapookkal",
  description: "Onapookkal — a local Kannur flower shop delivering fresh flowers and pookalam kits for Onam.",
};

export default function AboutPage() {
  return <InfoPage kind="about" />;
}
