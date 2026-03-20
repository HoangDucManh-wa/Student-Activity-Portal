import { Header } from "@/components/layouts/user/Header";
import { Footer } from "../../components/layouts/user/Footer";
import { AuthRefreshProvider } from "@/components/layouts/AuthRefreshProvider";
import { ChatBot } from "@/components/ui-custom/ChatBot";

export default function MainLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>
) {
  return (
    <AuthRefreshProvider>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 mb-[40px]">
          {children}
        </main>
        <Footer />
        <ChatBot />
      </div>
    </AuthRefreshProvider>
  );
}