import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@shared/styles/globals.css';
import { Toaster } from '@shared/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Portal',
  description: 'Urban Planning Professionals Admin Portal',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
