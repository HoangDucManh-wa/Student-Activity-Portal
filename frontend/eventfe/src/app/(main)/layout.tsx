import { Header } from "@/components/layouts/user/Header";
import { Footer } from "../../components/layouts/user/Footer";

export default function MainLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>
) {
  return (
    <>
     <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 mb-[40px]"> 
        {children}
      </main>
      <Footer />
    </div>
    </>
  );
}