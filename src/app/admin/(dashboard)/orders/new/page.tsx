import { requireAdmin } from "@/lib/admin";
import { getProducts, getStoreSettings } from "@/lib/queries";
import { ManualOrderForm } from "@/components/manual-order-form";

export default async function NewOrderPage() {
  await requireAdmin();
  const [products, settings] = await Promise.all([getProducts(), getStoreSettings()]);

  return (
    <ManualOrderForm
      deliveryCharge={settings.deliveryCharge}
      products={products.map((p) => ({
        id: p.id,
        name: p.nameEn,
        nameMl: p.nameMl,
        price: p.price,
      }))}
    />
  );
}
