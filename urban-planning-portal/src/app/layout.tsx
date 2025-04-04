import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
            <Navigation />
            <div className="flex-1">
              <main className="p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
