import { getStoreSettings } from "@/lib/queries";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { CartToast } from "@/components/cart-toast";
import { AnnouncementBar } from "@/components/announcement";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <>
      <AnnouncementBar en={settings.announcementEn} ml={settings.announcementMl} />
      <Header storeName={settings.storeName} storeNameMl={settings.storeNameMl} />
      <main>{children}</main>
      <Footer storeName={settings.storeName} storeNameMl={settings.storeNameMl} />
      <CartDrawer />
      <CartToast />
    </>
  );
}
