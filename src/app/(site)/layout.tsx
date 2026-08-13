import { getStoreSettings } from "@/lib/queries";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { CartToast } from "@/components/cart-toast";
import { AnnouncementBar } from "@/components/announcement";
import { ScrollProgress } from "@/components/motion";
import { BottomNav } from "@/components/bottom-nav";
import { CartBar } from "@/components/cart-bar";

export const dynamic = "force-dynamic";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <>
      <ScrollProgress />
      <AnnouncementBar en={settings.announcementEn} ml={settings.announcementMl} />
      <Header storeName={settings.storeName} storeNameMl={settings.storeNameMl} />
      <main>{children}</main>
      <Footer storeName={settings.storeName} storeNameMl={settings.storeNameMl} />
      <CartDrawer />
      <CartToast />
      <BottomNav />
      <CartBar />
    </>
  );
}
