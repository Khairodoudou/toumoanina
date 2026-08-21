import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PublicChatbot from "@/components/layout/PublicChatbot";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer />
      <PublicChatbot />
    </>
  );
}

