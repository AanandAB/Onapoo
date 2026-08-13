import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug, getStoreSettings } from "@/lib/queries";
import { ProductDetail } from "@/components/product-detail";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Not found" };
  return {
    title: `${p.nameEn} · Onapookkal`,
    description: p.descriptionEn ?? undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const settings = await getStoreSettings();
  return <ProductDetail product={product} deliveryCharge={settings.deliveryCharge} />;
}
