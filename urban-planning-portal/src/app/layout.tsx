'use client';

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Providers } from "./providers";
import { metadata as importedMetadata } from "./metadata"; // Rename the import

const inter = Inter({ subsets: ["latin"] });

export const layoutMetadata: Metadata = { // Rename the local export
  title: "Plan For Tomorrow",
  description: "A comprehensive platform for urban planning professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen">
            <aside className="w-64 border-r p-4">
              <div className="mb-8">
                <h1 className="text-xl font-bold">Urban Planning Portal</h1>
              </div>
              <Navigation />
            </aside>
            <div className="flex-1">
              <main className="p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
