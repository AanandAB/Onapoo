import { getCategories, getProducts } from "@/lib/queries";
import { Hero } from "@/components/hero";
import { Marquee } from "@/components/marquee";
import { HowItWorks } from "@/components/how-it-works";
import { Catalog } from "@/components/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, products] = await Promise.all([getCategories(), getProducts()]);

  return (
    <>
      <Hero />
      <Marquee />
      <HowItWorks />
      <Catalog products={products} categories={categories} />
    </>
  );
}
