"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PublicChatbot from "@/components/layout/PublicChatbot";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center pt-28 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-hero min-h-[calc(100vh-80px)]">
        {children}
      </main>
      <Footer />
      <PublicChatbot />
    </>
  );
}

