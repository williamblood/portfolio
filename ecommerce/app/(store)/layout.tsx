import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <CartDrawer />
      {/* pt accounts for announcement bar (32px) + nav (72px) on desktop, nav only (64px) on mobile */}
      <main className="pt-16 md:pt-[104px] min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
