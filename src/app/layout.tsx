import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { MotionProvider } from "@/components/motion";
import { CartProvider } from "@/components/cart-context";

export const metadata: Metadata = {
  title: {
    default: "Onapookkal · ഓണപ്പൂക്കൾ — Fresh Onam Flowers, Kannur",
    template: "%s · Onapookkal",
  },
  description:
    "Fresh Onam flowers delivered across Kannur — traditional pookalam flowers, petal packs and daily pookalam kits for Atham to Thiruvonam.",
  keywords: ["Onam", "pookalam", "flowers", "Kannur", "Onapookkal", "ഓണം", "പൂക്കളം"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf6ec",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ml">
      <body className="bg-cream text-ink antialiased">
        <LanguageProvider>
          <MotionProvider>
            <CartProvider>{children}</CartProvider>
          </MotionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
