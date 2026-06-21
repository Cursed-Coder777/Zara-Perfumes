import { Footer } from "~/components/footer";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
