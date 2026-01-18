import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { PluginSystemProvider } from "@/components/providers/PluginSystemProvider";
import { GlobalSearchModal } from "@/components/search/GlobalSearchModal";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <PluginSystemProvider>
          {children}
          <GlobalSearchModal />
          <Toaster position="bottom-right" richColors />
        </PluginSystemProvider>
      </body>
    </html>
  );
}
