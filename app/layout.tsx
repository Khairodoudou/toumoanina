import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { AuthProvider } from "@/lib/auth/AuthContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ToumAnina — طُمَأْنِينَة",
    template: "%s | ToumAnina",
  },
  description:
    "Application d'accompagnement des personnes atteintes d'Alzheimer et de leurs familles. Localisation, suivi d'humeur, activités adaptées — tout en un.",
  keywords: [
    "Alzheimer",
    "accompagnement",
    "famille",
    "aidant",
    "géolocalisation",
    "suivi",
    "طمأنينة",
    "مرض الزهايمر",
    "رعاية المسنين",
  ],
  authors: [{ name: "ToumAnina" }],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ToumAnina",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${cairo.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased bg-bg text-text">
        <AuthProvider>
          <I18nProvider>{children}</I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
