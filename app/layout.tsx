import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { PluginSystemProvider } from "@/components/providers/PluginSystemProvider";
import { ApiClientProvider } from "@/components/providers/ApiClientProvider";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { Toaster } from "@/components/ui/sonner";
import { NetworkDetection } from "@/components/NetworkDetection";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-body" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export const metadata: Metadata = {
  title: "Routilux Overseer",
  description: "A small, beautiful, and extensible debugger for Routilux workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} font-sans`}>
        <PluginSystemProvider>
          <ApiClientProvider>
            <NetworkDetection />
            {children}
            <GlobalSearchModal />
            <Toaster position="bottom-right" richColors />
          </ApiClientProvider>
        </PluginSystemProvider>
      </body>
    </html>
  );
}
