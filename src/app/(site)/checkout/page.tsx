import { getStoreSettings } from "@/lib/queries";
import { CheckoutForm } from "@/components/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const settings = await getStoreSettings();
  const razorpayEnabled = Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET,
  );

  return (
    <CheckoutForm
      razorpayEnabled={razorpayEnabled}
      storeName={settings.storeName}
      storeNameMl={settings.storeNameMl}
    />
  );
}
